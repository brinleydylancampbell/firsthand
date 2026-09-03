"use server";

import { redirect } from "next/navigation";
import { adminClient } from "@/lib/supabase/admin";
import { resolveAvatar } from "@/lib/avatar";
import { consentText, type IdentityMode } from "@/lib/types";
import { safeUrl } from "@/lib/utils";

export type SubmitState = { message: string } | null;

const identityModes: IdentityMode[] = ["full", "first_role", "anonymous"];

/** Public. Writes a pending testimonial from the classic form. */
export async function submitClassic(_prev: SubmitState, fd: FormData): Promise<SubmitState> {
  const workspaceId = String(fd.get("workspace_id") ?? "");
  const formId = String(fd.get("form_id") ?? "");
  const wsSlug = String(fd.get("ws_slug") ?? "");
  const formSlug = String(fd.get("form_slug") ?? "");
  const askToken = String(fd.get("ask") ?? "") || null;

  const body = String(fd.get("body") ?? "").trim();
  const author_name = String(fd.get("author_name") ?? "").trim() || null;
  const author_role = String(fd.get("author_role") ?? "").trim() || null;
  const author_company = String(fd.get("author_company") ?? "").trim() || null;
  const author_email = String(fd.get("author_email") ?? "").trim().toLowerCase() || null;
  const author_url = safeUrl(String(fd.get("author_url") ?? "").trim() || null);
  const ratingRaw = Number(fd.get("rating"));
  const rating = ratingRaw >= 1 && ratingRaw <= 5 ? ratingRaw : null;
  const uploaded = String(fd.get("avatar_url") ?? "").trim() || null;
  const identity = String(fd.get("identity_mode") ?? "full") as IdentityMode;
  const consent = fd.get("consent") === "on";

  if (body.length < 10) return { message: "Write at least a sentence or two." };
  if (identity !== "anonymous" && !author_name) return { message: "Add your name, or choose to stay anonymous." };
  if (!identityModes.includes(identity)) return { message: "Choose how you want to be shown." };
  if (!consent) return { message: "Tick the consent box so we know we can publish it." };

  const admin = adminClient();
  const { data: ws } = await admin.from("workspace").select("id, name").eq("id", workspaceId).maybeSingle();
  if (!ws) return { message: "This form is no longer available." };

  let ask: { id: string; order_ref: string | null } | null = null;
  if (askToken) {
    const { data } = await admin.from("ask").select("id, order_ref").eq("token", askToken).eq("workspace_id", ws.id).maybeSingle();
    ask = data ?? null;
  }

  const avatar_url = await resolveAvatar({ uploaded, website: author_url, email: author_email });

  const { data: inserted, error } = await admin
    .from("testimonial")
    .insert({
      workspace_id: ws.id,
      form_id: formId || null,
      author_name,
      author_role,
      author_company,
      author_email,
      author_url,
      avatar_url,
      rating,
      body,
      source: "classic",
      status: "pending",
      identity_mode: identity,
      consent_public: true,
      consent_at: new Date().toISOString(),
      consent_text: consentText(ws.name),
      provenance: { type: "classic", order_ref: ask?.order_ref ?? null, ask_id: ask?.id ?? null },
    })
    .select("id")
    .single();

  if (error || !inserted) return { message: "Something went wrong saving your words. Please try again." };
  if (ask) await admin.from("ask").update({ status: "completed" }).eq("id", ask.id);

  redirect(`/f/${wsSlug}/${formSlug}/thanks/${inserted.id}`);
}

/** Public. Finishes an interview: the approved draft becomes a pending testimonial. */
export async function submitInterview(_prev: SubmitState, fd: FormData): Promise<SubmitState> {
  const id = String(fd.get("id") ?? "");
  const wsSlug = String(fd.get("ws_slug") ?? "");
  const formSlug = String(fd.get("form_slug") ?? "");
  const askToken = String(fd.get("ask") ?? "") || null;

  const body = String(fd.get("body") ?? "").trim();
  const author_name = String(fd.get("author_name") ?? "").trim() || null;
  const author_role = String(fd.get("author_role") ?? "").trim() || null;
  const author_company = String(fd.get("author_company") ?? "").trim() || null;
  const author_email = String(fd.get("author_email") ?? "").trim().toLowerCase() || null;
  const author_url = safeUrl(String(fd.get("author_url") ?? "").trim() || null);
  const ratingRaw = Number(fd.get("rating"));
  const rating = ratingRaw >= 1 && ratingRaw <= 5 ? ratingRaw : null;
  const uploaded = String(fd.get("avatar_url") ?? "").trim() || null;
  const identity = String(fd.get("identity_mode") ?? "full") as IdentityMode;
  const consent = fd.get("consent") === "on";

  let transcript: unknown = null;
  try {
    transcript = JSON.parse(String(fd.get("transcript") ?? "null"));
  } catch {
    transcript = null;
  }

  if (!id) return { message: "This interview has expired. Start again." };
  if (body.length < 10) return { message: "The testimonial needs at least a sentence." };
  if (identity !== "anonymous" && !author_name) return { message: "Add your name, or choose to stay anonymous." };
  if (!identityModes.includes(identity)) return { message: "Choose how you want to be shown." };
  if (!consent) return { message: "Tick the consent box so we know we can publish it." };

  const admin = adminClient();
  const { data: ws } = await admin.from("workspace").select("id, name").eq("slug", wsSlug).maybeSingle();
  if (!ws) return { message: "This form is no longer available." };

  const { data: draft } = await admin
    .from("testimonial")
    .select("id, status, provenance")
    .eq("id", id)
    .eq("workspace_id", ws.id)
    .maybeSingle();
  if (!draft || draft.status !== "draft") return { message: "This interview was already submitted." };

  const avatar_url = await resolveAvatar({ uploaded, website: author_url, email: author_email });

  const { error } = await admin
    .from("testimonial")
    .update({
      author_name,
      author_role,
      author_company,
      author_email,
      author_url,
      avatar_url,
      rating,
      body,
      raw_transcript: Array.isArray(transcript) ? transcript : undefined,
      status: "pending",
      identity_mode: identity,
      consent_public: true,
      consent_at: new Date().toISOString(),
      consent_text: consentText(ws.name),
    })
    .eq("id", id);
  if (error) return { message: "Something went wrong saving your words. Please try again." };

  const askId = (draft.provenance as { ask_id?: string } | null)?.ask_id;
  if (askId) await admin.from("ask").update({ status: "completed" }).eq("id", askId);
  else if (askToken) await admin.from("ask").update({ status: "completed" }).eq("token", askToken).eq("workspace_id", ws.id);

  redirect(`/f/${wsSlug}/${formSlug}/thanks/${id}`);
}
