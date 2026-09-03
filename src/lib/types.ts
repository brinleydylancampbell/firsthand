export type Objection = "price" | "trust" | "time" | "switching" | "fit";

export const OBJECTIONS: Objection[] = ["price", "trust", "time", "switching", "fit"];

/** Chip labels shown on the wall and in widgets. */
export const OBJECTION_LABELS: Record<Objection, string> = {
  price: "Worried about price",
  trust: "Needed to trust us first",
  time: "Short on time",
  switching: "Switched from something else",
  fit: "Unsure it would fit",
};

export type IdentityMode = "full" | "first_role" | "anonymous";
export type TestimonialStatus = "draft" | "pending" | "approved" | "hidden";
export type TestimonialSource = "interview" | "classic" | "import";
export type HighlightMode = "none" | "bold" | "only";
export type FormMode = "chat" | "classic";
export type WidgetType = "wall" | "carousel" | "single" | "badge";
export type Theme = "light" | "dark" | "auto";
export type AskMode = "draft" | "live";
export type AskStatus = "draft" | "scheduled" | "sent" | "completed" | "cancelled";

export type InterviewTurn = { role: "interviewer" | "customer"; text: string };

export type Brand = {
  logo_url?: string | null;
  accent?: string | null;
  font?: "sans" | "serif" | null;
};

export type Provenance = {
  type?: TestimonialSource;
  source_url?: string | null;
  source_label?: string | null;
  order_ref?: string | null;
  ask_id?: string | null;
};

export type Workspace = {
  id: string;
  name: string;
  slug: string;
  brand: Brand;
  is_demo: boolean;
  webhook_secret: string;
  ask_delay_days: number;
  ask_mode: AskMode;
  ask_subject: string | null;
  ask_body: string | null;
  provenance_default: boolean;
  created_at: string;
};

export type Form = {
  id: string;
  workspace_id: string;
  slug: string;
  title: string;
  intro: string | null;
  questions: string[];
  incentive: string | null;
  thank_you: string | null;
  mode: FormMode;
  voice_enabled: boolean;
  created_at: string;
};

export type Testimonial = {
  id: string;
  workspace_id: string;
  form_id: string | null;
  author_name: string | null;
  author_role: string | null;
  author_company: string | null;
  author_url: string | null;
  author_email: string | null;
  avatar_url: string | null;
  rating: number | null;
  body: string;
  raw_transcript: InterviewTurn[] | null;
  source: TestimonialSource;
  status: TestimonialStatus;
  featured: boolean;
  sort_order: number;
  tags: string[];
  objection: Objection | null;
  outcome: string | null;
  highlight: string | null;
  highlight_mode: HighlightMode;
  identity_mode: IdentityMode;
  consent_public: boolean;
  consent_at: string | null;
  consent_text: string | null;
  provenance: Provenance;
  provenance_public: boolean;
  created_at: string;
  updated_at: string;
};

/** The subset of a testimonial that is safe to render publicly. */
export type PublicTestimonial = Pick<
  Testimonial,
  | "id"
  | "avatar_url"
  | "rating"
  | "body"
  | "source"
  | "featured"
  | "tags"
  | "objection"
  | "outcome"
  | "highlight"
  | "highlight_mode"
  | "provenance_public"
  | "created_at"
> & {
  display_name: string;
  display_meta: string | null;
  verified: boolean;
  source_label: string | null;
};

export type WidgetFilters = {
  tags?: string[];
  objection?: Objection | null;
  minRating?: number | null;
  featuredOnly?: boolean;
};

export type WidgetConfig = {
  filters: WidgetFilters;
  count: number;
  theme: Theme;
  showSource?: boolean;
  showRating?: boolean;
  showProvenance?: boolean;
  badgeText?: string;
};

export type Widget = {
  id: string;
  workspace_id: string;
  name: string;
  type: WidgetType;
  config: WidgetConfig;
  view_count: number;
  created_at: string;
};

export type Ask = {
  id: string;
  workspace_id: string;
  form_id: string | null;
  email: string;
  name: string | null;
  order_ref: string | null;
  delivered_at: string | null;
  send_at: string;
  status: AskStatus;
  token: string;
  sent_at: string | null;
  created_at: string;
};

export const DEFAULT_QUESTIONS: string[] = [
  "What was going on before you found us?",
  "What nearly stopped you going ahead?",
  "What actually changed once you started?",
  "Who would you tell about this?",
];

export const DEFAULT_WIDGET_CONFIG: WidgetConfig = {
  filters: {},
  count: 6,
  theme: "auto",
  showSource: true,
  showRating: true,
  showProvenance: false,
};

export function consentText(workspaceName: string): string {
  return `I agree that ${workspaceName} may publish this testimonial on their website, in embedded widgets on sites they control, and in their marketing. I can ask for it to be removed at any time.`;
}

/**
 * Applies the identity choice the customer made. The dashboard sees the
 * full record; everything public goes through here.
 */
export function publicIdentity(t: Testimonial): {
  display_name: string;
  display_meta: string | null;
  verified: boolean;
} {
  const first = (t.author_name ?? "").trim().split(/\s+/)[0] || "";
  switch (t.identity_mode) {
    case "anonymous":
      return { display_name: "Verified customer", display_meta: null, verified: true };
    case "first_role":
      return {
        display_name: first || "Verified customer",
        display_meta: t.author_role ?? null,
        verified: !first,
      };
    case "full":
    default: {
      const meta = [t.author_role, t.author_company].filter(Boolean).join(", ");
      return {
        display_name: t.author_name?.trim() || "Verified customer",
        display_meta: meta || null,
        verified: !t.author_name,
      };
    }
  }
}

export function toPublic(t: Testimonial): PublicTestimonial {
  const id = publicIdentity(t);
  return {
    id: t.id,
    avatar_url: t.identity_mode === "anonymous" ? null : t.avatar_url,
    rating: t.rating,
    body: t.body,
    source: t.source,
    featured: t.featured,
    tags: t.tags ?? [],
    objection: t.objection,
    outcome: t.outcome,
    highlight: t.highlight,
    highlight_mode: t.highlight_mode,
    provenance_public: t.provenance_public,
    created_at: t.created_at,
    source_label: t.provenance?.source_label ?? null,
    ...id,
  };
}
