import React, { useState, useMemo, useEffect } from 'react';
import { 
  Team, 
  TournamentConfig, 
  TournamentDocument, 
  DocumentCategory, 
  DocumentVerificationStatus 
} from '../types/tournament.ts';
import { 
  Database, 
  Upload, 
  Search, 
  Filter, 
  FileText, 
  ShieldCheck, 
  Clock, 
  AlertCircle, 
  Trash2, 
  Download, 
  Eye, 
  Settings, 
  CheckCircle2, 
  RefreshCw, 
  FolderPlus, 
  HardDrive, 
  X, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Layers,
  FileCheck2,
  FileSpreadsheet
} from 'lucide-react';
import { 
  saveDocumentApi, 
  deleteDocumentApi, 
  deleteAllDocumentsApi,
  checkSupabaseStatusApi
} from '../utils/api.ts';
import { uploadBlobToStorage } from '../utils/storageUpload';

interface DocumentStorageViewProps {
  config: TournamentConfig;
  teams: Team[];
  documents: TournamentDocument[];
  onUpdateDocuments: (docs: TournamentDocument[]) => void;
  isTeamViewer?: boolean;
  userTeamId?: string;
  showToast?: (msg: string) => void;
}

export const CATEGORY_LABELS: Record<DocumentCategory, { label: string; icon: string; desc: string }> = {
  ktp_kia: {
    label: 'KTP / KIA Pemain',
    icon: '🪪',
    desc: 'Kartu Tanda Penduduk & Kartu Identitas Anak resmi atlet',
  },
  akta_ijazah: {
    label: 'Akta Lahir / Ijazah',
    icon: '📜',
    desc: 'Dokumen keabsahan tanggal lahir dan screening usia',
  },
  bpjs: {
    label: 'BPJS Ketenagakerjaan',
    icon: '🏥',
    desc: 'Sertifikat & kartu kepesertaan jaminan perlindungan atlet tim',
  },
  payment_receipt: {
    label: 'Bukti Pembayaran / Slip',
    icon: '💵',
    desc: 'Kuitansi & transfer pelunasan biaya registrasi turnamen',
  },
  dsp: {
    label: 'Daftar Susunan Pemain (DSP)',
    icon: '📋',
    desc: 'Formulir DSP resmi pertandingan dan match sheet wasit',
  },
  sk_tim: {
    label: 'SK / Surat Rekomendasi',
    icon: '🛡️',
    desc: 'Surat mandat manajer, legalitas klub SSB & izin bertanding',
  },
  other: {
    label: 'Dokumen Lainnya',
    icon: '📁',
    desc: 'Arsip pendukung administrasi dan regulasi tambahan',
  },
};

export const DocumentStorageView: React.FC<DocumentStorageViewProps> = ({
  config,
  teams,
  documents,
  onUpdateDocuments,
  isTeamViewer = false,
  userTeamId,
  showToast,
}) => {
  // State Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [viewLayout, setViewLayout] = useState<'grid' | 'table'>('grid');

  // Modal States
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSupabaseConfigOpen, setIsSupabaseConfigOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<TournamentDocument | null>(null);

  // Supabase Configuration State (persisted locally)
  const [supabaseConfig, setSupabaseConfig] = useState<{
    projectUrl: string;
    anonKey: string;
    bucketName: string;
    isConnected: boolean;
  }>(() => {
    try {
      const raw = localStorage.getItem('kingdc_supabase_storage_config');
      if (raw) return JSON.parse(raw);
    } catch {}
    return {
      projectUrl: '',
      anonKey: '',
      bucketName: 'tournament-documents',
      isConnected: true,
    };
  });

  const [isUploadingFile, setIsUploadingFile] = useState(false);

  // Live test Supabase storage connectivity on mount
  useEffect(() => {
    checkSupabaseStatusApi().then((status) => {
      setSupabaseConfig((prev) => ({
        ...prev,
        isConnected: status.connected,
      }));
    });
  }, []);

  // Upload Form State
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState<DocumentCategory>('ktp_kia');
  const [uploadTeamId, setUploadTeamId] = useState<string>(isTeamViewer && userTeamId ? userTeamId : '');
  const [uploadPlayerId, setUploadPlayerId] = useState<string>('');
  const [uploadFileUrl, setUploadFileUrl] = useState<string>('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadFileType, setUploadFileType] = useState<string>('image/jpeg');
  const [uploadFileSizeKb, setUploadFileSizeKb] = useState<number>(128);
  const [uploadStatus, setUploadStatus] = useState<DocumentVerificationStatus>('verified');
  const [uploadNotes, setUploadNotes] = useState<string>('');
  const [uploadProvider, setUploadProvider] = useState<'supabase' | 'cloud_sql'>('supabase');

  // Players of selected team in upload form
  const selectedTeamForUpload = teams.find((t) => t.id === uploadTeamId);
  const playersOfSelectedTeam = selectedTeamForUpload ? selectedTeamForUpload.players : [];

  // Filtered Documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      // If team viewer, only show documents belonging to their team
      if (isTeamViewer && userTeamId && doc.teamId && doc.teamId !== userTeamId) {
        return false;
      }

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = doc.title.toLowerCase().includes(q);
        const teamMatch = (doc.teamName || '').toLowerCase().includes(q);
        const playerMatch = (doc.playerName || '').toLowerCase().includes(q);
        const notesMatch = (doc.notes || '').toLowerCase().includes(q);
        if (!titleMatch && !teamMatch && !playerMatch && !notesMatch) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'all' && doc.category !== selectedCategory) {
        return false;
      }

      // Team filter
      if (selectedTeamFilter !== 'all' && doc.teamId !== selectedTeamFilter) {
        return false;
      }

      // Status filter
      if (selectedStatusFilter !== 'all' && doc.verificationStatus !== selectedStatusFilter) {
        return false;
      }

      return true;
    });
  }, [documents, searchQuery, selectedCategory, selectedTeamFilter, selectedStatusFilter, isTeamViewer, userTeamId]);

  // Document Metrics
  const totalDocsCount = documents.length;
  const verifiedCount = documents.filter((d) => d.verificationStatus === 'verified').length;
  const pendingCount = documents.filter((d) => d.verificationStatus === 'pending').length;
  const totalKb = documents.reduce((sum, d) => sum + (d.fileSizeKb || 45), 0);
  const totalMbFormatted = (totalKb / 1024).toFixed(2);

  // File Change Handler: simpan objek File (diunggah langsung ke Supabase Storage saat disimpan)
  const MAX_UPLOAD_MB = 15;
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      alert(`Ukuran file maksimal ${MAX_UPLOAD_MB} MB. Kompres file terlebih dahulu.`);
      e.target.value = '';
      return;
    }

    setUploadFile(file);
    setUploadFileType(file.type || 'image/jpeg');
    setUploadFileSizeKb(Math.round(file.size / 1024));

    if (!uploadTitle.trim()) {
      setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
    }

    // Pratinjau ringan hanya untuk gambar
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => setUploadFileUrl(event.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setUploadFileUrl('');
    }
  };

  // Submit Upload Document
  const handleSaveDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) {
      alert('Judul dokumen wajib diisi.');
      return;
    }

    if (!uploadFile) {
      alert('Pilih file dokumen terlebih dahulu.');
      return;
    }

    setIsUploadingFile(true);

    // Unggah langsung ke Supabase Storage; database hanya menyimpan URL (bukan isi file).
    const uploadRes = await uploadBlobToStorage(uploadFile, uploadFile.name, uploadFileType);
    if (!uploadRes.url) {
      setIsUploadingFile(false);
      alert(`Upload gagal: ${uploadRes.error || 'tidak diketahui'}. Dokumen tidak disimpan, silakan coba lagi.`);
      return;
    }
    const finalFileUrl = uploadRes.url;

    const targetTeam = teams.find((t) => t.id === uploadTeamId);
    const targetPlayer = targetTeam?.players.find((p) => p.id === uploadPlayerId);

    const newDoc: TournamentDocument = {
      id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      teamId: uploadTeamId || undefined,
      teamName: targetTeam ? targetTeam.name : undefined,
      playerId: uploadPlayerId || undefined,
      playerName: targetPlayer ? targetPlayer.name : undefined,
      title: uploadTitle.trim(),
      category: uploadCategory,
      fileUrl: finalFileUrl,
      fileType: uploadFileType,
      fileSizeKb: uploadFileSizeKb,
      storageProvider: uploadProvider,
      verificationStatus: uploadStatus,
      uploadedBy: isTeamViewer ? `Ofisial ${targetTeam?.name || 'Tim'}` : 'Panitia Pelaksana',
      notes: uploadNotes.trim() || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newDoc, ...documents];
    onUpdateDocuments(updated);
    await saveDocumentApi(newDoc);

    setIsUploadingFile(false);
    setIsUploadModalOpen(false);
    resetUploadForm();
    if (showToast) {
      showToast(`Dokumen "${newDoc.title}" berhasil disimpan ke Supabase Storage!`);
    }
  };

  const resetUploadForm = () => {
    setUploadTitle('');
    setUploadCategory('ktp_kia');
    setUploadTeamId(isTeamViewer && userTeamId ? userTeamId : '');
    setUploadPlayerId('');
    setUploadFileUrl('');
    setUploadFile(null);
    setUploadFileType('image/jpeg');
    setUploadFileSizeKb(128);
    setUploadStatus('verified');
    setUploadNotes('');
    setUploadProvider('supabase');
  };

  // Delete Document
  const handleDeleteDocument = (id: string, title: string) => {
    if (confirm(`Hapus dokumen "${title}" dari database penyimpanan?`)) {
      const updated = documents.filter((d) => d.id !== id);
      onUpdateDocuments(updated);
      deleteDocumentApi(id);
      if (previewDoc?.id === id) {
        setPreviewDoc(null);
      }
      if (showToast) {
        showToast(`Dokumen "${title}" telah dihapus.`);
      }
    }
  };

  // Update Status
  const handleUpdateStatus = (id: string, newStatus: DocumentVerificationStatus) => {
    const updated = documents.map((d) => {
      if (d.id === id) {
        const u = { ...d, verificationStatus: newStatus, updatedAt: new Date().toISOString() };
        saveDocumentApi(u);
        return u;
      }
      return d;
    });
    onUpdateDocuments(updated);
    if (previewDoc?.id === id) {
      setPreviewDoc({ ...previewDoc, verificationStatus: newStatus });
    }
    if (showToast) {
      showToast(`Status verifikasi dokumen diperbarui menjadi ${newStatus.toUpperCase()}`);
    }
  };

  // Auto-Extract & Sync from Registered Teams
  const handleAutoSyncFromTeams = () => {
    let newDocsCount = 0;
    const existingDocUrls = new Set(documents.map((d) => d.fileUrl));
    const extractedDocs: TournamentDocument[] = [];

    teams.forEach((t) => {
      // 1. Kolektif BPJS Tim
      if (t.teamBpjsDocumentUrl && !existingDocUrls.has(t.teamBpjsDocumentUrl)) {
        extractedDocs.push({
          id: `doc-bpjs-${t.id}-${Date.now()}`,
          teamId: t.id,
          teamName: t.name,
          title: `Sertifikat Kolektif BPJS Ketenagakerjaan - ${t.name}`,
          category: 'bpjs',
          fileUrl: t.teamBpjsDocumentUrl,
          fileType: 'image/jpeg',
          fileSizeKb: 240,
          storageProvider: 'supabase',
          verificationStatus: t.status === 'verified' ? 'verified' : 'pending',
          uploadedBy: 'Sinkronisasi Otomatis Tim',
          notes: `Dokumen jaminan sosial resmi dari pendaftaran ${t.name}`,
          createdAt: new Date().toISOString(),
        });
        existingDocUrls.add(t.teamBpjsDocumentUrl);
        newDocsCount++;
      }

      // 2. KTP / KIA Pemain
      t.players.forEach((p) => {
        if (p.ktpPhotoUrl && !existingDocUrls.has(p.ktpPhotoUrl)) {
          extractedDocs.push({
            id: `doc-ktp-${p.id}-${Date.now()}`,
            teamId: t.id,
            teamName: t.name,
            playerId: p.id,
            playerName: p.name,
            title: `KTP / KIA - #${p.number} ${p.name} (${t.name})`,
            category: 'ktp_kia',
            fileUrl: p.ktpPhotoUrl,
            fileType: 'image/jpeg',
            fileSizeKb: 185,
            storageProvider: 'supabase',
            verificationStatus: p.isVerified ? 'verified' : 'pending',
            uploadedBy: 'Sinkronisasi Berkas Screening',
            notes: `NIK: ${p.nik || '-'} · Tanggal Lahir: ${p.birthDate}`,
            createdAt: new Date().toISOString(),
          });
          existingDocUrls.add(p.ktpPhotoUrl);
          newDocsCount++;
        }

        // 3. BPJS Individual Pemain
        if (p.bpjsPhotoUrl && !existingDocUrls.has(p.bpjsPhotoUrl)) {
          extractedDocs.push({
            id: `doc-bpjs-p-${p.id}-${Date.now()}`,
            teamId: t.id,
            teamName: t.name,
            playerId: p.id,
            playerName: p.name,
            title: `Kartu BPJS Atlet - #${p.number} ${p.name}`,
            category: 'bpjs',
            fileUrl: p.bpjsPhotoUrl,
            fileType: 'image/jpeg',
            fileSizeKb: 160,
            storageProvider: 'supabase',
            verificationStatus: p.isVerified ? 'verified' : 'pending',
            uploadedBy: 'Sinkronisasi Berkas Screening',
            notes: `Perlindungan atlet terdaftar tim ${t.name}`,
            createdAt: new Date().toISOString(),
          });
          existingDocUrls.add(p.bpjsPhotoUrl);
          newDocsCount++;
        }
      });
    });

    if (newDocsCount > 0) {
      const merged = [...extractedDocs, ...documents];
      onUpdateDocuments(merged);
      extractedDocs.forEach((d) => saveDocumentApi(d));
      if (showToast) {
        showToast(`Berhasil mengekstrak dan menyinkronkan ${newDocsCount} dokumen baru ke Database Supabase!`);
      }
    } else {
      if (showToast) {
        showToast('Semua berkas dari tim terdaftar sudah tersinkronisasi di Database.');
      }
    }
  };

  // Save Supabase Configuration
  const handleSaveSupabaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('kingdc_supabase_storage_config', JSON.stringify(supabaseConfig));
    setIsSupabaseConfigOpen(false);
    if (showToast) {
      showToast('Koneksi konfigurasi Supabase Storage berhasil disimpan!');
    }
  };

  return (
    <div className="space-y-6 text-black select-none">
      {/* Top Banner Hub */}
      <div className="bg-white border border-slate-200 rounded-xs p-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent pointer-events-none rounded-full -mr-20 -mt-20" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2 font-mono-tech text-[10px] font-black uppercase tracking-wider text-black">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Supabase Cloud Storage & PostgreSQL Database</span>
              <span className="px-1.5 py-0.2 rounded-xs bg-black text-white text-[9px] font-mono-tech">
                BUCKET: {supabaseConfig.bucketName}
              </span>
            </div>
            <h1 className="font-syne text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-black flex items-center gap-2.5">
              <Database className="w-7 h-7 text-[#ff4d00]" />
              <span>Database Dokumen & Arsip Digital</span>
            </h1>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Pusat penyimpanan digital seluruh berkas kejuaraan {config.name}: KTP/KIA, Akta Lahir, Kartu BPJS Ketenagakerjaan Atlet, Lembar DSP Wasit, dan Slip Bukti Registrasi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleAutoSyncFromTeams}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xs font-mono-tech text-xs font-bold text-black flex items-center gap-2 transition-colors cursor-pointer"
              title="Tarik dokumen dari pendaftaran tim dan screening"
            >
              <RefreshCw className="w-3.5 h-3.5 text-black" />
              <span>Sinkronkan Berkas Tim</span>
            </button>

            {!isTeamViewer && (
              <button
                onClick={() => setIsSupabaseConfigOpen(true)}
                className="px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-black rounded-xs font-mono-tech text-xs font-bold text-black flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
                title="Atur koneksi Supabase URL & Bucket"
              >
                <Settings className="w-3.5 h-3.5 text-[#ff4d00]" />
                <span>Konfigurasi Supabase</span>
              </button>
            )}

            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2.5 bg-black hover:bg-[#ff4d00] text-white rounded-xs font-mono-tech text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Unggah Dokumen</span>
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-200">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xs">
            <div className="text-[10px] font-mono-tech font-bold uppercase text-slate-500">Total Berkas</div>
            <div className="text-xl font-syne font-black text-black mt-1 flex items-baseline gap-1.5">
              <span>{totalDocsCount}</span>
              <span className="text-[10px] font-mono-tech font-bold text-slate-500">item</span>
            </div>
            <div className="text-[10px] font-mono-tech text-slate-500 mt-0.5">Est. {totalMbFormatted} MB terpakai</div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xs">
            <div className="text-[10px] font-mono-tech font-bold uppercase text-slate-500">Terverifikasi Sah</div>
            <div className="text-xl font-syne font-black text-emerald-700 mt-1 flex items-baseline gap-1.5">
              <span>{verifiedCount}</span>
              <span className="text-[10px] font-mono-tech font-bold text-slate-500">berkas</span>
            </div>
            <div className="text-[10px] font-mono-tech text-emerald-700 mt-0.5 flex items-center gap-1 font-bold">
              <CheckCircle2 className="w-2.5 h-2.5" /> Lolos audit panitia
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xs">
            <div className="text-[10px] font-mono-tech font-bold uppercase text-slate-500">Menunggu Screening</div>
            <div className="text-xl font-syne font-black text-amber-700 mt-1 flex items-baseline gap-1.5">
              <span>{pendingCount}</span>
              <span className="text-[10px] font-mono-tech font-bold text-slate-500">berkas</span>
            </div>
            <div className="text-[10px] font-mono-tech text-amber-700 mt-0.5 flex items-center gap-1 font-bold">
              <Clock className="w-2.5 h-2.5" /> Perlu ditinjau
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xs">
            <div className="text-[10px] font-mono-tech font-bold uppercase text-slate-500">Koneksi Storage</div>
            <div className="text-sm font-mono-tech font-black text-black mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>SUPABASE ACTIVE</span>
            </div>
            <div className="text-[10px] font-mono-tech text-slate-600 mt-0.5 truncate">
              {supabaseConfig.bucketName}
            </div>
          </div>
        </div>
      </div>

      {/* Control Filter & Search */}
      <div className="bg-white border border-slate-200 rounded-xs p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari dokumen, nama tim, nama pemain, atau catatan..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xs text-xs font-mono-tech text-black placeholder:text-slate-400 focus:outline-none focus:border-black focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono-tech">
            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="py-2 px-3 bg-white border border-slate-300 rounded-xs text-xs font-mono-tech text-black focus:outline-none focus:border-black cursor-pointer"
            >
              <option value="all">Semua Kategori Dokumen</option>
              {Object.entries(CATEGORY_LABELS).map(([k, val]) => (
                <option key={k} value={k}>
                  {val.icon} {val.label}
                </option>
              ))}
            </select>

            {/* Team Dropdown (if not team viewer) */}
            {!isTeamViewer && (
              <select
                value={selectedTeamFilter}
                onChange={(e) => setSelectedTeamFilter(e.target.value)}
                className="py-2 px-3 bg-white border border-slate-300 rounded-xs text-xs font-mono-tech text-black focus:outline-none focus:border-black cursor-pointer max-w-[180px]"
              >
                <option value="all">Semua Tim Peserta</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            )}

            {/* Status Dropdown */}
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="py-2 px-3 bg-white border border-slate-300 rounded-xs text-xs font-mono-tech text-black focus:outline-none focus:border-black cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="verified">Sah / Terverifikasi</option>
              <option value="pending">Menunggu Screening</option>
              <option value="rejected">Ditolak / Perlu Revisi</option>
            </select>

            {/* Layout Toggle */}
            <div className="flex border border-slate-300 rounded-xs overflow-hidden">
              <button
                onClick={() => setViewLayout('grid')}
                className={`px-2.5 py-1.5 text-xs font-mono-tech font-bold cursor-pointer transition-colors ${
                  viewLayout === 'grid' ? 'bg-black text-white' : 'bg-white text-black hover:bg-slate-100'
                }`}
                title="Tampilan Grid Kartu"
              >
                Grid
              </button>
              <button
                onClick={() => setViewLayout('table')}
                className={`px-2.5 py-1.5 text-xs font-mono-tech font-bold cursor-pointer transition-colors ${
                  viewLayout === 'table' ? 'bg-black text-white' : 'bg-white text-black hover:bg-slate-100'
                }`}
                title="Tampilan Tabel Berkas"
              >
                Tabel
              </button>
            </div>
          </div>
        </div>

        {/* Quick Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-slate-100 scrollbar-thin">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 rounded-xs font-mono-tech text-[10px] font-bold uppercase tracking-wider shrink-0 transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-black text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Semua ({documents.length})
          </button>
          {Object.entries(CATEGORY_LABELS).map(([k, val]) => {
            const count = documents.filter((d) => d.category === k).length;
            return (
              <button
                key={k}
                onClick={() => setSelectedCategory(k)}
                className={`px-2.5 py-1 rounded-xs font-mono-tech text-[10px] font-bold uppercase tracking-wider shrink-0 transition-colors flex items-center gap-1 cursor-pointer ${
                  selectedCategory === k
                    ? 'bg-black text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{val.icon}</span>
                <span>{val.label}</span>
                <span className="opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Document Content */}
      {filteredDocuments.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xs p-12 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 bg-slate-100 border border-slate-300 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-syne font-bold text-base uppercase text-black">
              Tidak Ada Dokumen Ditemukan
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              {searchQuery || selectedCategory !== 'all' || selectedTeamFilter !== 'all'
                ? 'Tidak ada berkas yang cocok dengan filter pencarian Anda. Coba reset filter.'
                : 'Belum ada dokumen yang diunggah ke database penyimpanan. Klik "Unggah Dokumen" atau "Sinkronkan Berkas Tim".'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2 bg-black hover:bg-[#ff4d00] text-white rounded-xs font-mono-tech text-xs font-bold transition-colors cursor-pointer"
            >
              + Unggah Dokumen Pertama
            </button>
            <button
              onClick={handleAutoSyncFromTeams}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-black rounded-xs font-mono-tech text-xs font-bold transition-colors cursor-pointer"
            >
              Sinkronkan Berkas Tim
            </button>
          </div>
        </div>
      ) : viewLayout === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDocuments.map((doc) => {
            const catInfo = CATEGORY_LABELS[doc.category] || CATEGORY_LABELS.other;
            const isImage = doc.fileType?.startsWith('image/') || doc.fileUrl.startsWith('data:image/');

            return (
              <div
                key={doc.id}
                className="bg-white border border-slate-200 hover:border-black rounded-xs overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
              >
                {/* Media Preview Box */}
                <div 
                  onClick={() => setPreviewDoc(doc)}
                  className="h-44 bg-slate-900 relative cursor-pointer overflow-hidden flex items-center justify-center"
                >
                  {isImage ? (
                    <img
                      src={doc.fileUrl}
                      alt={doc.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                  ) : (
                    <div className="text-center p-4 space-y-2">
                      <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto text-white">
                        <FileText className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-mono-tech text-white/80 block">
                        {doc.fileType || 'Dokumen PDF'}
                      </span>
                    </div>
                  )}

                  {/* Category Pill Over Image */}
                  <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-xs bg-black/80 backdrop-blur-xs text-white text-[10px] font-mono-tech font-bold uppercase">
                    <span>{catInfo.icon}</span>
                    <span>{catInfo.label}</span>
                  </div>

                  {/* Verification Pill */}
                  <div className="absolute top-2 right-2">
                    {doc.verificationStatus === 'verified' && (
                      <span className="px-2 py-0.5 rounded-xs bg-emerald-600 text-white text-[9px] font-mono-tech font-bold uppercase flex items-center gap-1 shadow-xs">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>Sah</span>
                      </span>
                    )}
                    {doc.verificationStatus === 'pending' && (
                      <span className="px-2 py-0.5 rounded-xs bg-amber-500 text-black text-[9px] font-mono-tech font-bold uppercase flex items-center gap-1 shadow-xs">
                        <Clock className="w-2.5 h-2.5" />
                        <span>Audit</span>
                      </span>
                    )}
                    {doc.verificationStatus === 'rejected' && (
                      <span className="px-2 py-0.5 rounded-xs bg-red-600 text-white text-[9px] font-mono-tech font-bold uppercase flex items-center gap-1 shadow-xs">
                        <AlertCircle className="w-2.5 h-2.5" />
                        <span>Revisi</span>
                      </span>
                    )}
                  </div>

                  {/* Hover Overlay Button */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <span className="px-3 py-1.5 bg-white text-black text-xs font-mono-tech font-bold rounded-xs flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Buka Pratinjau</span>
                    </span>
                  </div>
                </div>

                {/* Details Body */}
                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 
                      onClick={() => setPreviewDoc(doc)}
                      className="font-bold text-xs text-black line-clamp-1 hover:text-[#ff4d00] cursor-pointer"
                      title={doc.title}
                    >
                      {doc.title}
                    </h4>

                    <div className="mt-1 space-y-0.5 text-[11px] font-mono-tech text-slate-600">
                      {doc.teamName && (
                        <div className="truncate font-semibold text-black">
                          Tim: {doc.teamName}
                        </div>
                      )}
                      {doc.playerName && (
                        <div className="truncate text-slate-700">
                          Pemain: {doc.playerName}
                        </div>
                      )}
                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                        <span>{doc.fileSizeKb ? `${doc.fileSizeKb} KB` : 'Dokumen'}</span>
                        <span className="uppercase text-emerald-700 font-bold">
                          {doc.storageProvider}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="p-1.5 text-slate-600 hover:text-black hover:bg-slate-100 rounded-xs transition-colors cursor-pointer"
                        title="Lihat Pratinjau"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <a
                        href={doc.fileUrl}
                        download={doc.title}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-slate-600 hover:text-black hover:bg-slate-100 rounded-xs transition-colors cursor-pointer inline-flex"
                        title="Unduh Berkas"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    {!isTeamViewer && (
                      <button
                        onClick={() => handleDeleteDocument(doc.id, doc.title)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xs transition-colors cursor-pointer"
                        title="Hapus Dokumen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white border border-slate-200 rounded-xs overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono-tech border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-black uppercase text-[10px] font-bold">
                  <th className="py-3 px-4">Nama Dokumen</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Tim & Pemain</th>
                  <th className="py-3 px-4">Ukuran</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Penyimpanan</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocuments.map((doc) => {
                  const catInfo = CATEGORY_LABELS[doc.category] || CATEGORY_LABELS.other;
                  return (
                    <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-black max-w-xs truncate">
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="hover:text-[#ff4d00] hover:underline text-left cursor-pointer"
                        >
                          {doc.title}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 border border-slate-300 rounded-xs text-[10px] uppercase font-bold text-black">
                          <span>{catInfo.icon}</span>
                          <span>{catInfo.label}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        <div className="font-semibold text-black">{doc.teamName || '-'}</div>
                        {doc.playerName && <div className="text-[10px] text-slate-500">{doc.playerName}</div>}
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {doc.fileSizeKb ? `${doc.fileSizeKb} KB` : '-'}
                      </td>
                      <td className="py-3 px-4">
                        {doc.verificationStatus === 'verified' && (
                          <span className="px-2 py-0.5 rounded-xs bg-emerald-100 text-emerald-800 border border-emerald-300 text-[9px] font-bold uppercase">
                            Sah
                          </span>
                        )}
                        {doc.verificationStatus === 'pending' && (
                          <span className="px-2 py-0.5 rounded-xs bg-amber-100 text-amber-800 border border-amber-300 text-[9px] font-bold uppercase">
                            Audit
                          </span>
                        )}
                        {doc.verificationStatus === 'rejected' && (
                          <span className="px-2 py-0.5 rounded-xs bg-red-100 text-red-800 border border-red-300 text-[9px] font-bold uppercase">
                            Revisi
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 uppercase text-slate-600 text-[10px] font-bold">
                        {doc.storageProvider}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setPreviewDoc(doc)}
                            className="p-1 text-slate-600 hover:text-black hover:bg-slate-200 rounded cursor-pointer"
                            title="Pratinjau"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={doc.fileUrl}
                            download={doc.title}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 text-slate-600 hover:text-black hover:bg-slate-200 rounded cursor-pointer inline-flex"
                            title="Unduh"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                          {!isTeamViewer && (
                            <button
                              onClick={() => handleDeleteDocument(doc.id, doc.title)}
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: UPLOAD DOKUMEN BARU */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xs max-w-lg w-full shadow-2xl border-2 border-black overflow-hidden flex flex-col">
            <div className="px-5 py-4 bg-black text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xs bg-[#ff4d00] flex items-center justify-center text-white shrink-0">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-syne font-extrabold text-sm uppercase tracking-tight text-white">
                    Unggah Dokumen ke Supabase Database
                  </h2>
                  <div className="text-[10px] font-mono-tech text-white/70">
                    Arsip Digital Turnamen & Verifikasi Atlet
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1.5 text-white/60 hover:text-white rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDocument} className="p-5 space-y-4 text-xs font-mono-tech">
              {/* Category */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-black mb-1">
                  Kategori Dokumen <span className="text-red-500">*</span>
                </label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value as DocumentCategory)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xs text-xs font-mono-tech text-black focus:border-black focus:outline-none"
                  required
                >
                  {Object.entries(CATEGORY_LABELS).map(([k, val]) => (
                    <option key={k} value={k}>
                      {val.icon} {val.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-black mb-1">
                  Nama / Judul Dokumen <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="Contoh: KTP Pemain - Ahmad Fauzi (Garuda Muda FC)"
                  required
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xs text-xs font-mono-tech text-black placeholder:text-slate-400 focus:border-black focus:outline-none"
                />
              </div>

              {/* Team Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-black mb-1">
                    Tim Terkait
                  </label>
                  <select
                    value={uploadTeamId}
                    onChange={(e) => {
                      setUploadTeamId(e.target.value);
                      setUploadPlayerId('');
                    }}
                    disabled={isTeamViewer}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xs text-xs font-mono-tech text-black focus:border-black focus:outline-none disabled:bg-slate-100"
                  >
                    <option value="">Pilih Tim (Opsional)</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-black mb-1">
                    Pemain Terkait
                  </label>
                  <select
                    value={uploadPlayerId}
                    onChange={(e) => setUploadPlayerId(e.target.value)}
                    disabled={!uploadTeamId}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xs text-xs font-mono-tech text-black focus:border-black focus:outline-none disabled:bg-slate-100"
                  >
                    <option value="">Pilih Pemain (Opsional)</option>
                    {playersOfSelectedTeam.map((p) => (
                      <option key={p.id} value={p.id}>
                        #{p.number} {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* File Upload Box */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-black mb-1">
                  Pilih File Berkas (Gambar / Scan / PDF) <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-slate-300 hover:border-black rounded-xs p-4 text-center cursor-pointer relative bg-slate-50 transition-colors">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {uploadFile ? (
                    <div className="space-y-2">
                      {uploadFileType.startsWith('image/') && uploadFileUrl ? (
                        <img
                          src={uploadFileUrl}
                          alt="Pratinjau"
                          className="h-28 mx-auto object-contain rounded-xs border border-slate-300"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-black text-white flex items-center justify-center mx-auto rounded-xs">
                          <FileText className="w-6 h-6" />
                        </div>
                      )}
                      <div className="text-[11px] font-bold text-emerald-700 flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{uploadFile?.name} ({uploadFileSizeKb} KB)</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block">Klik untuk mengganti berkas</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                      <div className="font-bold text-black text-xs">Klik atau seret file ke sini</div>
                      <div className="text-[10px] text-slate-500">JPEG, PNG, WEBP, atau PDF (maks. 15 MB)</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Status & Storage Provider */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-black mb-1">
                    Status Verifikasi
                  </label>
                  <select
                    value={uploadStatus}
                    onChange={(e) => setUploadStatus(e.target.value as DocumentVerificationStatus)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xs text-xs font-mono-tech text-black focus:border-black focus:outline-none"
                  >
                    <option value="verified">Sah / Terverifikasi</option>
                    <option value="pending">Menunggu Audit</option>
                    <option value="rejected">Perlu Revisi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-black mb-1">
                    Target Penyimpanan
                  </label>
                  <select
                    value={uploadProvider}
                    onChange={(e) => setUploadProvider(e.target.value as 'supabase' | 'cloud_sql')}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xs text-xs font-mono-tech text-black focus:border-black focus:outline-none"
                  >
                    <option value="supabase">Supabase Storage Hub</option>
                    <option value="cloud_sql">Cloud SQL Database (PostgreSQL)</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-black mb-1">
                  Catatan / Keterangan Berkas
                </label>
                <textarea
                  value={uploadNotes}
                  onChange={(e) => setUploadNotes(e.target.value)}
                  placeholder="Catatan tambahan mengenai berkas, nomor registrasi, dll."
                  rows={2}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xs text-xs font-mono-tech text-black placeholder:text-slate-400 focus:border-black focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-black hover:bg-slate-100 rounded-xs font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUploadingFile}
                  className="px-5 py-2 bg-black hover:bg-[#ff4d00] text-white rounded-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isUploadingFile ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Mengunggah ke Supabase Storage...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Simpan ke Database</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: KONFIGURASI SUPABASE STORAGE */}
      {isSupabaseConfigOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xs max-w-md w-full shadow-2xl border-2 border-black overflow-hidden flex flex-col">
            <div className="px-5 py-4 bg-black text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xs bg-[#ff4d00] flex items-center justify-center text-white shrink-0">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-syne font-extrabold text-sm uppercase tracking-tight text-white">
                    Konfigurasi Supabase Storage
                  </h2>
                  <div className="text-[10px] font-mono-tech text-white/70">
                    Koneksi Cloud Bucket & Kredensial Project
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsSupabaseConfigOpen(false)}
                className="p-1.5 text-white/60 hover:text-white rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSupabaseConfig} className="p-5 space-y-4 text-xs font-mono-tech">
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xs text-[11px] text-emerald-950 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Status Aktif:</strong> Database dokumen terintegrasi langsung dengan Cloud SQL PostgreSQL dan Supabase Storage bucket <code>{supabaseConfig.bucketName}</code>.
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-black mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="url"
                  value={supabaseConfig.projectUrl}
                  onChange={(e) => setSupabaseConfig({ ...supabaseConfig, projectUrl: e.target.value })}
                  placeholder="https://xyzcompany.supabase.co"
                  required
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xs text-xs font-mono-tech text-black focus:border-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-black mb-1">
                  Supabase Anon / Public Key
                </label>
                <input
                  type="password"
                  value={supabaseConfig.anonKey}
                  onChange={(e) => setSupabaseConfig({ ...supabaseConfig, anonKey: e.target.value })}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  required
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xs text-xs font-mono-tech text-black focus:border-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-black mb-1">
                  Nama Bucket Storage
                </label>
                <input
                  type="text"
                  value={supabaseConfig.bucketName}
                  onChange={(e) => setSupabaseConfig({ ...supabaseConfig, bucketName: e.target.value })}
                  placeholder="tournament-documents"
                  required
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xs text-xs font-mono-tech text-black focus:border-black focus:outline-none"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsSupabaseConfigOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-black hover:bg-slate-100 rounded-xs font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-black hover:bg-[#ff4d00] text-white rounded-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Simpan Konfigurasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: PREVIEW DOKUMEN DETAIL */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
          <div className="bg-white rounded-xs max-w-3xl w-full shadow-2xl border-2 border-black overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="px-5 py-3.5 bg-black text-white flex items-center justify-between">
              <div className="min-w-0 pr-4">
                <h3 className="font-syne font-bold text-sm uppercase text-white truncate">
                  {previewDoc.title}
                </h3>
                <div className="text-[10px] font-mono-tech text-white/70 flex items-center gap-2 mt-0.5">
                  <span>Kategori: {CATEGORY_LABELS[previewDoc.category]?.label || previewDoc.category}</span>
                  <span>•</span>
                  <span>Provider: {previewDoc.storageProvider.toUpperCase()}</span>
                </div>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1.5 text-white/60 hover:text-white rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Preview Media Viewport */}
            <div className="flex-1 overflow-y-auto bg-slate-950 p-4 flex items-center justify-center min-h-[320px] max-h-[500px]">
              {previewDoc.fileType?.startsWith('image/') || previewDoc.fileUrl.startsWith('data:image/') ? (
                <img
                  src={previewDoc.fileUrl}
                  alt={previewDoc.title}
                  className="max-h-[460px] max-w-full object-contain rounded-xs shadow-lg"
                />
              ) : (
                <div className="text-center p-8 space-y-3 bg-white/5 rounded-xs border border-white/10 max-w-sm">
                  <FileText className="w-12 h-12 text-[#ff4d00] mx-auto" />
                  <div className="font-syne text-white font-bold text-sm">Dokumen Digital Terproteksi</div>
                  <p className="text-xs text-white/70 font-mono-tech">
                    Format file: {previewDoc.fileType || 'application/pdf'}. Anda dapat mengunduh dokumen asli untuk melihat isi lengkap.
                  </p>
                  <a
                    href={previewDoc.fileUrl}
                    download={previewDoc.title}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#ff4d00] text-white text-xs font-mono-tech font-bold uppercase rounded-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh & Buka Berkas</span>
                  </a>
                </div>
              )}
            </div>

            {/* Meta & Info Panel */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono-tech">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-black">Tim:</span>
                  <span>{previewDoc.teamName || 'Umum / Panitia'}</span>
                  {previewDoc.playerName && (
                    <>
                      <span className="text-slate-400">•</span>
                      <span className="font-bold text-black">Pemain:</span>
                      <span>{previewDoc.playerName}</span>
                    </>
                  )}
                </div>
                {previewDoc.notes && (
                  <div className="text-[11px] text-slate-600">
                    <span className="font-semibold text-black">Catatan:</span> {previewDoc.notes}
                  </div>
                )}
              </div>

              {/* Status and Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {!isTeamViewer && (
                  <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-xs p-1">
                    <span className="text-[10px] text-slate-500 font-bold px-1 uppercase">Audit:</span>
                    <button
                      onClick={() => handleUpdateStatus(previewDoc.id, 'verified')}
                      className={`px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase cursor-pointer ${
                        previewDoc.verificationStatus === 'verified'
                          ? 'bg-emerald-600 text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Sah
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(previewDoc.id, 'pending')}
                      className={`px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase cursor-pointer ${
                        previewDoc.verificationStatus === 'pending'
                          ? 'bg-amber-500 text-black'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Pending
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(previewDoc.id, 'rejected')}
                      className={`px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase cursor-pointer ${
                        previewDoc.verificationStatus === 'rejected'
                          ? 'bg-red-600 text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Tolak
                    </button>
                  </div>
                )}

                <a
                  href={previewDoc.fileUrl}
                  download={previewDoc.title}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-black hover:bg-[#ff4d00] text-white rounded-xs font-bold uppercase text-[11px] flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
