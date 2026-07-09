// src/utils/supabase/storage.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

/**
 * Uploads a file to Supabase storage bucket or converts to Base64 data URL as fallback.
 */
export async function uploadProjectScreenshot(file: File, studentId: string): Promise<string> {
  if (supabase) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${studentId}_${Math.random().toString(36).substring(2, 10)}.${fileExt}`;
      const filePath = `showcase/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('project-showcase')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('project-showcase').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (err) {
      console.warn('Supabase storage upload failed, using Base64 fallback:', err);
    }
  }

  // Fallback: Convert to Base64 Data URL for local storage compatibility
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
