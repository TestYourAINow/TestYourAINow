// lib/uploadFile.ts
import { supabase } from "./supabase";

export async function uploadFile(file: File, bucket: string, path: string) {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false, // pas overwrite si même nom
  });

  if (error) throw error;
  return data;
}
