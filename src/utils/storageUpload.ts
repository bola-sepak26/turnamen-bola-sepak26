import { uploadToSupabaseStorageApi } from './api.ts';

export interface UploadResult {
  url: string;
  path?: string;
  error?: string;
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsDataURL(blob);
  });
}

/**
 * Unggah file LANGSUNG dari browser ke Supabase Storage memakai signed upload URL.
 * File tidak lewat server Node (lebih cepat, hemat memori, tidak ada overhead base64 +33%).
 * Jika gagal, otomatis mencoba jalur cadangan lewat server (/api/storage/upload).
 * Yang disimpan di database hanya URL, bukan isi file.
 */
export async function uploadBlobToStorage(
  blob: Blob,
  fileName: string,
  contentType?: string
): Promise<UploadResult> {
  const type = contentType || blob.type || 'application/octet-stream';

  try {
    const signRes = await fetch('/api/storage/sign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName }),
    });
    if (!signRes.ok) {
      const err = await signRes.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${signRes.status}`);
    }
    const { bucket, path, token, publicUrl, supabaseUrl, publishableKey } = await signRes.json();

    // supabase-js dimuat hanya saat ada upload (tidak membebani loading awal)
    const { createClient } = await import('@supabase/supabase-js');
    const client = createClient(supabaseUrl, publishableKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error } = await client.storage.from(bucket).uploadToSignedUrl(path, token, blob, {
      contentType: type,
    });
    if (error) throw error;
    return { url: publicUrl, path };
  } catch (directErr) {
    console.warn('Upload langsung gagal, mencoba lewat server:', directErr);
    try {
      const base64Data = await blobToDataUrl(blob);
      const res = await uploadToSupabaseStorageApi({ base64Data, fileName, contentType: type });
      if (res?.url) return { url: res.url, path: res.path };
      return { url: '', error: res?.error || 'Upload gagal' };
    } catch (proxyErr: any) {
      return { url: '', error: proxyErr?.message || 'Upload gagal' };
    }
  }
}
