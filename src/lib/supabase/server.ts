import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Session-bound client for Server Components, Server Actions and Route
 * Handlers. Row level security applies. Cookie writes are best effort:
 * Server Components cannot set cookies, and the proxy refreshes them anyway.
 */
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component. Safe to ignore.
          }
        },
      },
    },
  );
}
