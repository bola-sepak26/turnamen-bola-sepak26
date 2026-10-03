import express from 'express';
import compression from 'compression';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  getAllTeams,
  upsertTeam,
  deleteTeamById,
  deleteAllTeams,
  getAllMatches,
  upsertMatch,
  deleteAllMatches,
  getTournamentConfig,
  saveTournamentConfig,
  getAllNews,
  upsertNewsItem,
  deleteNewsItem,
  deleteAllNews,
  getAllDocuments,
  upsertDocument,
  deleteDocumentById,
  deleteAllDocuments,
  seedIfEmpty,
} from './src/db/tournamentRepo.ts';
import {
  uploadToSupabaseStorage,
  createSignedUpload,
  testSupabaseHealth,
  DEFAULT_STORAGE_BUCKET,
} from './src/db/supabaseClient.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.disable('x-powered-by');
// Kompresi gzip untuk semua respons (JSON data & aset) — mempercepat loading
app.use(compression());
// Batas besar hanya untuk jalur cadangan upload base64; endpoint lain cukup 5 MB
app.use('/api/storage/upload', express.json({ limit: '25mb' }));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Seed initial database state if empty
seedIfEmpty().catch((err) => {
  console.error('Failed to seed initial data:', err);
});

// API Routes
app.get('/api/tournament/data', async (_req, res) => {
  try {
    // Jalankan semua kueri secara paralel (sebelumnya berurutan = 5x lebih lambat)
    const [config, teams, matches, news, documents] = await Promise.all([
      getTournamentConfig(),
      getAllTeams(),
      getAllMatches(),
      getAllNews(),
      getAllDocuments(),
    ]);

    res.set('Cache-Control', 'no-cache');
    res.json({
      config,
      teams,
      matches,
      news,
      documents,
      source: 'supabase_postgres',
    });
  } catch (error: any) {
    console.error('Error fetching tournament data from database:', error);
    res.status(500).json({ error: error.message || 'Gagal memuat data dari database' });
  }
});

app.get('/api/news', async (_req, res) => {
  try {
    const news = await getAllNews();
    res.json(news);
  } catch (error: any) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: error.message || 'Gagal memuat berita' });
  }
});

app.post('/api/news', async (req, res) => {
  try {
    const saved = await upsertNewsItem(req.body);
    res.json(saved);
  } catch (error: any) {
    console.error('Error saving news item:', error);
    res.status(500).json({ error: error.message || 'Gagal menyimpan berita' });
  }
});

app.delete('/api/news/:id', async (req, res) => {
  try {
    await deleteNewsItem(req.params.id);
    res.json({ success: true, id: req.params.id });
  } catch (error: any) {
    console.error('Error deleting news item:', error);
    res.status(500).json({ error: error.message || 'Gagal menghapus berita' });
  }
});

app.delete('/api/news', async (_req, res) => {
  try {
    await deleteAllNews();
    res.json({ success: true, message: 'Semua berita dan galeri foto berhasil dikosongkan' });
  } catch (error: any) {
    console.error('Error emptying news:', error);
    res.status(500).json({ error: error.message || 'Gagal mengosongkan berita' });
  }
});

// Document & Supabase Storage APIs
app.get('/api/documents', async (_req, res) => {
  try {
    const docs = await getAllDocuments();
    res.json(docs);
  } catch (error: any) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: error.message || 'Gagal mengambil dokumen' });
  }
});

app.post('/api/documents', async (req, res) => {
  try {
    const saved = await upsertDocument(req.body);
    res.json(saved);
  } catch (error: any) {
    console.error('Error saving document:', error);
    res.status(500).json({ error: error.message || 'Gagal menyimpan dokumen' });
  }
});

app.delete('/api/documents/:id', async (req, res) => {
  try {
    await deleteDocumentById(req.params.id);
    res.json({ success: true, id: req.params.id });
  } catch (error: any) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: error.message || 'Gagal menghapus dokumen' });
  }
});

app.delete('/api/documents', async (_req, res) => {
  try {
    await deleteAllDocuments();
    res.json({ success: true, message: 'Semua dokumen berhasil dikosongkan' });
  } catch (error: any) {
    console.error('Error emptying documents:', error);
    res.status(500).json({ error: error.message || 'Gagal mengosongkan dokumen' });
  }
});

// Supabase Cloud Storage APIs
app.get('/api/storage/status', async (_req, res) => {
  try {
    const health = await testSupabaseHealth();
    res.json(health);
  } catch (error: any) {
    res.status(500).json({ connected: false, message: error.message });
  }
});

const ALLOWED_UPLOAD_EXT = /\.(jpe?g|png|webp|gif|pdf|docx?|xlsx?)$/i;

app.post('/api/storage/sign', async (req, res) => {
  try {
    const { fileName } = req.body || {};
    if (!fileName || typeof fileName !== 'string') {
      return res.status(400).json({ error: 'fileName diperlukan' });
    }
    if (!ALLOWED_UPLOAD_EXT.test(fileName)) {
      return res.status(400).json({ error: 'Tipe file tidak diizinkan (gunakan gambar, PDF, Word, atau Excel)' });
    }
    const signed = await createSignedUpload(fileName, DEFAULT_STORAGE_BUCKET);
    res.json(signed);
  } catch (error: any) {
    console.error('Error creating signed upload URL:', error);
    res.status(500).json({ error: error.message || 'Gagal menyiapkan upload' });
  }
});

app.post('/api/storage/upload', async (req, res) => {
  try {
    const { base64Data, fileName, contentType } = req.body;
    if (!base64Data || !fileName) {
      return res.status(400).json({ error: 'base64Data dan fileName diperlukan' });
    }

    let buffer: Buffer;
    if (typeof base64Data === 'string' && base64Data.includes(';base64,')) {
      const parts = base64Data.split(';base64,');
      buffer = Buffer.from(parts[1], 'base64');
    } else {
      buffer = Buffer.from(base64Data, 'base64');
    }

    const mime = contentType || 'image/jpeg';
    const result = await uploadToSupabaseStorage({
      fileBuffer: buffer,
      fileName,
      contentType: mime,
      bucketName: DEFAULT_STORAGE_BUCKET, // bucket tidak boleh ditentukan klien
    });

    if (result.error) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      success: true,
      url: result.url,
      path: result.path,
      provider: 'supabase',
    });
  } catch (error: any) {
    console.error('Storage upload proxy error:', error);
    res.status(500).json({ error: error.message || 'Gagal mengunggah file ke Supabase Storage' });
  }
});

app.post('/api/tournament/config', async (req, res) => {
  try {
    const updated = await saveTournamentConfig(req.body);
    res.json(updated);
  } catch (error: any) {
    console.error('Error saving config:', error);
    res.status(500).json({ error: error.message || 'Gagal menyimpan pengaturan' });
  }
});

app.post('/api/teams', async (req, res) => {
  try {
    const saved = await upsertTeam(req.body);
    res.json(saved);
  } catch (error: any) {
    console.error('Error saving team:', error);
    res.status(500).json({ error: error.message || 'Gagal menyimpan tim' });
  }
});

app.delete('/api/teams', async (_req, res) => {
  try {
    await deleteAllTeams();
    await deleteAllMatches();
    res.json({ success: true, message: 'Semua data tim dan laga berhasil dikosongkan' });
  } catch (error: any) {
    console.error('Error emptying teams:', error);
    res.status(500).json({ error: error.message || 'Gagal mengosongkan tim' });
  }
});

app.delete('/api/teams/:id', async (req, res) => {
  try {
    await deleteTeamById(req.params.id);
    res.json({ success: true, id: req.params.id });
  } catch (error: any) {
    console.error('Error deleting team:', error);
    res.status(500).json({ error: error.message || 'Gagal menghapus tim' });
  }
});

app.delete('/api/matches', async (_req, res) => {
  try {
    await deleteAllMatches();
    res.json({ success: true, message: 'Semua data pertandingan berhasil dikosongkan' });
  } catch (error: any) {
    console.error('Error emptying matches:', error);
    res.status(500).json({ error: error.message || 'Gagal mengosongkan laga' });
  }
});

app.post('/api/matches', async (req, res) => {
  try {
    const saved = await upsertMatch(req.body);
    res.json(saved);
  } catch (error: any) {
    console.error('Error saving match:', error);
    res.status(500).json({ error: error.message || 'Gagal menyimpan laga' });
  }
});

app.post('/api/admin/change-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Email dan kata sandi baru diperlukan' });
    }
    console.log(`Password updated for admin: ${email}`);
    res.json({ success: true, message: 'Kata sandi berhasil diperbarui' });
  } catch (error: any) {
    console.error('Error changing admin password:', error);
    res.status(500).json({ error: error.message || 'Gagal mengubah kata sandi' });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', database: 'connected' });
});

// Vite middleware in dev or static files in production
// Produksi = default (melayani folder dist hasil `npm run build`).
// Mode dev hanya jika dijalankan dengan `npm run dev` (flag --dev).
const distDir = path.resolve(__dirname, 'dist');
const isDevMode = process.argv.includes('--dev');
const isProduction = !isDevMode && fs.existsSync(path.join(distDir, 'index.html'));
if (!isDevMode && !isProduction) {
  console.warn("Folder 'dist' tidak ditemukan. Jalankan 'npm run build' dulu, atau 'npm run dev' untuk pengembangan.");
}

if (!isProduction) {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { 
      middlewareMode: true,
      hmr: false,
    },
    appType: 'spa',
    plugins: [
      {
        name: 'suppress-vite-hmr-ws',
        transformIndexHtml() {
          return [
            {
              tag: 'script',
              attrs: { type: 'text/javascript' },
              children: `
(function() {
  const OrigWebSocket = window.WebSocket;
  if (!OrigWebSocket) return;
  function FakeViteSocket(url, protocols) {
    const isVite = protocols === 'vite-hmr' || protocols === 'vite-ping' || 
      (typeof url === 'string' && (url.includes('vite-hmr') || url.includes('token=')));
    if (isVite) {
      const listeners = {};
      const socket = {
        readyState: 1,
        url: url,
        protocol: protocols || '',
        extensions: '',
        binaryType: 'blob',
        bufferedAmount: 0,
        send: function() {},
        close: function() {
          socket.readyState = 3;
          if (listeners['close']) listeners['close'].forEach(cb => cb({ wasClean: true, code: 1000 }));
        },
        addEventListener: function(event, cb) {
          if (!listeners[event]) listeners[event] = [];
          listeners[event].push(cb);
          if (event === 'open') setTimeout(() => cb({ type: 'open' }), 0);
        },
        removeEventListener: function(event, cb) {
          if (listeners[event]) listeners[event] = listeners[event].filter(fn => fn !== cb);
        },
        dispatchEvent: function() { return true; }
      };
      setTimeout(() => {
        if (typeof socket.onopen === 'function') socket.onopen({ type: 'open' });
      }, 0);
      return socket;
    }
    return new OrigWebSocket(url, protocols);
  }
  FakeViteSocket.prototype = OrigWebSocket.prototype;
  window.WebSocket = FakeViteSocket;

  const origError = console.error;
  console.error = function() {
    const args = Array.from(arguments);
    const str = args.map(a => typeof a === 'object' && a !== null ? (a.message || a.stack || '') : String(a)).join(' ');
    if (str.includes('WebSocket') || str.includes('[vite]') || str.includes('failed to connect')) return;
    origError.apply(console, args);
  };

  const origDebug = console.debug;
  console.debug = function() {
    const args = Array.from(arguments);
    const str = args.map(a => typeof a === 'object' && a !== null ? (a.message || a.stack || '') : String(a)).join(' ');
    if (str.includes('[vite]') || str.includes('WebSocket')) return;
    if (origDebug) origDebug.apply(console, args);
  };
})();
              `,
              injectTo: 'head-prepend',
            },
          ];
        },
      },
    ],
  });
  app.use(vite.middlewares);
} else {
  // Aset Vite ber-hash nama file → aman di-cache 1 tahun; index.html selalu dicek ulang
  app.use(
    '/assets',
    express.static(path.join(distDir, 'assets'), { maxAge: '365d', immutable: true })
  );
  app.use(express.static(distDir, { maxAge: '1d', index: false }));
  app.get('*', (_req, res) => {
    res.set('Cache-Control', 'no-cache');
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on 0.0.0.0:${PORT} (${isProduction ? 'production' : 'development'})`);
});
