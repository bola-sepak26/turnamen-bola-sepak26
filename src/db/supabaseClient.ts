import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { randomUUID } from 'node:crypto';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
// Kunci SECRET/service_role hanya boleh ada di server (.env), jangan pernah di kode klien.
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || 'missing-supabase-key';

if (!process.env.SUPABASE_URL || !(process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_PUBLISHABLE_KEY)) {
  console.warn('[supabase] SUPABASE_URL / SUPABASE_SECRET_KEY belum diatur di .env — upload dokumen tidak akan berfungsi.');
}

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export const DEFAULT_STORAGE_BUCKET = 'tournament-documents';

/**
 * Pastikan bucket penyimpanan ada di Supabase Storage
 */
const verifiedBuckets = new Set<string>();

export async function ensureStorageBucket(bucketName: string = DEFAULT_STORAGE_BUCKET): Promise<boolean> {
  // Cukup dicek sekali per proses; sebelumnya dicek di SETIAP upload (2 request tambahan, membuat upload lambat)
  if (verifiedBuckets.has(bucketName)) return true;
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) {
      console.warn('Supabase storage.listBuckets warning:', error.message);
      return false;
    }

    const exists = buckets?.some((b) => b.name === bucketName);
    if (!exists) {
      console.log(`Membuat Supabase storage bucket '${bucketName}'...`);
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 15728640, // 15MB
      });
      if (createError) {
        console.warn('Warning creating bucket:', createError.message);
      }
    } else {
      // Update bucket to ensure public access & unrestricted mime types
      await supabase.storage.updateBucket(bucketName, {
        public: true,
        fileSizeLimit: 15728640,
        allowedMimeTypes: undefined,
      });
    }
    verifiedBuckets.add(bucketName);
    return true;
  } catch (err) {
    console.warn('Error in ensureStorageBucket:', err);
    return false;
  }
}

/**
 * Unggah file buffer / base64 ke Supabase Storage
 */
export async function uploadToSupabaseStorage({
  fileBuffer,
  fileName,
  contentType,
  bucketName = DEFAULT_STORAGE_BUCKET,
}: {
  fileBuffer: Buffer;
  fileName: string;
  contentType: string;
  bucketName?: string;
}): Promise<{ url: string; path: string; error?: string }> {
  try {
    await ensureStorageBucket(bucketName);

    // Sanitasi nama file & tambahkan timestamp agar unik
    const cleanName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `docs/${Date.now()}_${randomUUID().slice(0, 8)}_${cleanName}`;

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(storagePath, fileBuffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error('Supabase upload error:', error.message);
      return { url: '', path: '', error: error.message };
    }

    const { data: publicData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    return {
      url: publicData.publicUrl,
      path: data.path,
    };
  } catch (err: any) {
    console.error('Exception uploading to Supabase Storage:', err);
    return { url: '', path: '', error: err.message || 'Upload failed' };
  }
}

/**
 * Uji koneksi ke Supabase
 */
export async function testSupabaseHealth(): Promise<{
  connected: boolean;
  url: string;
  bucket: string;
  message: string;
}> {
  try {
    const { data, error } = await supabase.storage.listBuckets();
    if (error) {
      return {
        connected: false,
        url: SUPABASE_URL,
        bucket: DEFAULT_STORAGE_BUCKET,
        message: error.message,
      };
    }
    return {
      connected: true,
      url: SUPABASE_URL,
      bucket: DEFAULT_STORAGE_BUCKET,
      message: `Terhubung ke Supabase Project (${data.length} buckets tersedia)`,
    };
  } catch (err: any) {
    return {
      connected: false,
      url: SUPABASE_URL,
      bucket: DEFAULT_STORAGE_BUCKET,
      message: err.message || 'Koneksi gagal',
    };
  }
}


/**
 * Buat signed upload URL agar browser dapat mengunggah file LANGSUNG ke Supabase Storage
 * (tanpa melewati server ini). Nama file diberi komponen acak agar URL tidak mudah ditebak.
 */
export async function createSignedUpload(fileName: string, bucketName: string = DEFAULT_STORAGE_BUCKET) {
  await ensureStorageBucket(bucketName);
  const cleanName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-80);
  const storagePath = `docs/${Date.now()}_${randomUUID().slice(0, 8)}_${cleanName}`;

  const { data, error } = await supabase.storage.from(bucketName).createSignedUploadUrl(storagePath);
  if (error || !data) {
    throw new Error(error?.message || 'Gagal membuat signed upload URL');
  }
  const { data: pub } = supabase.storage.from(bucketName).getPublicUrl(storagePath);

  return {
    bucket: bucketName,
    path: data.path || storagePath,
    token: data.token,
    publicUrl: pub.publicUrl,
    supabaseUrl: SUPABASE_URL,
    // Publishable/anon key memang dirancang publik; JANGAN kirim SECRET key ke browser.
    publishableKey: process.env.SUPABASE_PUBLISHABLE_KEY || '',
  };
}
