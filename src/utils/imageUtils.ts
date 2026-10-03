/**
 * Utilities for client-side image compression and upload.
 * compressAndUpload: kompres gambar lalu unggah ke Supabase Storage dan kembalikan URL-nya
 * (database hanya menyimpan URL pendek, bukan base64 berukuran besar).
 */
import { uploadBlobToStorage } from './storageUpload.ts';

export function compressImageFile(file: File, maxWidth = 400, maxHeight = 400, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('Gagal memuat gambar'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Kompres gambar lalu unggah ke Supabase Storage. Mengembalikan URL publik.
 * Jika upload gagal (mis. Supabase belum dikonfigurasi / offline), mengembalikan Data URL
 * sebagai cadangan agar aplikasi tetap berfungsi.
 */
export async function compressAndUpload(
  file: File,
  maxWidth = 400,
  maxHeight = 400,
  quality = 0.85
): Promise<string> {
  const dataUrl = await compressImageFile(file, maxWidth, maxHeight, quality);
  try {
    const blob = await (await fetch(dataUrl)).blob();
    const base = (file.name || 'image').replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40) || 'image';
    const res = await uploadBlobToStorage(blob, `${base}.jpg`, 'image/jpeg');
    if (res.url) return res.url;
    console.warn('Upload gambar gagal, memakai data URL sementara:', res.error);
  } catch (err) {
    console.warn('Upload gambar gagal, memakai data URL sementara:', err);
  }
  return dataUrl;
}
