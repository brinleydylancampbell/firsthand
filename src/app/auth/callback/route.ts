import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { ensureWorkspace } from "@/lib/workspace";
import { appUrl } from "@/lib/utils";

/**
 * Handles both magic link shapes: PKCE (?code=) and token hash
 * (?token_hash=&type=email) for projects with a customised email template.
 * Then provisions or joins a workspace and sends the user on.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const join = url.searchParams.get("join") === "demo";
  const nextParam = url.searchParams.get("next") ?? "/app";
  const next = nextParam.startsWith("/") ? nextParam : "/app";

  const supabase = await createClient();

  let userId: string | null = null;
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) userId = data.user?.id ?? null;
  } else if (tokenHash && type) {
    const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) userId = data.user?.id ?? null;
  }

  if (!userId) {
    return NextResponse.redirect(appUrl("/login?error=link"));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) await ensureWorkspace(user, { joinDemo: join });

  return NextResponse.redirect(appUrl(next));
}
