-- Firsthand: initial schema
-- Testimonials collected by interview, with consent and provenance built in.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Workspaces and membership
-- ---------------------------------------------------------------------------
create table public.workspace (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) between 2 and 40),
  brand jsonb not null default '{}'::jsonb,
  is_demo boolean not null default false,
  webhook_secret text not null default encode(gen_random_bytes(24), 'hex'),
  ask_delay_days int not null default 3 check (ask_delay_days between 0 and 60),
  ask_mode text not null default 'draft' check (ask_mode in ('draft', 'live')),
  ask_subject text,
  ask_body text,
  provenance_default boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.workspace_member (
  workspace_id uuid not null references public.workspace(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);
create index workspace_member_user_idx on public.workspace_member(user_id);

-- True when the signed-in user belongs to the workspace. Used by every policy.
create or replace function public.is_member(ws uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.workspace_member m
    where m.workspace_id = ws and m.user_id = auth.uid()
  );
$$;
revoke all on function public.is_member(uuid) from public;
grant execute on function public.is_member(uuid) to authenticated, anon, service_role;

-- ---------------------------------------------------------------------------
-- Forms
-- ---------------------------------------------------------------------------
create table public.form (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspace(id) on delete cascade,
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  intro text,
  questions jsonb not null default '[]'::jsonb,
  incentive text,
  thank_you text,
  mode text not null default 'chat' check (mode in ('chat', 'classic')),
  voice_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  unique (workspace_id, slug)
);

-- ---------------------------------------------------------------------------
-- Testimonials
-- ---------------------------------------------------------------------------
create table public.testimonial (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspace(id) on delete cascade,
  form_id uuid references public.form(id) on delete set null,
  author_name text,
  author_role text,
  author_company text,
  author_url text,
  author_email text,                      -- private, never rendered publicly
  avatar_url text,
  rating smallint check (rating between 1 and 5),
  body text not null default '',
  raw_transcript jsonb,                   -- [{ role: 'interviewer' | 'customer', text }]
  source text not null check (source in ('interview', 'classic', 'import')),
  status text not null default 'draft' check (status in ('draft', 'pending', 'approved', 'hidden')),
  featured boolean not null default false,
  sort_order int not null default 0,
  tags jsonb not null default '[]'::jsonb,
  objection text check (objection in ('price', 'trust', 'time', 'switching', 'fit')),
  outcome text,
  highlight text,
  highlight_mode text not null default 'none' check (highlight_mode in ('none', 'bold', 'only')),
  identity_mode text not null default 'full' check (identity_mode in ('full', 'first_role', 'anonymous')),
  consent_public boolean not null default false,
  consent_at timestamptz,
  consent_text text,
  provenance jsonb not null default '{}'::jsonb, -- { type, source_url, order_ref, ask_id }
  provenance_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Nothing without consent can be approved. Enforced here, not just in the UI.
  constraint approved_requires_consent check (status <> 'approved' or consent_public)
);
create index testimonial_ws_status_idx on public.testimonial(workspace_id, status, sort_order, created_at desc);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
create trigger testimonial_touch before update on public.testimonial
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Asks: scheduled interview invitations created by the webhook
-- ---------------------------------------------------------------------------
create table public.ask (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspace(id) on delete cascade,
  form_id uuid references public.form(id) on delete set null,
  email text not null,
  name text,
  order_ref text,
  delivered_at timestamptz,
  send_at timestamptz not null,
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'sent', 'completed', 'cancelled')),
  token text not null unique default encode(gen_random_bytes(16), 'hex'),
  sent_at timestamptz,
  created_at timestamptz not null default now()
);
create index ask_due_idx on public.ask(status, send_at);
create index ask_ws_idx on public.ask(workspace_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Widgets and daily view rollups
-- ---------------------------------------------------------------------------
create table public.widget (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspace(id) on delete cascade,
  name text not null default 'Untitled widget',
  type text not null check (type in ('wall', 'carousel', 'single', 'badge')),
  config jsonb not null default '{}'::jsonb,
  view_count bigint not null default 0,
  created_at timestamptz not null default now()
);
create index widget_ws_idx on public.widget(workspace_id);

create table public.widget_view (
  widget_id uuid not null references public.widget(id) on delete cascade,
  day date not null,
  count int not null default 0,
  primary key (widget_id, day)
);

-- One call per embed load. Rolls up by day; no per-hit rows, no visitor data.
create or replace function public.record_widget_view(w uuid)
returns void
language plpgsql security definer
set search_path = public
as $$
begin
  insert into public.widget_view (widget_id, day, count)
  values (w, (now() at time zone 'utc')::date, 1)
  on conflict (widget_id, day) do update set count = public.widget_view.count + 1;
  update public.widget set view_count = view_count + 1 where id = w;
end;
$$;
revoke all on function public.record_widget_view(uuid) from public;
grant execute on function public.record_widget_view(uuid) to service_role;

-- ---------------------------------------------------------------------------
-- Row level security
-- Dashboard traffic uses the user's session and these policies.
-- Public pages, the webhook, cron and the widget route use the service role
-- with explicit status = 'approved' and consent_public filters in code.
-- ---------------------------------------------------------------------------
alter table public.workspace enable row level security;
alter table public.workspace_member enable row level security;
alter table public.form enable row level security;
alter table public.testimonial enable row level security;
alter table public.ask enable row level security;
alter table public.widget enable row level security;
alter table public.widget_view enable row level security;

create policy "members read workspace" on public.workspace
  for select to authenticated using (public.is_member(id));
create policy "members update workspace" on public.workspace
  for update to authenticated using (public.is_member(id)) with check (public.is_member(id));

create policy "members read membership" on public.workspace_member
  for select to authenticated using (public.is_member(workspace_id));

create policy "members manage forms" on public.form
  for all to authenticated using (public.is_member(workspace_id)) with check (public.is_member(workspace_id));

create policy "members manage testimonials" on public.testimonial
  for all to authenticated using (public.is_member(workspace_id)) with check (public.is_member(workspace_id));

create policy "members manage asks" on public.ask
  for all to authenticated using (public.is_member(workspace_id)) with check (public.is_member(workspace_id));

create policy "members manage widgets" on public.widget
  for all to authenticated using (public.is_member(workspace_id)) with check (public.is_member(workspace_id));

create policy "members read widget views" on public.widget_view
  for select to authenticated
  using (exists (select 1 from public.widget w where w.id = widget_id and public.is_member(w.workspace_id)));

-- Storage buckets (avatars, brand) are created by the app on first use via the
-- Storage API, so this migration also works on a fresh local stack where the
-- storage schema does not exist yet.
