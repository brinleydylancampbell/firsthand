import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureWorkspace } from "@/lib/workspace";
import { appUrl } from "@/lib/utils";

/**
 * One click into the demo. Signs the visitor in anonymously (a real session,
 * so row level security applies as normal), joins the shared demo workspace,
 * and lands them in the dashboard. Anonymous users are removed nightly.
 */
export async function GET() {
  const supabase = await createClient();

  const {
    data: { user: existing },
  } = await supabase.auth.getUser();
  if (existing) {
    await ensureWorkspace(existing, { joinDemo: true });
    return NextResponse.redirect(appUrl("/app"));
  }

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error || !data.user) {
    return NextResponse.redirect(appUrl("/login?error=demo"));
  }
  await ensureWorkspace(data.user, { joinDemo: true });
  return NextResponse.redirect(appUrl("/app"));
}
