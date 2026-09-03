import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { adminClient } from "@/lib/supabase/admin";

const MAX_BYTES = 6 * 1024 * 1024;

/**
 * Accepts one image, resizes it to 128px square, stores it as WebP in the
 * public avatars bucket and returns the URL. Used by both public forms and
 * the dashboard's inline edit.
 */
export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "Attach an image file." }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return Response.json({ error: "Only images are accepted." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ error: "Images must be under 6 MB." }, { status: 413 });
  }

  let buffer: Buffer;
  try {
    buffer = await sharp(Buffer.from(await file.arrayBuffer()))
      .rotate()
      .resize(128, 128, { fit: "cover", position: "attention" })
      .webp({ quality: 82 })
      .toBuffer();
  } catch {
    return Response.json({ error: "That file could not be read as an image." }, { status: 400 });
  }

  const path = `${randomUUID()}.webp`;
  const admin = adminClient();
  const { error } = await admin.storage.from("avatars").upload(path, buffer, {
    contentType: "image/webp",
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) {
    return Response.json({ error: "Upload failed. Try again." }, { status: 500 });
  }
  const { data } = admin.storage.from("avatars").getPublicUrl(path);
  return Response.json({ url: data.publicUrl });
}
