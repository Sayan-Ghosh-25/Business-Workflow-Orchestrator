// src/services/storageService.ts
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;
const BUCKET = process.env.SUPABASE_BUCKET;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE || !BUCKET) {
  throw new Error("Supabase env vars not set");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

export async function uploadFile(buffer: Buffer, destPath: string, contentType = "application/pdf") {
  const { data, error } = await supabase.storage.from(BUCKET as string).upload(destPath, buffer, {
    contentType,
    upsert: false
  });
  if (error) throw error;
  const { data: publicData } = supabase.storage.from(BUCKET as string).getPublicUrl(destPath);
  return { data, publicUrl: publicData.publicUrl };
}
