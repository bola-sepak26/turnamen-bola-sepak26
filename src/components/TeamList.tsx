import React, { useState, useMemo } from 'react';
import { Team, TournamentConfig, TeamStatus, PaymentStatus, Match } from '../types/tournament';
import { formatRupiah, formatDateIndo, validateTeamEligibility } from '../utils/formatters';
import { 
  Search, 
  Plus, 
  LayoutGrid, 
  Table as TableIcon, 
  CheckCircle2, 
  AlertTriangle, 
  Printer, 
  IdCard, 
  Receipt, 
  FileText, 
  Trash2, 
  Edit3,
  ExternalLink,
  ShieldAlert,
  Activity,
  Key
} from 'lucide-react';

interface TeamListProps {
  teams: Team[];
  config: TournamentConfig;
  matches?: Match[];
  onSelectTeam: (team: Team) => void;
  onEditTeam: (team: Team) => void;
  onDeleteTeam: (teamId: string) => void;
  onClearAllTeams?: () => void;
  onOpenRegisterModal: () => void;
  onOpenReceipt: (team: Team) => void;
  onOpenIdCards: (team: Team) => void;
  onOpenMatchSheet: (team: Team) => void;
  onOpenMatchSummary?: (team: Team) => void;
  onLoginAsTeamPortal?: (team: Team) => void;
  isReadOnly?: boolean;
}

export const TeamList: React.FC<TeamListProps> = ({
  teams,
  config,
  matches = [],
  onSelectTeam,
  onEditTeam,
  onDeleteTeam,
  onClearAllTeams,
  onOpenRegisterModal,
  onOpenReceipt,
  onOpenIdCards,
  onOpenMatchSheet,
  onOpenMatchSummary,
  onLoginAsTeamPortal,
  isReadOnly = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TeamStatus>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | PaymentStatus>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'players'>('date');

  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      // Search matches
      const query = searchQuery.toLowerCase().trim();
      const matchSearch =
        !query ||
        team.name.toLowerCase().includes(query) ||
        team.code.toLowerCase().includes(query) ||
        team.originCity.toLowerCase().includes(query) ||
        team.originProvince.toLowerCase().includes(query) ||
        team.managerName.toLowerCase().includes(query) ||
        team.headCoachName.toLowerCase().includes(query) ||
        team.players.some((p) => p.name.toLowerCase().includes(query));

      // Status filter
      const matchStatus = statusFilter === 'all' || team.status === statusFilter;

      // Payment filter
      const matchPayment = paymentFilter === 'all' || team.paymentStatus === paymentFilter;

      return matchSearch && matchStatus && matchPayment;
    }).sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'players') return b.players.length - a.players.length;
      return new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime();
    });
  }, [teams, searchQuery, statusFilter, paymentFilter, sortBy]);

  return (
    <div className="space-y-6">
      {/* Header & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-display">
            {isReadOnly ? 'Profil & Direktori Seluruh Tim' : 'Direktori Tim Peserta'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Total {teams.length} dari kuota {config.maxTeams} kesebelasan terdaftar dalam sistem {config.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isReadOnly && onClearAllTeams && teams.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('PERINGATAN: Apakah Anda yakin ingin mengosongkan SELURUH data tim peserta? Tindakan ini akan menghapus semua tim dan tidak dapat dibatalkan.')) {
                  onClearAllTeams();
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors whitespace-nowrap shadow-xs cursor-pointer"
              title="Hapus semua tim peserta"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Kosongkan Semua Tim</span>
            </button>
          )}
          {!isReadOnly ? (
            <button
              onClick={onOpenRegisterModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg transition-colors whitespace-nowrap shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Pendaftar Tim</span>
            </button>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Akses Direktori Publik Klub</span>
            </span>
          )}
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama klub, kota, pemain, manajer..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* View mode toggle & Sort */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <span>Urutkan:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-md py-1.5 px-2 text-xs font-medium text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="date">Terbaru Mendaftar</option>
                <option value="name">Nama Klub (A-Z)</option>
                <option value="players">Jumlah Pemain Terbanyak</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Tampilan Grid"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Tampilan Tabel"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Segmented Controls (Adhering to Zero-Pill Section 1.A) */}
        <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-100 text-xs">
          {/* Status Keabsahan Segment */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Status:</span>
            <div className="inline-flex bg-slate-100 p-0.5 rounded-md">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 font-medium rounded-sm transition-colors cursor-pointer ${
                  statusFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua ({teams.length})
              </button>
              <button
                onClick={() => setStatusFilter('verified')}
                className={`px-2.5 py-1 font-medium rounded-sm transition-colors cursor-pointer ${
                  statusFilter === 'verified' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sah / Lolos ({teams.filter((t) => t.status === 'verified').length})
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-2.5 py-1 font-medium rounded-sm transition-colors cursor-pointer ${
                  statusFilter === 'pending' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Menunggu ({teams.filter((t) => t.status === 'pending').length})
              </button>
              <button
                onClick={() => setStatusFilter('action_required')}
                className={`px-2.5 py-1 font-medium rounded-sm transition-colors cursor-pointer ${
                  statusFilter === 'action_required' ? 'bg-white text-amber-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Revisi ({teams.filter((t) => t.status === 'action_required').length})
              </button>
            </div>
          </div>

          {/* Payment Status Segment (Hidden for Team Viewers) */}
          {!isReadOnly && (
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Biaya:</span>
              <div className="inline-flex bg-slate-100 p-0.5 rounded-md">
                <button
                  onClick={() => setPaymentFilter('all')}
                  className={`px-2.5 py-1 font-medium rounded-sm transition-colors cursor-pointer ${
                    paymentFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setPaymentFilter('paid')}
                  className={`px-2.5 py-1 font-medium rounded-sm transition-colors cursor-pointer ${
                    paymentFilter === 'paid' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Lunas
                </button>
                <button
                  onClick={() => setPaymentFilter('down_payment')}
                  className={`px-2.5 py-1 font-medium rounded-sm transition-colors cursor-pointer ${
                    paymentFilter === 'down_payment' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  DP / Cicil
                </button>
                <button
                  onClick={() => setPaymentFilter('unpaid')}
                  className={`px-2.5 py-1 font-medium rounded-sm transition-colors cursor-pointer ${
                    paymentFilter === 'unpaid' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Belum Bayar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Empty State */}
      {filteredTeams.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            {teams.length === 0 ? <Plus className="w-6 h-6 text-emerald-600" /> : <Search className="w-6 h-6" />}
          </div>
          <h2 className="text-base font-bold text-slate-800 font-display">
            {teams.length === 0 ? 'Belum Ada Tim Terdaftar' : 'Tidak Ada Tim Ditemukan'}
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            {teams.length === 0
              ? 'Database tim saat ini masih kosong. Silakan daftarkan tim baru untuk memulai turnamen.'
              : 'Tidak ada data tim yang cocok dengan kata kunci pencarian atau kombinasi filter saat ini.'}
          </p>
          <div className="flex items-center justify-center gap-2">
            {teams.length > 0 && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setPaymentFilter('all');
                }}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Reset Filter
              </button>
            )}
            {!isReadOnly && (
              <button
                onClick={onOpenRegisterModal}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg transition-colors cursor-pointer"
              >
                + Daftarkan Tim Baru
              </button>
            )}
          </div>
        </div>
      )}

      {/* Grid Mode */}
      {viewMode === 'grid' && filteredTeams.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTeams.map((team) => {
            const eligibility = validateTeamEligibility(team, config);
            return (
              <div
                key={team.id}
                className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all shadow-xs flex flex-col justify-between overflow-hidden"
              >
                <div>
                  {/* Top Bar with Jersey colors */}
                  <div className="h-2 w-full flex">
                    <div className="h-full flex-1" style={{ backgroundColor: team.primaryJerseyColor }} />
                    <div className="h-full w-1/3" style={{ backgroundColor: team.secondaryJerseyColor }} />
                  </div>

                  <div className="p-5">
                    {/* Club Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        {team.logoUrl ? (
                          <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 p-1 shrink-0 shadow-2xs flex items-center justify-center overflow-hidden">
                            <img src={team.logoUrl} alt={team.name} className="w-full h-full object-contain" />
                          </div>
                        ) : (
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-2xs"
                            style={{ backgroundColor: team.primaryJerseyColor || '#1e293b' }}
                          >
                            {team.code}
                          </div>
                        )}
                        <div>
                          <h2 
                            onClick={() => onSelectTeam(team)}
                            className="text-base font-bold text-slate-900 hover:text-emerald-700 transition-colors cursor-pointer font-display"
                          >
                            {team.name}
                          </h2>
                          <div className="text-xs text-slate-500">
                            {team.originCity}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Metadata Line (Clean unboxed metadata) */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-4 pb-3 border-b border-slate-100">
                      <span>Berdiri {team.establishedYear}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{team.players.length} Pemain</span>
                      <span aria-hidden="true">·</span>
                      <span>{team.officials.length} Official</span>
                    </div>

                    {/* Coaching & Management */}
                    <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                      <div className="flex items-baseline justify-between">
                        <span className="text-slate-400">Manajer:</span>
                        <span className="font-medium text-slate-800 text-right">{team.managerName}</span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-slate-400">Pelatih:</span>
                        <span className="font-medium text-slate-800 text-right">{team.headCoachName}</span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-slate-400">Kontak:</span>
                        <span className="font-mono text-slate-600">{team.managerPhone}</span>
                      </div>
                    </div>

                    {/* Eligibility & Validation Alerts if any */}
                    {!eligibility.isValid && (
                      <div className="mb-4 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                        <div className="font-bold flex items-center gap-1 text-amber-950">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Peringatan Keabsahan:</span>
                        </div>
                        {eligibility.errors.slice(0, 2).map((err, idx) => (
                          <div key={idx} className="text-[11px] leading-tight text-amber-800">
                            • {err}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Status & Payment Row */}
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                      <div>
                        {team.status === 'verified' && (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Berkas Sah
                          </span>
                        )}
                        {team.status === 'action_required' && (
                          <span className="text-amber-700 font-semibold flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> Butuh Tindakan
                          </span>
                        )}
                        {team.status === 'pending' && (
                          <span className="text-slate-500 font-medium">
                            Menunggu Review
                          </span>
                        )}
                        {team.status === 'rejected' && (
                          <span className="text-rose-700 font-semibold">
                            Ditolak
                          </span>
                        )}
                      </div>

                      <div className="text-right">
                        {!isReadOnly ? (
                          <>
                            {team.paymentStatus === 'paid' && (
                              <span className="text-emerald-700 font-medium font-mono tabular-nums">
                                Lunas ({formatRupiah(team.paidAmount)})
                              </span>
                            )}
                            {team.paymentStatus === 'down_payment' && (
                              <span className="text-indigo-700 font-medium font-mono tabular-nums">
                                DP {formatRupiah(team.paidAmount)}
                              </span>
                            )}
                            {team.paymentStatus === 'unpaid' && (
                              <span className="text-slate-400 font-medium">
                                Belum Bayar
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-slate-500 font-medium text-[11px]">
                            {team.players.length} Pemain Terdaftar
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between gap-1 text-xs">
                  <button
                    onClick={() => onSelectTeam(team)}
                    className="font-semibold text-slate-700 hover:text-emerald-700 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>{isReadOnly ? 'Lihat Profil & Roster Lengkap' : 'Detail Roster'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>

                  <div className="flex items-center gap-1">
                    {onLoginAsTeamPortal && !isReadOnly && (
                      <button
                        onClick={() => onLoginAsTeamPortal(team)}
                        title={`Masuk ke Portal Tim ${team.name} (Mode Administrator)`}
                        className="px-2 py-1 bg-black hover:bg-[#ff4d00] text-white rounded-xs text-[10px] font-mono-tech font-bold uppercase transition-colors cursor-pointer flex items-center gap-1 shadow-2xs mr-1"
                      >
                        <Key className="w-3 h-3 text-amber-400" />
                        <span>Portal</span>
                      </button>
                    )}
                    <button
                      onClick={() => onOpenReceipt(team)}
                      title="Cetak Kuitansi"
                      className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-white rounded transition-colors cursor-pointer"
                    >
                      <Receipt className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onOpenIdCards(team)}
                      title="Cetak ID Card Lanyard"
                      className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-white rounded transition-colors cursor-pointer"
                    >
                      <IdCard className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onOpenMatchSheet(team)}
                      title="Cetak Formulir DSP"
                      className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-white rounded transition-colors cursor-pointer"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                    {onOpenMatchSummary && (
                      <button
                        onClick={() => onOpenMatchSummary(team)}
                        title="Hasil Match Summary Tim"
                        className="p-1.5 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                      >
                        <Activity className="w-4 h-4" />
                      </button>
                    )}
                    {!isReadOnly && (
                      <>
                        <button
                          onClick={() => onEditTeam(team)}
                          title="Edit Data Tim"
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-white rounded transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Yakin ingin menghapus tim "${team.name}" dari turnamen?`)) {
                              onDeleteTeam(team.id);
                            }
                          }}
                          title="Hapus Tim"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table Mode */}
      {viewMode === 'table' && filteredTeams.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/90 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Klub</th>
                  <th className="py-3 px-4">Kota Asal</th>
                  <th className="py-3 px-4">Manajer</th>
                  <th className="py-3 px-4">Pelatih</th>
                  <th className="py-3 px-4 text-center">Pemain</th>
                  <th className="py-3 px-4">Status</th>
                  {!isReadOnly && <th className="py-3 px-4">Biaya</th>}
                  <th className="py-3 px-4 text-right">Opsi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTeams.map((team) => (
                  <tr key={team.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        {team.logoUrl ? (
                          <div className="w-7 h-7 rounded-md bg-white border border-slate-200 p-0.5 shrink-0 flex items-center justify-center overflow-hidden">
                            <img src={team.logoUrl} alt={team.name} className="w-full h-full object-contain" />
                          </div>
                        ) : (
                          <div
                            className="w-7 h-7 rounded-md flex items-center justify-center text-white font-bold text-[10px] shrink-0"
                            style={{ backgroundColor: team.primaryJerseyColor }}
                          >
                            {team.code}
                          </div>
                        )}
                        <button
                          onClick={() => onSelectTeam(team)}
                          className="font-bold text-slate-900 hover:text-emerald-700 text-left cursor-pointer"
                        >
                          {team.name}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{team.originCity}</td>
                    <td className="py-3 px-4 text-slate-700">{team.managerName}</td>
                    <td className="py-3 px-4 text-slate-700">{team.headCoachName}</td>
                    <td className="py-3 px-4 text-center font-mono tabular-nums">
                      {team.players.length}
                    </td>
                    <td className="py-3 px-4">
                      {team.status === 'verified' && (
                        <span className="text-emerald-700 font-semibold">Sah</span>
                      )}
                      {team.status === 'action_required' && (
                        <span className="text-amber-700 font-semibold">Revisi</span>
                      )}
                      {team.status === 'pending' && (
                        <span className="text-slate-500">Menunggu</span>
                      )}
                      {team.status === 'rejected' && (
                        <span className="text-rose-700 font-semibold">Ditolak</span>
                      )}
                    </td>
                    {!isReadOnly && (
                      <td className="py-3 px-4 font-mono tabular-nums">
                        {team.paymentStatus === 'paid' && (
                          <span className="text-emerald-700 font-semibold">{formatRupiah(team.paidAmount)}</span>
                        )}
                        {team.paymentStatus === 'down_payment' && (
                          <span className="text-indigo-700 font-semibold">DP {formatRupiah(team.paidAmount)}</span>
                        )}
                        {team.paymentStatus === 'unpaid' && (
                          <span className="text-slate-400">Belum Bayar</span>
                        )}
                      </td>
                    )}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {onLoginAsTeamPortal && !isReadOnly && (
                          <button
                            onClick={() => onLoginAsTeamPortal(team)}
                            title={`Masuk ke Portal Tim ${team.name} (Mode Administrator)`}
                            className="px-2 py-0.5 bg-black hover:bg-[#ff4d00] text-white rounded-xs text-[10px] font-mono-tech font-bold uppercase transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Key className="w-2.5 h-2.5 text-amber-400" />
                            <span>Portal</span>
                          </button>
                        )}
                        <button
                          onClick={() => onSelectTeam(team)}
                          className="px-2 py-1 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded cursor-pointer font-medium"
                        >
                          Detail Roster
                        </button>
                        <button
                          onClick={() => onOpenReceipt(team)}
                          title="Cetak Kuitansi Resmi"
                          className="p-1 text-slate-500 hover:text-slate-900 rounded cursor-pointer"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onOpenIdCards(team)}
                          title="ID Card"
                          className="p-1 text-slate-500 hover:text-slate-900 rounded cursor-pointer"
                        >
                          <IdCard className="w-3.5 h-3.5" />
                        </button>
                        {onOpenMatchSummary && (
                          <button
                            onClick={() => onOpenMatchSummary(team)}
                            title="Hasil Match Summary Tim"
                            className="p-1 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded cursor-pointer"
                          >
                            <Activity className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {!isReadOnly && (
                          <button
                            onClick={() => onEditTeam(team)}
                            title="Edit"
                            className="p-1 text-slate-500 hover:text-slate-900 rounded cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
