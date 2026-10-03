import React, { useState, useEffect } from 'react';
import { TournamentConfig, Team, Match, AdminUser } from '../types/tournament';
import { exportTournamentBackup } from '../utils/storage';
import { X, Save, Download, Upload, Shield, Check, AlertTriangle, Trash2, Key } from 'lucide-react';

interface TournamentSettingsModalProps {
  config: TournamentConfig;
  teams: Team[];
  matches?: Match[];
  isOpen: boolean;
  onClose: () => void;
  onSaveConfig: (updatedConfig: TournamentConfig) => void;
  onResetData: (mode?: 'initial' | 'empty') => void;
  onImportBackup: (importedData: { config: TournamentConfig; teams: Team[]; matches?: Match[] }) => void;
  onOpenChangePassword?: () => void;
  currentAdmin?: AdminUser | null;
}

export const TournamentSettingsModal: React.FC<TournamentSettingsModalProps> = ({
  config,
  teams,
  matches,
  isOpen,
  onClose,
  onSaveConfig,
  onResetData,
  onImportBackup,
  onOpenChangePassword,
  currentAdmin,
}) => {
  const [form, setForm] = useState<TournamentConfig>({ ...config });
  const [successMsg, setSuccessMsg] = useState(false);
  const [confirmResetMode, setConfirmResetMode] = useState<'none' | 'empty'>('none');

  useEffect(() => {
    if (isOpen) {
      setForm({ ...config });
      setConfirmResetMode('none');
    }
  }, [config, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(form);
    setSuccessMsg(true);
    setTimeout(() => {
      setSuccessMsg(false);
      onClose();
    }, 500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.config && Array.isArray(parsed.teams)) {
          onImportBackup({ config: parsed.config, teams: parsed.teams, matches: parsed.matches });
          alert('Berhasil mengimpor data cadangan turnamen!');
          onClose();
        } else {
          alert('Format file JSON tidak sesuai struktur KingDC.');
        }
      } catch (err) {
        alert('Gagal membaca file JSON: ' + String(err));
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-display">
              Pengaturan & Konfigurasi Turnamen
            </h2>
            <div className="text-xs text-slate-500">
              Ubah regulasi usia, biaya registrasi, kuota tim, & kelola backup data
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2 font-semibold">
              <Check className="w-4 h-4" />
              <span>Pengaturan turnamen berhasil disimpan!</span>
            </div>
          )}

          {/* Tournament Identity */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-100">
              Identitas & Penyelenggara
            </h3>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Turnamen *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Edisi / Seri</label>
                <input
                  type="text"
                  value={form.edition}
                  onChange={(e) => setForm({ ...form, edition: e.target.value })}
                  placeholder="Edisi Ke-VIII 2026"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Panitia Penyelenggara</label>
                <input
                  type="text"
                  value={form.organizer}
                  onChange={(e) => setForm({ ...form, organizer: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Age & Quota Rules */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-100">
              Regulasi Usia & Batas Kuota Tim
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kategori Turnamen</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="U-17 Putra"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Maksimal Usia (Tahun)</label>
                <input
                  type="number"
                  min={8}
                  max={99}
                  value={form.maxAgeLimit}
                  onChange={(e) => setForm({ ...form, maxAgeLimit: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kuota Maksimal Tim</label>
                <input
                  type="number"
                  min={4}
                  max={64}
                  value={form.maxTeams}
                  onChange={(e) => setForm({ ...form, maxTeams: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Biaya Pendaftaran (Rp)</label>
                <input
                  type="number"
                  step={100000}
                  value={form.registrationFee}
                  onChange={(e) => setForm({ ...form, registrationFee: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Min. Pemain per Tim</label>
                <input
                  type="number"
                  min={11}
                  max={25}
                  value={form.minPlayersPerTeam}
                  onChange={(e) => setForm({ ...form, minPlayersPerTeam: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Maks. Pemain per Tim</label>
                <input
                  type="number"
                  min={14}
                  max={35}
                  value={form.maxPlayersPerTeam}
                  onChange={(e) => setForm({ ...form, maxPlayersPerTeam: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Dates & Venues */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-100">
              Jadwal & Lokasi Stadion
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Batas Akhir Pendaftaran</label>
                <input
                  type="date"
                  value={form.registrationDeadline}
                  onChange={(e) => setForm({ ...form, registrationDeadline: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tanggal Mulai Turnamen</label>
                <input
                  type="date"
                  value={form.tournamentStartDate}
                  onChange={(e) => setForm({ ...form, tournamentStartDate: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Stadion / Venue</label>
                <input
                  type="text"
                  value={form.stadiumVenue}
                  onChange={(e) => setForm({ ...form, stadiumVenue: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kota Penyelenggara</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Data Backup & Restore */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center justify-between">
              <span>Cadangan & Pemulihan Berkas Data (Backup)</span>
              <span className="text-[10px] text-slate-400 font-normal">Format Standar KingDC JSON</span>
            </h3>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => exportTournamentBackup(form, teams, matches)}
                className="px-3 py-1.5 font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs text-xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Unduh File Cadangan (.JSON)</span>
              </button>

              <label className="px-3 py-1.5 font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs text-xs">
                <Upload className="w-3.5 h-3.5 text-slate-600" />
                <span>Impor File Cadangan</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* ADMIN SECURITY & CHANGE PASSWORD ZONE */}
          {onOpenChangePassword && (
            <div className="space-y-3 pt-3 border-t border-slate-200">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Key className="w-4 h-4 text-[#ff4d00]" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <span>Keamanan & Kata Sandi Administrator</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                      Ubah kata sandi akun masuk admin panitia saat ini ({currentAdmin?.name || 'Administrator'}) untuk menjaga keamanan sistem.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenChangePassword();
                  }}
                  className="shrink-0 py-2 px-3.5 text-xs font-bold text-black bg-white hover:bg-slate-100 border border-black rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Key className="w-3.5 h-3.5 text-[#ff4d00]" />
                  <span>Ganti Kata Sandi</span>
                </button>
              </div>
            </div>
          )}

          {/* DEDICATED RESET DATA TURNAMEN ZONE */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-rose-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Pusat Reset Data Turnamen</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Gunakan opsi berikut untuk mengatur ulang data tim, bagan pertandingan, atau mengosongkan turnamen.
                </p>
              </div>
            </div>

            {/* In-Modal Confirmation Banner */}
            {confirmResetMode === 'empty' ? (
              <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-xl text-xs space-y-3 animate-in fade-in">
                <div className="flex items-start gap-2.5 text-rose-950 font-bold">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-extrabold">
                      Konfirmasi Kosongkan Seluruh Data Turnamen?
                    </div>
                    <p className="text-[11px] text-rose-800 font-normal mt-1 leading-relaxed">
                      Tindakan ini akan menghapus SEMUA tim dan jadwal pertandingan turnamen (0 tim, 0 jadwal). Digunakan jika panitia ingin membuka pendaftaran baru dari nol. Pastikan Anda telah mengunduh file cadangan jika masih membutuhkan data saat ini.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-rose-200">
                  <button
                    type="button"
                    onClick={() => {
                      onResetData('empty');
                      setConfirmResetMode('none');
                      onClose();
                    }}
                    className="px-4 py-2 font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Ya, Kosongkan Semua Data Sekarang</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmResetMode('none')}
                    className="px-3.5 py-2 font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    Batalkan
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {/* Button: Clean slate empty tournament */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Kosongkan Seluruh Data (Mulai dari Nol)</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      Hapus seluruh daftar tim dan jadwal turnamen sehingga sistem bersih dan siap untuk pendaftaran baru.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setConfirmResetMode('empty')}
                    className="shrink-0 py-2 px-3.5 text-xs font-bold text-rose-700 bg-white hover:bg-rose-50 border border-rose-300 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Kosongkan Semua Tim</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Batalkan
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan Regulasi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
