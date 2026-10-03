# KingDC – Sistem Administrasi Turnamen Sepak Bola

Aplikasi React + Express. Data di **Supabase Postgres**, dokumen/foto di **Supabase Storage**.

## 1. Siapkan Supabase (sekali saja)
1. Buat project di https://supabase.com (pilih region **Singapore** agar cepat dari Indonesia).
2. Buka **SQL Editor** → tempel isi `supabase/schema.sql` → **Run**.
3. Salin `.env.example` menjadi `.env`, isi `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`.
4. Bucket Storage `tournament-documents` dibuat otomatis oleh server saat upload pertama.

## 2. Jalankan
```bash
npm install
npm run dev          # pengembangan (http://localhost:3000)

npm run build        # produksi: buat folder dist
npm start            # melayani dist (cepat, ber-cache, gzip)
```

## 3. Deploy (hosting Node.js)
Gunakan Render / Railway / Fly.io / Cloud Run (aplikasi butuh server Node karena ada folder `server.ts`).
- Build command: `npm install && npm run build`
- Start command: `npm start`
- Environment variables: isi seperti `.env.example`.

## Catatan performa
- Foto pemain, KTP, BPJS, dan dokumen **diunggah langsung ke Supabase Storage**; database hanya menyimpan URL.
- Modul berat (portal pendaftaran, jadwal, dokumen, modal cetak) dimuat saat dibutuhkan.
- Respons di-gzip, aset ber-hash di-cache 1 tahun.
- Free plan Supabase **menjeda project setelah 7 hari tanpa aktivitas**; buka aplikasi minimal sekali seminggu
  atau pakai plan Pro menjelang hari turnamen.

## Keamanan (WAJIB dibaca sebelum dipublikasikan)
Lihat laporan pemeriksaan: login admin masih di sisi klien dan endpoint API belum memerlukan autentikasi.
Jangan dibuka ke publik sebelum bagian itu diperbaiki.
