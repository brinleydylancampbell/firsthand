import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/**
 * Service role client. Bypasses row level security, so it is only used by
 * public pages, the widget route, the webhook and cron, and every query it
 * runs filters explicitly on status = 'approved' and consent_public where the
 * result is public. Never import this from a Client Component.
 */
export function adminClient(): SupabaseClient {
  if (client) return client;
  client = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  return client;
}
