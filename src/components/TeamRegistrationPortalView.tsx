import React, { useState, useMemo } from 'react';
import { 
  Team, 
  Player, 
  TournamentConfig, 
  AdminUser, 
  PlayerPosition, 
  OfficialStaff 
} from '../types/tournament.ts';
import { calculateAge, formatRupiah } from '../utils/formatters.ts';
import { compressAndUpload } from '../utils/imageUtils.ts';
import { uploadBlobToStorage } from '../utils/storageUpload.ts';
import { 
  Shield, 
  UserCheck, 
  Users, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  FileText, 
  Printer, 
  Save, 
  Upload, 
  Camera, 
  ShieldCheck, 
  CreditCard, 
  ChevronRight, 
  Info, 
  Sparkles,
  Shirt,
  X,
  Building,
  User,
  Phone,
  Calendar,
  Check,
  Receipt,
  Key,
  Lock,
  Unlock
} from 'lucide-react';
import { getDefaultTeamUsername, getDefaultTeamPassword } from '../utils/credentials.ts';

interface TeamRegistrationPortalViewProps {
  config: TournamentConfig;
  teams: Team[];
  currentAdmin: AdminUser | null;
  isTeamViewer: boolean;
  onSaveTeam: (updatedTeam: Team) => void;
  onOpenReceipt?: (team: Team) => void;
  onOpenNewRegistrationModal?: () => void;
  showToast?: (msg: string) => void;
}

export const TeamRegistrationPortalView: React.FC<TeamRegistrationPortalViewProps> = ({
  config,
  teams,
  currentAdmin,
  isTeamViewer,
  onSaveTeam,
  onOpenReceipt,
  onOpenNewRegistrationModal,
  showToast,
}) => {
  // Determine selected team
  // If team_viewer, lock to their assigned team
  const defaultTeamId = useMemo(() => {
    if (isTeamViewer && currentAdmin?.teamId) {
      const match = teams.find((t) => t.id === currentAdmin.teamId);
      if (match) return match.id;
    }
    return teams[0]?.id || '';
  }, [teams, isTeamViewer, currentAdmin]);

  const [selectedTeamId, setSelectedTeamId] = useState<string>(defaultTeamId);

  // Active section tab inside registration view
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'players' | 'officials' | 'documents'>('profile');

  // Selected team object
  const activeTeam = useMemo(() => {
    return teams.find((t) => t.id === selectedTeamId) || teams[0];
  }, [teams, selectedTeamId]);

  // Editable local state cloned from activeTeam
  const [teamForm, setTeamForm] = useState<Team | null>(activeTeam ? JSON.parse(JSON.stringify(activeTeam)) : null);

  // When activeTeam changes (e.g. admin switches team), sync local form
  React.useEffect(() => {
    if (activeTeam) {
      setTeamForm(JSON.parse(JSON.stringify(activeTeam)));
    }
  }, [activeTeam?.id]);

  // Player modal state
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [editingPlayerIndex, setEditingPlayerIndex] = useState<number | null>(null);
  const [playerForm, setPlayerForm] = useState<Player>({
    id: '',
    number: 1,
    name: '',
    position: 'FW',
    birthDate: '2009-01-01',
    nik: '',
    nisn: '',
    heightCm: 175,
    weightKg: 65,
    isCaptain: false,
    isVerified: false,
  });

  if (!teamForm) {
    return (
      <div className="p-8 text-center bg-white border border-slate-200 rounded-xs">
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-black">Data Tim Tidak Ditemukan</h3>
        <p className="text-xs text-slate-500 mt-1">Belum ada tim yang terdaftar di turnamen.</p>
        {onOpenNewRegistrationModal && (
          <button
            onClick={onOpenNewRegistrationModal}
            className="mt-4 px-4 py-2 bg-black hover:bg-[#ff4d00] text-white text-xs font-bold uppercase rounded-xs transition-colors"
          >
            Daftarkan Tim Pertama
          </button>
        )}
      </div>
    );
  }

  // When team has been verified by the committee, the registration portal is locked
  const isLocked = isTeamViewer && teamForm.status === 'verified';

  // Handle save changes to team
  const handleSaveAll = () => {
    if (!teamForm) return;
    if (isLocked) {
      if (showToast) {
        showToast('Portal pendaftaran terkunci: Data tim telah disahkan & diverifikasi panitia.');
      }
      return;
    }
    onSaveTeam(teamForm);
    if (showToast) {
      showToast(`Pendaftaran & Data Skuad ${teamForm.name} berhasil diperbarui!`);
    }
  };

  // Open player modal for new player
  const handleOpenAddPlayer = () => {
    if (isLocked) {
      alert('Portal pendaftaran telah dikunci karena tim Anda sudah berstatus terverifikasi/sah oleh panitia.');
      return;
    }
    if (teamForm.players.length >= config.maxPlayersPerTeam) {
      alert(`Batas kuota pemain per tim adalah maksimal ${config.maxPlayersPerTeam} pemain.`);
      return;
    }
    const nextNumber = Math.max(0, ...teamForm.players.map((p) => p.number)) + 1;
    setPlayerForm({
      id: `p-${Date.now()}`,
      number: nextNumber > 99 ? 1 : nextNumber,
      name: '',
      position: 'FW',
      birthDate: '2009-05-15',
      nik: '',
      nisn: '',
      heightCm: 172,
      weightKg: 63,
      isCaptain: false,
      isVerified: false,
    });
    setEditingPlayerIndex(null);
    setIsPlayerModalOpen(true);
  };

  // Open player modal for edit
  const handleOpenEditPlayer = (index: number) => {
    if (isLocked) {
      alert('Data pemain tidak dapat diubah karena tim Anda sudah berstatus terverifikasi/sah oleh panitia.');
      return;
    }
    setPlayerForm({ ...teamForm.players[index] });
    setEditingPlayerIndex(index);
    setIsPlayerModalOpen(true);
  };

  // Delete player
  const handleDeletePlayer = (index: number) => {
    if (isLocked) {
      alert('Pemain tidak dapat dihapus karena tim Anda sudah berstatus terverifikasi/sah oleh panitia.');
      return;
    }
    const targetPlayer = teamForm.players[index];
    if (confirm(`Hapus pemain "${targetPlayer.name || 'Pemain #' + targetPlayer.number}" dari daftar pendaftaran?`)) {
      const updatedPlayers = teamForm.players.filter((_, i) => i !== index);
      const updated = { ...teamForm, players: updatedPlayers };
      setTeamForm(updated);
      onSaveTeam(updated);
      if (showToast) {
        showToast(`Pemain berhasil dihapus dari skuad.`);
      }
    }
  };

  // Save player from modal
  const handleSavePlayerModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerForm.name.trim()) {
      alert('Nama lengkap pemain wajib diisi.');
      return;
    }

    // Check duplicate jersey number
    const dupIndex = teamForm.players.findIndex(
      (p, i) => p.number === Number(playerForm.number) && i !== editingPlayerIndex
    );
    if (dupIndex !== -1) {
      alert(`Nomor punggung ${playerForm.number} sudah digunakan oleh ${teamForm.players[dupIndex].name}. Pilih nomor lain.`);
      return;
    }

    let updatedPlayers = [...teamForm.players];
    if (editingPlayerIndex !== null) {
      updatedPlayers[editingPlayerIndex] = playerForm;
    } else {
      updatedPlayers.push(playerForm);
    }

    // If marked captain, unmark others
    if (playerForm.isCaptain) {
      updatedPlayers = updatedPlayers.map((p) => ({
        ...p,
        isCaptain: p.id === playerForm.id,
      }));
    }

    const updatedTeam = { ...teamForm, players: updatedPlayers };
    setTeamForm(updatedTeam);
    onSaveTeam(updatedTeam);
    setIsPlayerModalOpen(false);
    if (showToast) {
      showToast(`Data pemain ${playerForm.name} berhasil disimpan.`);
    }
  };

  // Handle Photo upload for player
  const handlePlayerPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await compressAndUpload(file, 400, 400, 0.85);
      setPlayerForm((prev) => ({ ...prev, photoUrl: base64 }));
    } catch {
      alert('Gagal memproses foto pemain.');
    }
  };

  // Handle Logo upload for team
  const handleTeamLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLocked) return;
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await compressAndUpload(file, 250, 250, 0.85);
      setTeamForm((prev) => (prev ? { ...prev, logoUrl: base64 } : prev));
    } catch {
      alert('Gagal memproses logo tim.');
    }
  };

  // Handle BPJS document upload (diunggah ke Supabase Storage, database hanya menyimpan URL)
  const handleBpjsUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLocked) return;
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      alert('Ukuran dokumen maksimal 15 MB.');
      return;
    }
    try {
      const res = await uploadBlobToStorage(file, file.name, file.type);
      if (!res.url) throw new Error(res.error || 'Upload gagal');
      setTeamForm((prev) => (prev ? { ...prev, teamBpjsDocumentUrl: res.url } : prev));
      if (showToast) {
        showToast('Dokumen BPJS Ketenagakerjaan Tim berhasil diunggah.');
      }
    } catch {
      alert('Gagal mengunggah dokumen BPJS. Periksa koneksi lalu coba lagi.');
    }
  };

  // Status computation
  const isVerifiedRoster = teamForm.players.length >= config.minPlayersPerTeam && 
                           teamForm.players.every((p) => p.isVerified);
  const eligibleAgeCount = teamForm.players.filter((p) => calculateAge(p.birthDate) <= config.maxAgeLimit).length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Title Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-xs shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-2xs bg-[#ff4d00]/10 text-[#ff4d00] font-mono-tech text-[10px] font-bold uppercase tracking-wider">
              {isTeamViewer ? 'Portal Mandiri Tim Peserta' : 'Konsol Pendaftaran Resmi'}
            </span>
            <span className="text-slate-300 text-xs">•</span>
            <span className="font-mono-tech text-xs text-slate-500 font-bold uppercase">
              Formulir A1 Turnamen
            </span>
          </div>
          <h2 className="text-2xl font-syne font-black text-black tracking-tight uppercase">
            Pendaftaran Tim & Verifikasi Skuad
          </h2>
          <p className="text-xs text-slate-600 font-mono-tech mt-0.5">
            Lengkapi identitas klub, susunan staf ofisial, dan seluruh pemain resmi sebelum batas akhir screening.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Admin Team Selector */}
          {!isTeamViewer && (
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-mono-tech font-bold uppercase text-slate-500">
                Pilih Tim:
              </label>
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xs text-xs font-mono-tech font-bold text-black focus:outline-none focus:border-black cursor-pointer"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Print A1 Sheet Button */}
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-black rounded-xs text-xs font-mono-tech font-bold uppercase transition-colors flex items-center gap-1.5 cursor-pointer no-print"
            title="Cetak Formulir Pendaftaran Tim A1"
          >
            <Printer className="w-3.5 h-3.5 text-slate-700" />
            <span>Cetak A1</span>
          </button>

          {/* Cetak Kuitansi Button */}
          <button
            onClick={() => {
              if (onOpenReceipt) {
                onOpenReceipt(teamForm);
              }
            }}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xs text-xs font-mono-tech font-bold uppercase transition-colors flex items-center gap-1.5 cursor-pointer no-print shadow-xs"
            title="Cetak Kuitansi Resmi Turnamen"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Cetak Kuitansi</span>
          </button>

          {/* Save All Button or Locked Notice */}
          {isLocked ? (
            <div className="px-3.5 py-2 bg-emerald-100 text-emerald-950 border border-emerald-300 rounded-xs text-xs font-mono-tech font-bold uppercase flex items-center gap-1.5 cursor-not-allowed select-none no-print">
              <Lock className="w-3.5 h-3.5 text-emerald-700" />
              <span>Portal Terkunci</span>
            </div>
          ) : (
            <button
              onClick={handleSaveAll}
              className="px-4 py-2 bg-black hover:bg-[#ff4d00] text-white rounded-xs text-xs font-mono-tech font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer no-print"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Perubahan</span>
            </button>
          )}
        </div>
      </div>

      {/* Locked Status Notice Banner for Verified Teams (Shown to Team Viewers) */}
      {isLocked && (
        <div className="p-4 sm:p-5 bg-emerald-50 border-2 border-emerald-500 rounded-xs shadow-xs text-black">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-syne font-black text-sm uppercase tracking-wide text-emerald-950">
                    PORTAL PENDAFTARAN TERKUNCI • TIM TERVERIFIKASI SAH
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-950 text-[10px] font-mono-tech font-bold uppercase">
                    Verifikasi Panitia Selesai
                  </span>
                </div>
                <p className="text-xs font-mono-tech text-emerald-900 mt-1 leading-relaxed">
                  Data pendaftaran tim <strong>{teamForm.name} ({teamForm.code})</strong> telah selesai diperiksa dan dinyatakan <strong>SAH & LOLOS SCREENING</strong> oleh Panitia Pelaksana Turnamen. 
                  Seluruh data identitas klub, susunan staf ofisial, dan skuad pemain resmi telah dikunci secara permanen. Perubahan data mandiri tidak lagi diizinkan.
                </p>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-2 self-start sm:self-center">
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-emerald-300 text-emerald-950 rounded-xs text-xs font-mono-tech font-bold uppercase transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs no-print"
              >
                <Printer className="w-3.5 h-3.5 text-emerald-700" />
                <span>Cetak Lembar A1 Sah</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Notice & Quick Unlock for Verified Teams */}
      {!isTeamViewer && teamForm.status === 'verified' && (
        <div className="p-4 bg-blue-50 border-2 border-blue-400 rounded-xs shadow-xs text-black">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-syne font-bold text-xs uppercase text-blue-950">
                    Mode Administrator: Tim Ini Berstatus Terverifikasi (Terkunci untuk Ofisial Tim)
                  </span>
                  <span className="px-1.5 py-0.5 rounded-2xs bg-blue-200 text-blue-900 text-[9px] font-mono-tech font-bold uppercase">
                    Admin Full Edit
                  </span>
                </div>
                <p className="text-[11px] font-mono-tech text-blue-900 mt-0.5">
                  Anda memiliki wewenang penuh untuk mengubah data pendaftaran, susunan pemain, atau membuka kunci pendaftaran tim ini.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  const updated = {
                    ...teamForm,
                    status: 'pending' as const,
                    screeningNotes: 'Kunci pendaftaran dibuka oleh Administrator untuk perbaikan/revisi data.',
                  };
                  setTeamForm(updated);
                  onSaveTeam(updated);
                  if (showToast) showToast('Kunci pendaftaran tim berhasil dibuka! Status diubah ke Audit Dokumen (Pending).');
                }}
                className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xs text-xs font-mono-tech font-bold uppercase transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Buka Kunci Tim (Pending)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Team Identification Badge Card */}
      <div className="bg-white border border-slate-200 rounded-xs p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-5 border-b border-slate-100">
          <div className="flex items-start sm:items-center gap-4">
            <div className="relative group w-18 h-18 sm:w-20 sm:h-20 rounded-xs bg-slate-50 border-2 border-slate-200 p-2 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
              {teamForm.logoUrl ? (
                <img
                  src={teamForm.logoUrl}
                  alt={teamForm.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <Shield className="w-10 h-10 text-slate-400" />
              )}
              {!isLocked && (
                <label 
                  className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[9px] font-mono-tech font-bold cursor-pointer"
                  title="Ganti Logo Klub"
                >
                  <Camera className="w-4 h-4 mb-0.5" />
                  <span>Ubah Logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleTeamLogoUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 bg-black text-white text-[10px] font-mono-tech font-bold rounded-2xs">
                  {teamForm.code}
                </span>
                <span className="text-lg sm:text-xl font-syne font-black text-black uppercase">
                  {teamForm.name}
                </span>
                {teamForm.assignedGroup && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 border border-blue-200 text-[10px] font-mono-tech font-bold rounded-2xs uppercase">
                    {teamForm.assignedGroup}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 font-mono-tech flex flex-wrap items-center gap-3">
                <span>📍 {teamForm.originCity}</span>
                <span>•</span>
                <span>Est. {teamForm.establishedYear}</span>
              </div>
              <div className="flex items-center gap-2 pt-1 text-[11px] font-mono-tech">
                <span className="text-slate-500">Jersey:</span>
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs inline-block"
                    style={{ backgroundColor: teamForm.primaryJerseyColor }}
                    title="Jersey Home"
                  />
                  <span className="text-[10px] text-slate-600 font-bold">Home</span>
                </div>
                <span className="text-slate-300">/</span>
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs inline-block"
                    style={{ backgroundColor: teamForm.secondaryJerseyColor }}
                    title="Jersey Away"
                  />
                  <span className="text-[10px] text-slate-600 font-bold">Away</span>
                </div>
              </div>
            </div>
          </div>

          {/* Registration Verification Status Pill */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-center gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono-tech font-bold uppercase text-slate-500">
                Status Registrasi:
              </span>
              {teamForm.status === 'verified' ? (
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-2xs text-xs font-mono-tech font-bold uppercase flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Lolos Screening</span>
                </span>
              ) : teamForm.status === 'pending' ? (
                <span className="px-2.5 py-1 bg-amber-100 text-amber-800 border border-amber-300 rounded-2xs text-xs font-mono-tech font-bold uppercase flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Audit Dokumen</span>
                </span>
              ) : (
                <span className="px-2.5 py-1 bg-red-100 text-red-800 border border-red-300 rounded-2xs text-xs font-mono-tech font-bold uppercase flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                  <span>Perlu Perbaikan</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono-tech font-bold uppercase text-slate-500">
                Biaya Pendaftaran:
              </span>
              <span className={`px-2 py-0.5 rounded-2xs text-[11px] font-mono-tech font-bold uppercase ${
                teamForm.paymentStatus === 'paid'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {teamForm.paymentStatus === 'paid' ? 'Lunas (Verified)' : 'Belum Lunas'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xs">
            <span className="text-[10px] font-mono-tech uppercase font-bold text-slate-500 block">
              Pemain Terdaftar
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-bold font-mono-tech text-black">
                {teamForm.players.length}
              </span>
              <span className="text-xs font-mono-tech text-slate-400">
                / {config.maxPlayersPerTeam} Kuota
              </span>
            </div>
            <div className="w-full bg-slate-200 h-1 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-black h-full transition-all"
                style={{ width: `${Math.min(100, (teamForm.players.length / config.maxPlayersPerTeam) * 100)}%` }}
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xs">
            <span className="text-[10px] font-mono-tech uppercase font-bold text-slate-500 block">
              Screening Pemain
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-bold font-mono-tech text-emerald-600">
                {teamForm.players.filter((p) => p.isVerified).length}
              </span>
              <span className="text-xs font-mono-tech text-slate-400">
                / {teamForm.players.length} Terverifikasi
              </span>
            </div>
            <div className="text-[10px] font-mono-tech text-slate-500 mt-2">
              {teamForm.players.length - teamForm.players.filter((p) => p.isVerified).length} Menunggu Audit
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xs">
            <span className="text-[10px] font-mono-tech uppercase font-bold text-slate-500 block">
              Staf Ofisial
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-bold font-mono-tech text-black">
                {teamForm.officials?.length || 0}
              </span>
              <span className="text-xs font-mono-tech text-slate-400">/ 5 Staf</span>
            </div>
            <div className="text-[10px] font-mono-tech text-slate-500 mt-2 truncate">
              Pelatih: {teamForm.headCoachName || 'Belum diisi'}
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xs">
            <span className="text-[10px] font-mono-tech uppercase font-bold text-slate-500 block">
              BPJS Ketenagakerjaan
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              {teamForm.teamBpjsDocumentUrl ? (
                <span className="text-xs font-mono-tech font-bold text-emerald-700 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Ada Berkas
                </span>
              ) : (
                <span className="text-xs font-mono-tech font-bold text-amber-700 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Belum Diunggah
                </span>
              )}
            </div>
            <div className="text-[10px] font-mono-tech text-slate-500 mt-2">
              Syarat Wajib Turnamen U-17
            </div>
          </div>
        </div>
      </div>

      {/* Admin Verification Management Control Panel */}
      {!isTeamViewer && (
        <div className="bg-white border-2 border-black p-4 sm:p-5 rounded-xs shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-black" />
              <div>
                <h4 className="font-syne font-bold text-sm text-black uppercase tracking-wide">
                  Panel Verifikasi & Keabsahan Panitia
                </h4>
                <p className="text-[10px] text-slate-500 font-mono-tech">
                  Ubah status keabsahan tim, buka/kunci pendaftaran tim peserta, dan kelola catatan audit panitia
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono-tech uppercase font-bold text-slate-500">Status Keabsahan:</span>
              <span className={`px-2 py-0.5 rounded-2xs text-[10px] font-mono-tech font-bold uppercase ${
                teamForm.status === 'verified'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : teamForm.status === 'action_required'
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : teamForm.status === 'rejected'
                  ? 'bg-red-100 text-red-800 border border-red-300'
                  : 'bg-slate-100 text-slate-800 border border-slate-300'
              }`}>
                {teamForm.status === 'verified' ? 'Sah / Terkunci' : teamForm.status === 'action_required' ? 'Perlu Revisi (Terbuka)' : teamForm.status === 'rejected' ? 'Ditolak' : 'Audit (Terbuka)'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-5">
              <label className="block text-[11px] font-mono-tech font-bold uppercase text-black mb-1.5">
                Ubah Status Keabsahan Tim:
              </label>
              <select
                value={teamForm.status}
                onChange={(e) => {
                  const newStatus = e.target.value as Team['status'];
                  const updated = { ...teamForm, status: newStatus };
                  setTeamForm(updated);
                  onSaveTeam(updated);
                  if (showToast) {
                    showToast(`Status keabsahan tim diubah ke: ${newStatus.toUpperCase()}`);
                  }
                }}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xs text-xs font-mono-tech font-bold text-black focus:border-black focus:outline-none cursor-pointer"
              >
                <option value="verified">✅ Sah / Lolos Verifikasi (Kunci Portal Tim)</option>
                <option value="pending">⏳ Audit Dokumen / Sedang Diperiksa (Buka Kunci)</option>
                <option value="action_required">⚠️ Perlu Revisi Berkas (Buka Kunci Tim)</option>
                <option value="rejected">❌ Ditolak / Diskualifikasi</option>
              </select>
            </div>

            <div className="md:col-span-7">
              <label className="block text-[11px] font-mono-tech font-bold uppercase text-black mb-1.5">
                Catatan Verifikasi Panitia (Tampil di Tim):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={teamForm.screeningNotes || ''}
                  onChange={(e) => setTeamForm({ ...teamForm, screeningNotes: e.target.value })}
                  placeholder="Misal: Nomor akta lahir dan NISN valid. Berkas lengkap."
                  className="flex-1 p-2 bg-slate-50 border border-slate-300 rounded-xs text-xs font-mono-tech text-black focus:border-black focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    onSaveTeam(teamForm);
                    if (showToast) showToast('Catatan verifikasi panitia berhasil disimpan.');
                  }}
                  className="px-3.5 py-2 bg-black hover:bg-[#ff4d00] text-white rounded-xs text-xs font-mono-tech font-bold uppercase transition-colors shrink-0 cursor-pointer"
                >
                  Simpan Catatan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub Tabs Navigation */}
      <div className="flex items-center gap-1 border-b border-slate-200 bg-white px-3 pt-2 rounded-t-xs">
        <button
          onClick={() => setActiveSubTab('profile')}
          className={`py-2.5 px-4 text-xs font-mono-tech font-bold uppercase transition-colors relative cursor-pointer ${
            activeSubTab === 'profile'
              ? 'text-black border-b-2 border-black'
              : 'text-slate-500 hover:text-black'
          }`}
        >
          1. Profil & Identitas Tim
        </button>
        <button
          onClick={() => setActiveSubTab('players')}
          className={`py-2.5 px-4 text-xs font-mono-tech font-bold uppercase transition-colors relative cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'players'
              ? 'text-black border-b-2 border-black'
              : 'text-slate-500 hover:text-black'
          }`}
        >
          <span>2. Skuad Pemain Resmi</span>
          <span className="px-1.5 py-0.2 bg-black text-white text-[9px] rounded-full">
            {teamForm.players.length}
          </span>
        </button>
        <button
          onClick={() => setActiveSubTab('officials')}
          className={`py-2.5 px-4 text-xs font-mono-tech font-bold uppercase transition-colors relative cursor-pointer ${
            activeSubTab === 'officials'
              ? 'text-black border-b-2 border-black'
              : 'text-slate-500 hover:text-black'
          }`}
        >
          3. Staf Ofisial & Pelatih
        </button>
        <button
          onClick={() => setActiveSubTab('documents')}
          className={`py-2.5 px-4 text-xs font-mono-tech font-bold uppercase transition-colors relative cursor-pointer ${
            activeSubTab === 'documents'
              ? 'text-black border-b-2 border-black'
              : 'text-slate-500 hover:text-black'
          }`}
        >
          4. Dokumen & Berkas BPJS
        </button>
      </div>

      {/* TAB CONTENT 1: PROFIL & IDENTITAS TIM */}
      {activeSubTab === 'profile' && (
        <div className="bg-white border border-slate-200 rounded-b-xs p-6 space-y-6 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[11px] font-mono-tech uppercase font-bold text-black mb-1.5">
                Nama Lengkap Klub / Tim *
              </label>
              <input
                type="text"
                disabled={isLocked}
                value={teamForm.name}
                onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                className={`w-full p-2.5 rounded-xs text-xs font-mono-tech ${isLocked ? 'bg-slate-100 text-slate-700 border-slate-200 cursor-not-allowed' : 'bg-white border border-slate-300 text-black focus:border-black focus:outline-none'}`}
                placeholder="Misal: Garuda Muda FC"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono-tech uppercase font-bold text-black mb-1.5">
                Singkatan / Kode Tim (3-4 Huruf) *
              </label>
              <input
                type="text"
                disabled={isLocked}
                value={teamForm.code}
                maxLength={5}
                onChange={(e) => setTeamForm({ ...teamForm, code: e.target.value.toUpperCase() })}
                className={`w-full p-2.5 rounded-xs text-xs font-mono-tech font-bold uppercase ${isLocked ? 'bg-slate-100 text-slate-700 border-slate-200 cursor-not-allowed' : 'bg-white border border-slate-300 text-black focus:border-black focus:outline-none'}`}
                placeholder="Misal: GMD"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono-tech uppercase font-bold text-black mb-1.5">
                Kota / Kabupaten Asal *
              </label>
              <input
                type="text"
                disabled={isLocked}
                value={teamForm.originCity}
                onChange={(e) => setTeamForm({ ...teamForm, originCity: e.target.value })}
                className={`w-full p-2.5 rounded-xs text-xs font-mono-tech ${isLocked ? 'bg-slate-100 text-slate-700 border-slate-200 cursor-not-allowed' : 'bg-white border border-slate-300 text-black focus:border-black focus:outline-none'}`}
                placeholder="Misal: Jakarta Selatan"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono-tech uppercase font-bold text-black mb-1.5">
                Tahun Berdiri Klub
              </label>
              <input
                type="number"
                disabled={isLocked}
                value={teamForm.establishedYear}
                onChange={(e) => setTeamForm({ ...teamForm, establishedYear: Number(e.target.value) })}
                className={`w-full p-2.5 rounded-xs text-xs font-mono-tech ${isLocked ? 'bg-slate-100 text-slate-700 border-slate-200 cursor-not-allowed' : 'bg-white border border-slate-300 text-black focus:border-black focus:outline-none'}`}
              />
            </div>
          </div>

          {/* Jersey Colors */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-mono-tech uppercase font-bold text-black mb-3 flex items-center gap-2">
              <Shirt className="w-4 h-4 text-slate-700" />
              <span>Warna Jersey Resmi Turnamen</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xs flex items-center gap-4">
                <input
                  type="color"
                  disabled={isLocked}
                  value={teamForm.primaryJerseyColor}
                  onChange={(e) => setTeamForm({ ...teamForm, primaryJerseyColor: e.target.value })}
                  className={`w-10 h-10 rounded border border-slate-300 ${isLocked ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                  title="Pilih warna jersey home"
                />
                <div>
                  <span className="text-[10px] font-mono-tech uppercase font-bold text-slate-500 block">
                    Jersey Utama (Home)
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs inline-block"
                      style={{ backgroundColor: teamForm.primaryJerseyColor }}
                    />
                    <span className="text-xs font-mono-tech font-bold text-black">
                      Warna Jersey Terpilih
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xs flex items-center gap-4">
                <input
                  type="color"
                  disabled={isLocked}
                  value={teamForm.secondaryJerseyColor}
                  onChange={(e) => setTeamForm({ ...teamForm, secondaryJerseyColor: e.target.value })}
                  className={`w-10 h-10 rounded border border-slate-300 ${isLocked ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                  title="Pilih warna jersey away"
                />
                <div>
                  <span className="text-[10px] font-mono-tech uppercase font-bold text-slate-500 block">
                    Jersey Cadangan (Away)
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs inline-block"
                      style={{ backgroundColor: teamForm.secondaryJerseyColor }}
                    />
                    <span className="text-xs font-mono-tech font-bold text-black">
                      Warna Jersey Terpilih
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            {isLocked ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xs text-xs font-mono-tech text-emerald-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Profil tim telah terkunci karena tim telah diverifikasi dan disahkan oleh panitia.</span>
              </div>
            ) : (
              <button
                onClick={handleSaveAll}
                className="px-5 py-2.5 bg-black hover:bg-[#ff4d00] text-white text-xs font-mono-tech font-bold uppercase rounded-xs transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Profil Tim</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: SKUAD PEMAIN RESMI */}
      {activeSubTab === 'players' && (
        <div className="bg-white border border-slate-200 rounded-b-xs p-6 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-syne font-bold text-black uppercase">
                Daftar Pemain Resmi ({teamForm.players.length} / {config.maxPlayersPerTeam})
              </h3>
              <p className="text-xs text-slate-500 font-mono-tech">
                Minimal {config.minPlayersPerTeam} pemain, maksimal {config.maxPlayersPerTeam} pemain. Batas usia maksimal {config.maxAgeLimit} tahun.
              </p>
            </div>
            {isLocked ? (
              <div className="px-3.5 py-2 bg-slate-100 border border-slate-300 text-slate-500 rounded-xs text-xs font-mono-tech font-bold uppercase flex items-center gap-1.5 cursor-not-allowed select-none">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Skuad Terkunci</span>
              </div>
            ) : (
              <button
                onClick={handleOpenAddPlayer}
                className="px-4 py-2 bg-black hover:bg-[#ff4d00] text-white rounded-xs text-xs font-mono-tech font-bold uppercase transition-colors flex items-center gap-1.5 self-start cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Pemain</span>
              </button>
            )}
          </div>

          {/* Player Cards Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-mono-tech font-bold uppercase text-slate-600">
                  <th className="py-2.5 px-3 text-center w-12">No</th>
                  <th className="py-2.5 px-3">Pemain</th>
                  <th className="py-2.5 px-3 text-center">Posisi</th>
                  <th className="py-2.5 px-3 text-center">Tgl Lahir / Usia</th>
                  <th className="py-2.5 px-3">NIK / NISN</th>
                  <th className="py-2.5 px-3 text-center">Status Screening</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-mono-tech">
                {teamForm.players.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Belum ada pemain yang didaftarkan. Klik "Tambah Pemain" di atas.
                    </td>
                  </tr>
                ) : (
                  teamForm.players.map((p, idx) => {
                    const age = calculateAge(p.birthDate);
                    const isAgeValid = age <= config.maxAgeLimit;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 text-center">
                          <span className="w-7 h-7 rounded bg-black text-white font-mono-tech font-black text-xs inline-flex items-center justify-center">
                            {p.number}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden shrink-0 border border-slate-300">
                              {p.photoUrl ? (
                                <img src={p.photoUrl} alt={p.name} className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-full h-full p-1 text-slate-400" />
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-black flex items-center gap-1.5">
                                <span>{p.name || 'Nama Belum Diisi'}</span>
                                {p.isCaptain && (
                                  <span className="px-1 py-0.2 bg-amber-400 text-black text-[9px] font-bold rounded-2xs">
                                    C
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 block">ID: {p.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-2xs text-[10px] font-bold ${
                            p.position === 'GK'
                              ? 'bg-amber-100 text-amber-800'
                              : p.position === 'DF'
                              ? 'bg-blue-100 text-blue-800'
                              : p.position === 'MF'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {p.position}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="font-bold text-black">{p.birthDate}</div>
                          <span className={`text-[10px] font-bold ${isAgeValid ? 'text-slate-500' : 'text-red-600'}`}>
                            {age} Thn {isAgeValid ? '✓' : '(Over-age)'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">
                          <div>NIK: {p.nik || '-'}</div>
                          {p.nisn && <div className="text-[10px] text-slate-400">NISN: {p.nisn}</div>}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {!isTeamViewer ? (
                            <button
                              type="button"
                              onClick={() => {
                                const updatedPlayers = teamForm.players.map((pl, i) =>
                                  i === idx ? { ...pl, isVerified: !pl.isVerified } : pl
                                );
                                const updated = { ...teamForm, players: updatedPlayers };
                                setTeamForm(updated);
                                onSaveTeam(updated);
                                if (showToast) {
                                  showToast(`Pemain ${p.name}: ${!p.isVerified ? 'SAH / LOLOS' : 'AUDIT KEMBALI'}`);
                                }
                              }}
                              className={`px-2 py-0.5 rounded-2xs text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors ${
                                p.isVerified
                                  ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300'
                                  : 'bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300'
                              }`}
                              title="Klik untuk mengubah status keabsahan pemain ini (Admin)"
                            >
                              {p.isVerified ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Lolos ✓</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3 h-3 text-amber-600" />
                                  <span>Audit</span>
                                </>
                              )}
                            </button>
                          ) : p.isVerified ? (
                            <span className="px-2 py-0.5 rounded-2xs bg-emerald-100 text-emerald-800 text-[10px] font-bold inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Lolos</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-2xs bg-amber-100 text-amber-800 text-[10px] font-bold inline-flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Audit</span>
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {isLocked ? (
                            <span className="px-2 py-1 rounded-2xs bg-emerald-100 text-emerald-900 border border-emerald-200 text-[10px] font-mono-tech font-bold inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                              <span>Sah & Terkunci</span>
                            </span>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditPlayer(idx)}
                                className="p-1.5 hover:bg-slate-200 text-slate-700 rounded cursor-pointer"
                                title="Edit Pemain"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeletePlayer(idx)}
                                className="p-1.5 hover:bg-red-50 text-red-600 rounded cursor-pointer"
                                title="Hapus Pemain"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: STAF OFISIAL */}
      {activeSubTab === 'officials' && (
        <div className="bg-white border border-slate-200 rounded-b-xs p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-syne font-bold text-black uppercase">
                Staf Ofisial & Pelatih Tim
              </h3>
              <p className="text-xs text-slate-500 font-mono-tech">
                Daftar ofisial yang berhak mendampingi tim di bench cadangan (Maksimal 5 Ofisial).
              </p>
            </div>
            {isLocked ? (
              <div className="px-3.5 py-2 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xs text-xs font-mono-tech font-bold uppercase flex items-center gap-1.5 select-none">
                <Lock className="w-3.5 h-3.5 text-emerald-700" />
                <span>Ofisial Terkunci</span>
              </div>
            ) : (
              <button
                onClick={handleSaveAll}
                className="px-4 py-2 bg-black hover:bg-[#ff4d00] text-white text-xs font-mono-tech font-bold uppercase rounded-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Staf Ofisial</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xs space-y-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-black" />
                <span className="text-xs font-mono-tech font-bold uppercase text-black">
                  1. Manajer Tim *
                </span>
              </div>
              <input
                type="text"
                disabled={isLocked}
                value={teamForm.managerName}
                onChange={(e) => setTeamForm({ ...teamForm, managerName: e.target.value })}
                className={`w-full p-2.5 rounded-xs text-xs font-mono-tech ${isLocked ? 'bg-slate-100 text-slate-700 border-slate-200 cursor-not-allowed' : 'bg-white border border-slate-300 text-black focus:border-black focus:outline-none'}`}
                placeholder="Nama Lengkap Manajer"
              />
              <div>
                <label className="block text-[10px] font-mono-tech uppercase font-bold text-slate-500 mb-1">
                  Nomor Kontak / WhatsApp Manajer *
                </label>
                <input
                  type="text"
                  disabled={isLocked}
                  value={teamForm.managerPhone}
                  onChange={(e) => setTeamForm({ ...teamForm, managerPhone: e.target.value })}
                  className={`w-full p-2.5 rounded-xs text-xs font-mono-tech ${isLocked ? 'bg-slate-100 text-slate-700 border-slate-200 cursor-not-allowed' : 'bg-white border border-slate-300 text-black focus:border-black focus:outline-none'}`}
                  placeholder="Misal: 0812-3456-7890"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xs space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-black" />
                <span className="text-xs font-mono-tech font-bold uppercase text-black">
                  2. Pelatih Kepala (Head Coach) *
                </span>
              </div>
              <input
                type="text"
                disabled={isLocked}
                value={teamForm.headCoachName}
                onChange={(e) => setTeamForm({ ...teamForm, headCoachName: e.target.value })}
                className={`w-full p-2.5 rounded-xs text-xs font-mono-tech ${isLocked ? 'bg-slate-100 text-slate-700 border-slate-200 cursor-not-allowed' : 'bg-white border border-slate-300 text-black focus:border-black focus:outline-none'}`}
                placeholder="Nama Lengkap Pelatih Kepala"
              />
              <p className="text-[10px] font-mono-tech text-slate-500">
                Wajib memiliki lisensi kepelatihan minimal Lisensi D PSSI / AFC C.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: DOKUMEN & BERKAS BPJS */}
      {activeSubTab === 'documents' && (
        <div className="bg-white border border-slate-200 rounded-b-xs p-6 space-y-6 shadow-xs">
          <div>
            <h3 className="text-base font-syne font-bold text-black uppercase">
              Dokumen Persyaratan Turnamen
            </h3>
            <p className="text-xs text-slate-500 font-mono-tech">
              Sertifikat BPJS Ketenagakerjaan kolektif tim dan bukti administrasi pendaftaran.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* BPJS Certificate Card */}
            <div className="p-5 border border-slate-200 rounded-xs bg-slate-50 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span className="font-bold text-xs font-mono-tech uppercase text-black">
                    Sertifikat BPJS Ketenagakerjaan Tim
                  </span>
                </div>
                {teamForm.teamBpjsDocumentUrl ? (
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-mono-tech font-bold rounded-2xs">
                    Terunggah
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-mono-tech font-bold rounded-2xs">
                    Wajib Diunggah
                  </span>
                )}
              </div>

              <p className="text-[11px] text-slate-600 font-mono-tech">
                Sesuai regulasi turnamen KingDC U-17, seluruh pemain dan ofisial wajib terlindungi jaminan kecelakaan kerja & kematian BPJS Ketenagakerjaan.
              </p>

              {teamForm.teamBpjsDocumentUrl ? (
                <div className="p-3 bg-white border border-slate-200 rounded-xs flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-black shrink-0" />
                    <span className="text-xs font-mono-tech text-black truncate">
                      Sertifikat_BPJS_Kolektif_{teamForm.code}.pdf
                    </span>
                  </div>
                  <a
                    href={teamForm.teamBpjsDocumentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-mono-tech text-[#ff4d00] font-bold hover:underline shrink-0"
                  >
                    Buka Berkas
                  </a>
                </div>
              ) : null}

              <div>
                {isLocked ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xs text-center space-y-1 text-emerald-950 font-mono-tech">
                    <ShieldCheck className="w-6 h-6 text-emerald-700 mx-auto mb-1" />
                    <div className="text-xs font-bold uppercase">Sertifikat BPJS Disetujui & Terkunci</div>
                    <p className="text-[11px] text-emerald-800">
                      Dokumen BPJS Ketenagakerjaan tim telah diverifikasi dan disahkan panitia. Berkas tidak dapat diubah kembali.
                    </p>
                  </div>
                ) : (
                  <label className="block w-full py-3 px-4 bg-white border-2 border-dashed border-slate-300 hover:border-black rounded-xs text-center cursor-pointer transition-colors">
                    <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                    <span className="text-xs font-mono-tech font-bold text-black block">
                      {teamForm.teamBpjsDocumentUrl ? 'Unggah Berkas Baru' : 'Pilih Sertifikat BPJS Tim'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono-tech">
                      Mendukung file Gambar (JPG/PNG) atau PDF (Maks. 10MB)
                    </span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleBpjsUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Payment & Receipt Verification */}
            <div className="p-5 border border-slate-200 rounded-xs bg-slate-50 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-black" />
                  <span className="font-bold text-xs font-mono-tech uppercase text-black">
                    Status Administrasi & Kuitansi
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded-2xs text-[10px] font-mono-tech font-bold uppercase ${
                  teamForm.paymentStatus === 'paid'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {teamForm.paymentStatus === 'paid' ? 'Lunas' : 'Menunggu Pelunasan'}
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono-tech text-slate-700 bg-white p-3 border border-slate-200 rounded-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nomor Registrasi:</span>
                  <span className="font-bold text-black">{teamForm.receiptNumber || 'REG-KINGDC-' + teamForm.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Biaya Pendaftaran:</span>
                  <span className="font-bold text-black">{formatRupiah(config.registrationFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Jumlah Terbayar:</span>
                  <span className="font-bold text-emerald-600">{formatRupiah(teamForm.paidAmount || config.registrationFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tanggal Registrasi:</span>
                  <span className="text-black">{teamForm.registrationDate}</span>
                </div>
              </div>

              {/* Official Login Credentials Box - Active Only When Paid */}
              {teamForm.paymentStatus === 'paid' ? (
                <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-xs font-mono-tech text-emerald-950 uppercase">
                      <Key className="w-4 h-4 text-emerald-700" />
                      <span>Akun Login Portal Resmi Tim</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded-2xs bg-emerald-200 text-emerald-900 text-[9px] font-mono-tech font-bold uppercase">
                      Aktif (Lunas)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono-tech">
                    <div className="p-2 bg-white border border-emerald-200 rounded-xs">
                      <span className="text-[10px] text-slate-500 uppercase block font-bold">Username Login:</span>
                      <span className="font-bold text-black text-xs select-all">
                        {teamForm.portalUsername || getDefaultTeamUsername(teamForm)}
                      </span>
                    </div>
                    <div className="p-2 bg-white border border-emerald-200 rounded-xs">
                      <span className="text-[10px] text-slate-500 uppercase block font-bold">Kode Akses / PIN:</span>
                      <span className="font-black text-emerald-800 text-xs select-all">
                        {teamForm.portalPassword || getDefaultTeamPassword(teamForm)}
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-emerald-800 font-mono-tech">
                    Simpan username & kode akses ini untuk masuk kembali ke portal ofisial tim kapan saja.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xs flex items-start gap-2 text-xs font-mono-tech text-amber-900">
                  <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Kode Akses Login Belum Diterbitkan</div>
                    <div className="text-[10px] text-amber-800 mt-0.5">
                      Kode login resmi portal tim diterbitkan otomatis setelah biaya pendaftaran turnamen berstatus LUNAS.
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-200">
                <p className="text-[10px] text-slate-500 font-mono-tech">
                  Kuitansi resmi digital diterbitkan dan disahkan panitia pelaksana turnamen.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenReceipt) {
                      onOpenReceipt(teamForm);
                    }
                  }}
                  className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xs text-xs font-mono-tech font-bold uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs whitespace-nowrap"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Cetak Kuitansi Resmi</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH / EDIT PEMAIN */}
      {isPlayerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-slate-300 w-full max-w-lg rounded-xs shadow-2xl p-6 my-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-syne font-bold text-base text-black uppercase">
                {editingPlayerIndex !== null ? 'Edit Data Pemain' : 'Tambah Pemain Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsPlayerModalOpen(false)}
                className="p-1 text-slate-400 hover:text-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlayerModal} className="space-y-4 text-xs font-mono-tech">
              {/* Photo & Number Row */}
              <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-xs">
                <div className="relative group w-16 h-16 rounded-full bg-slate-200 border-2 border-slate-300 overflow-hidden shrink-0 flex items-center justify-center">
                  {playerForm.photoUrl ? (
                    <img src={playerForm.photoUrl} alt="Foto Pemain" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-slate-400" />
                  )}
                  <label className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-[9px] font-bold">
                    <span>Ubah</span>
                    <input type="file" accept="image/*" onChange={handlePlayerPhotoUpload} className="hidden" />
                  </label>
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                    Nomor Punggung (1-99) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    required
                    value={playerForm.number}
                    onChange={(e) => setPlayerForm({ ...playerForm, number: Number(e.target.value) })}
                    className="w-24 p-2 bg-white border border-slate-300 rounded-xs font-black text-center text-sm focus:border-black focus:outline-none"
                  />
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-black mb-1">
                  Nama Lengkap Pemain *
                </label>
                <input
                  type="text"
                  required
                  value={playerForm.name}
                  onChange={(e) => setPlayerForm({ ...playerForm, name: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xs text-xs font-mono-tech text-black focus:border-black focus:outline-none"
                  placeholder="Misal: Bagus Kahfi"
                />
              </div>

              {/* Position & Birthdate */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-black mb-1">
                    Posisi Bermain *
                  </label>
                  <select
                    value={playerForm.position}
                    onChange={(e) => setPlayerForm({ ...playerForm, position: e.target.value as PlayerPosition })}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xs text-xs font-mono-tech text-black font-bold focus:border-black focus:outline-none"
                  >
                    <option value="GK">GK - Kiper (Goalkeeper)</option>
                    <option value="DF">DF - Bek (Defender)</option>
                    <option value="MF">MF - Gelandang (Midfielder)</option>
                    <option value="FW">FW - Penyerang (Forward)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-black mb-1">
                    Tanggal Lahir *
                  </label>
                  <input
                    type="date"
                    required
                    value={playerForm.birthDate}
                    onChange={(e) => setPlayerForm({ ...playerForm, birthDate: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xs text-xs font-mono-tech text-black focus:border-black focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Usia saat ini: {calculateAge(playerForm.birthDate)} tahun
                  </span>
                </div>
              </div>

              {/* NIK & NISN */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-black mb-1">
                    Nomor Induk Kependudukan (NIK)
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    value={playerForm.nik || ''}
                    onChange={(e) => setPlayerForm({ ...playerForm, nik: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xs text-xs font-mono-tech text-black focus:border-black focus:outline-none"
                    placeholder="16 Digit NIK KTP/KIA"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-black mb-1">
                    NISN (Siswa)
                  </label>
                  <input
                    type="text"
                    value={playerForm.nisn || ''}
                    onChange={(e) => setPlayerForm({ ...playerForm, nisn: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xs text-xs font-mono-tech text-black focus:border-black focus:outline-none"
                    placeholder="Nomor Induk Siswa Nasional"
                  />
                </div>
              </div>

              {/* Captain checkbox */}
              <div className="pt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isCaptain"
                    checked={playerForm.isCaptain || false}
                    onChange={(e) => setPlayerForm({ ...playerForm, isCaptain: e.target.checked })}
                    className="w-4 h-4 text-black focus:ring-0 rounded-xs cursor-pointer"
                  />
                  <label htmlFor="isCaptain" className="text-xs font-mono-tech font-bold text-black cursor-pointer">
                    Tunjuk sebagai Kapten Tim (C)
                  </label>
                </div>
              </div>

              {/* Admin Player Verification Toggle */}
              {!isTeamViewer && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xs flex items-center justify-between">
                  <div>
                    <span className="block text-xs font-bold text-emerald-950 uppercase font-mono-tech">
                      Status Keabsahan Pemain (Verifikasi Panitia)
                    </span>
                    <span className="text-[10px] text-emerald-800 font-mono-tech">
                      Tandai jika identitas, usia, dan akta pemain telah sah & lolos audit
                    </span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={playerForm.isVerified || false}
                      onChange={(e) => setPlayerForm({ ...playerForm, isVerified: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 focus:ring-0 rounded-xs cursor-pointer"
                    />
                    <span className="text-xs font-bold text-emerald-950 font-mono-tech">
                      {playerForm.isVerified ? 'Lolos (Sah)' : 'Belum Lolos'}
                    </span>
                  </label>
                </div>
              )}

              {/* Action buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsPlayerModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-black hover:bg-slate-100 rounded-xs font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-black hover:bg-[#ff4d00] text-white rounded-xs font-bold uppercase transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Pemain</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
