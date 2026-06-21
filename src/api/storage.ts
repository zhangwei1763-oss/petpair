import { supabase, isSupabaseConfigured } from './client';

const BUCKET_NAME = 'pet-photos';

// 上传图片到 Supabase Storage
export async function uploadImage(file: File, path: string): Promise<string | null> {
  if (!isSupabaseConfigured) {
    // Mock: convert to base64
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });
  if (error) throw error;

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

// 删除图片
export async function deleteImage(path: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([path]);
  if (error) throw error;
}

// 获取图片公开 URL
export function getPublicUrl(path: string): string {
  if (!isSupabaseConfigured) return path;
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path);
  return data.publicUrl;
}
