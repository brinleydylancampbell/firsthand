import type { SupabaseClient } from "@supabase/supabase-js";

const BUCKETS = ["avatars", "brand"] as const;
let ensured: Promise<void> | null = null;

/**
 * Public buckets for avatars and logos. Created through the Storage API on
 * first use rather than in SQL, so a fresh local stack and a hosted project
 * behave the same. Public buckets need no read policy; writes only ever come
 * from the server with the service role.
 */
export function ensureBuckets(admin: SupabaseClient): Promise<void> {
  ensured ??= (async () => {
    const { data } = await admin.storage.listBuckets();
    const have = new Set((data ?? []).map((b) => b.name));
    for (const name of BUCKETS) {
      if (!have.has(name)) {
        const { error } = await admin.storage.createBucket(name, { public: true, fileSizeLimit: "6MB" });
        if (error && !/already exists/i.test(error.message)) throw error;
      }
    }
  })().catch((err) => {
    ensured = null;
    throw err;
  });
  return ensured;
}
