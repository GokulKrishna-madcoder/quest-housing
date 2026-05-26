import imageCompression from 'browser-image-compression';
import { supabase } from './supabase';

export interface UploadOptions {
  bucket: string;
  path?: string;
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
}

export async function uploadMedia(file: File, options: UploadOptions): Promise<string> {
  const { bucket, path = '', maxSizeMB = 1, maxWidthOrHeight = 1920 } = options;

  let compressed = file;
  if (file.type.startsWith('image/')) {
    compressed = await imageCompression(file, {
      maxSizeMB,
      maxWidthOrHeight,
      useWebWorker: true,
    });
  }

  const ext = file.name.split('.').pop();
  const fileName = `${path}${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(fileName, compressed);
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return data.publicUrl;
}
