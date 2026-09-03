import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { adminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/** Owner only. Logo scaled to 112px tall, transparent PNG preserved. */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Sign in first." }, { status: 401 });

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || !file.type.startsWith("image/")) return Response.json({ error: "Attach an image." }, { status: 400 });
  if (file.size > 4 * 1024 * 1024) return Response.json({ error: "Logos must be under 4 MB." }, { status: 413 });

  let buffer: Buffer;
  try {
    buffer = await sharp(Buffer.from(await file.arrayBuffer())).resize({ height: 112, withoutEnlargement: true }).png().toBuffer();
  } catch {
    return Response.json({ error: "That file could not be read as an image." }, { status: 400 });
  }

  const path = `${user.id}/${randomUUID()}.png`;
  const admin = adminClient();
  const { error } = await admin.storage.from("brand").upload(path, buffer, { contentType: "image/png", cacheControl: "31536000" });
  if (error) return Response.json({ error: "Upload failed." }, { status: 500 });
  return Response.json({ url: admin.storage.from("brand").getPublicUrl(path).data.publicUrl });
}
