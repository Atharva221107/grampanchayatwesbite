import { supabase } from '@/lib/supabaseClient';

const BUCKET = 'uploads';

export type UploadProgress = (percent: number) => void;

function getExt(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
}

function generatePath(folder: string, filename: string): string {
  const ext = getExt(filename);
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  return `${folder}/${unique}${ext ? '.' + ext : ''}`;
}

export async function uploadFile(
  file: File,
  folder: string,
  onProgress?: UploadProgress
): Promise<{ url: string; path: string } | null> {
  const filePath = generatePath(folder, file.name);

  onProgress?.(10);

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Upload error:', error.message);
    return null;
  }

  onProgress?.(80);

  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(data.path);

  onProgress?.(100);

  return { url: urlData.publicUrl, path: data.path };
}

export async function deleteFile(path: string): Promise<boolean> {
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) {
    console.error('Delete error:', error.message);
    return false;
  }
  return true;
}

export function pathFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const parts = u.pathname.split(`/object/public/${BUCKET}/`);
    return parts[1] || null;
  } catch {
    return null;
  }
}

export async function deleteFileFromUrl(url: string): Promise<boolean> {
  const path = pathFromUrl(url);
  if (!path) return false;
  return deleteFile(path);
}

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const ALLOWED_PDF_TYPES = ['application/pdf'];
export const ALLOWED_NOTICE_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

export function validateFileType(file: File, allowed: string[]): boolean {
  return allowed.includes(file.type);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
