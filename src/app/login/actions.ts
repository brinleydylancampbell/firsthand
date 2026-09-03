"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { appUrl } from "@/lib/utils";

export type LoginState = { ok: boolean; message: string; email?: string } | null;

export async function sendMagicLink(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const join = formData.get("join") === "demo";
  const next = String(formData.get("next") ?? "/app");

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { ok: false, message: "That does not look like an email address." };
  }

  const params = new URLSearchParams({ next });
  if (join) params.set("join", "demo");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: appUrl(`/auth/callback?${params.toString()}`) },
  });

  if (error) {
    return {
      ok: false,
      message:
        error.status === 429
          ? "Too many links requested. Wait a minute and try again."
          : "The link could not be sent. Check the address and try again.",
    };
  }
  return { ok: true, message: "Check your inbox.", email };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
