import React, { useState } from 'react';
import { Team, TournamentConfig, Match } from '../types/tournament';
import { formatRupiah, formatDateIndo, calculateAge, validateTeamEligibility } from '../utils/formatters';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Printer, 
  Receipt, 
  IdCard, 
  FileText, 
  Edit3, 
  Phone, 
  MapPin, 
  Shield, 
  Calendar,
  User,
  Activity,
  Trophy,
  Clock,
  Award,
  Key,
  Lock,
  Unlock,
  Copy,
  Check
} from 'lucide-react';
import { getDefaultTeamUsername, getDefaultTeamPassword } from '../utils/credentials';
import { MatchSummaryPrintModal } from './MatchSummaryPrintModal';

interface TeamDetailModalProps {
  team: Team | null;
  config: TournamentConfig;
  isOpen: boolean;
  onClose: () => void;
  onEditTeam: (team: Team) => void;
  onOpenReceipt: (team: Team) => void;
  onOpenIdCards: (team: Team) => void;
  onOpenMatchSheet: (team: Team) => void;
  onUpdateStatus: (teamId: string, status: Team['status'], notes?: string) => void;
  isReadOnly?: boolean;
  matches?: Match[];
  allTeams?: Team[];
}

export const TeamDetailModal: React.FC<TeamDetailModalProps> = ({
  team,
  config,
  isOpen,
  onClose,
  onEditTeam,
  onOpenReceipt,
  onOpenIdCards,
  onOpenMatchSheet,
  onUpdateStatus,
  isReadOnly = false,
  matches = [],
  allTeams = [],
}) => {
  const [activeTab, setActiveTab] = useState<'roster' | 'officials' | 'screening' | 'matches' | 'finance'>('roster');
  const [selectedMatchForPrint, setSelectedMatchForPrint] = useState<Match | null>(null);

  if (!isOpen || !team) return null;

  const eligibility = validateTeamEligibility(team, config);

  // Filter matches involving this team
  const teamMatches = matches.filter(
    (m) => m.homeTeamId === team.id || m.awayTeamId === team.id
  );

  const teamMap = new Map<string, Team>(allTeams.map((t) => [t.id, t]));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with Club Colors & Details */}
        <div className="border-b border-slate-200">
          <div className="h-2.5 w-full flex">
            <div className="h-full flex-1" style={{ backgroundColor: team.primaryJerseyColor }} />
            <div className="h-full w-1/4" style={{ backgroundColor: team.secondaryJerseyColor }} />
          </div>

          <div className="p-6 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {team.logoUrl ? (
                <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 p-1.5 shadow-xs shrink-0 flex items-center justify-center overflow-hidden">
                  <img src={team.logoUrl} alt={team.name} className="w-full h-full object-contain" />
                </div>
              ) : (
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-extrabold text-xl shadow-xs shrink-0"
                  style={{ backgroundColor: team.primaryJerseyColor || '#1e293b' }}
                >
                  {team.code}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">
                    {team.name}
                  </h1>
                  {team.assignedGroup && (
                    <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                      {team.assignedGroup}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                  <span>{team.originCity}</span>
                  <span aria-hidden="true">·</span>
                  <span>Didirikan {team.establishedYear}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">{team.players.length} Pemain Terdaftar</span>
                </div>
              </div>
            </div>

            {/* Top action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenReceipt(team)}
                className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Cetak Kuitansi Resmi"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kwitansi</span>
              </button>
              <button
                onClick={() => onOpenIdCards(team)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <IdCard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ID Card</span>
              </button>
              <button
                onClick={() => onOpenMatchSheet(team)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">DSP Pertandingan</span>
              </button>
              {!isReadOnly && (
                <button
                  onClick={() => onEditTeam(team)}
                  className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Edit</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 bg-white text-xs font-semibold">
          <button
            onClick={() => setActiveTab('roster')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'roster'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Roster Pemain ({team.players.length})
          </button>
          <button
            onClick={() => setActiveTab('officials')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'officials'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Official & Manajemen
          </button>
          <button
            onClick={() => setActiveTab('screening')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'screening'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Keabsahan & Screening</span>
            {!eligibility.isValid && (
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('matches')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'matches'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Hasil Match Summary ({teamMatches.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('finance')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'finance'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Status Biaya & Kwitansi
          </button>
        </div>

        {/* Content Viewport */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: ROSTER PEMAIN */}
          {activeTab === 'roster' && (
            <div className="space-y-4">
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 text-center w-12">No</th>
                      <th className="py-2.5 px-2 text-center w-12">Foto</th>
                      <th className="py-2.5 px-3">Nama Pemain</th>
                      <th className="py-2.5 px-3 text-center w-16">Posisi</th>
                      <th className="py-2.5 px-3">Tanggal Lahir (Usia)</th>
                      <th className="py-2.5 px-3 text-center">Dokumen KTP & BPJS</th>
                      <th className="py-2.5 px-3 text-center">Status Keabsahan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {team.players.map((p) => {
                      const age = calculateAge(p.birthDate, config.tournamentStartDate);
                      const isOverage = config.maxAgeLimit < 90 && age > config.maxAgeLimit;

                      return (
                        <tr key={p.id} className={isOverage ? 'bg-rose-50/50' : 'hover:bg-slate-50'}>
                          <td className="py-2 px-3 text-center font-mono font-bold text-slate-900">
                            #{p.number}
                          </td>
                          <td className="py-1 px-2 text-center">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden mx-auto flex items-center justify-center">
                              {p.photoUrl ? (
                                <img src={p.photoUrl} alt={p.name} className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-4 h-4 text-slate-400" />
                              )}
                            </div>
                          </td>
                          <td className="py-2 px-3">
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                              <span>{p.name}</span>
                              {p.isCaptain && (
                                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1 py-0.2 rounded">
                                  KAPTEN
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span className="font-bold text-[11px] text-slate-700">
                              {p.position}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <div className="font-mono text-slate-800">
                              {formatDateIndo(p.birthDate)}
                            </div>
                            <div className={`text-[11px] font-mono tabular-nums ${isOverage ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                              Usia: {age} Tahun {isOverage && '(Overage Turnamen)'}
                            </div>
                          </td>
                          <td className="py-2 px-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {p.ktpPhotoUrl ? (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                  KTP ✓
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] text-slate-400 bg-slate-100">
                                  KTP -
                                </span>
                              )}
                              {p.bpjsPhotoUrl ? (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  BPJS ✓
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] text-slate-400 bg-slate-100">
                                  BPJS -
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-2 px-3 text-center">
                            {p.isVerified ? (
                              <span className="text-emerald-700 font-semibold text-[11px]">Sah / Lolos</span>
                            ) : (
                              <span className="text-amber-700 font-medium text-[11px]">Menunggu Verifikasi</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: OFFICIALS */}
          {activeTab === 'officials' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="text-xs font-semibold text-slate-500 mb-1">Manajer Tim</div>
                  <div className="text-base font-bold text-slate-900 mb-2">{team.managerName}</div>
                  <div className="space-y-1 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{team.managerPhone || '-'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="text-xs font-semibold text-slate-500 mb-1">Pelatih Kepala</div>
                  <div className="text-base font-bold text-slate-900 mb-2">{team.headCoachName}</div>
                  <div className="text-xs text-slate-600 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Official Terdaftar</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="text-xs font-semibold text-slate-500 mb-1">Domisili & Asal Tim</div>
                  <div className="text-base font-bold text-slate-900 mb-2">{team.originCity}</div>
                  <div className="text-xs text-slate-600 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Est. {team.establishedYear}</span>
                  </div>
                </div>
              </div>

              {/* All registered officials table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs mt-4">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4">Nama Lengkap</th>
                      <th className="py-2.5 px-4">Jabatan Official</th>
                      <th className="py-2.5 px-4">Kontak Telepon</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {team.officials.map((off) => (
                      <tr key={off.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-4 font-bold text-slate-900">{off.name}</td>
                        <td className="py-2.5 px-4 text-slate-700">{off.role}</td>
                        <td className="py-2.5 px-4 font-mono text-slate-600">{off.phone || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: SCREENING & KEABSAHAN */}
          {activeTab === 'screening' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Laporan Hasil Audit Screening Dokumen
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-600">Batas Kuota Pemain ({config.minPlayersPerTeam} - {config.maxPlayersPerTeam})</span>
                    <span className="font-semibold text-slate-900">{team.players.length} Pemain Terdaftar</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-600">Pengecekan Nomor Punggung Ganda</span>
                    <span className={eligibility.duplicateNumbers.length > 0 ? 'text-rose-600 font-bold' : 'text-emerald-700 font-semibold'}>
                      {eligibility.duplicateNumbers.length > 0 ? `Ditemukan: #${eligibility.duplicateNumbers.join(', ')}` : 'Aman (Tidak Ada Nomor Kembar)'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-600">Pengecekan Usia Kategori {config.category} (Maks {config.maxAgeLimit} Tahun)</span>
                    <span className={eligibility.overagePlayersCount > 0 ? 'text-rose-600 font-bold' : 'text-emerald-700 font-semibold'}>
                      {eligibility.overagePlayersCount > 0 ? `${eligibility.overagePlayersCount} Pemain Melebihi Batas Usia!` : 'Aman (Semua Sesuai Batas Usia)'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-600">Status Keabsahan Tim Saat Ini</span>
                    <span className="font-bold text-slate-900 uppercase">{team.status}</span>
                  </div>
                </div>
              </div>

              {/* Committee Decision Panel (Only for Committee) */}
              {!isReadOnly ? (
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Keputusan Verifikator Panitia
                  </h3>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => onUpdateStatus(team.id, 'verified', 'Lolos verifikasi keabsahan turnamen.')}
                      className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Tetapkan: Sah (Kunci Portal)</span>
                    </button>
                    <button
                      onClick={() => onUpdateStatus(team.id, 'pending', 'Buka kunci pendaftaran tim oleh Panitia.')}
                      className="px-4 py-2 text-xs font-bold text-blue-900 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                      title="Buka kunci tim dan kembalikan ke status audit dokumen (Pending)"
                    >
                      <Unlock className="w-4 h-4 text-blue-700" />
                      <span>Buka Kunci Tim (Pending)</span>
                    </button>
                    <button
                      onClick={() => onUpdateStatus(team.id, 'action_required', 'Harap periksa kelengkapan berkas identitas dan usia pemain.')}
                      className="px-4 py-2 text-xs font-bold text-amber-950 bg-amber-200 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <AlertTriangle className="w-4 h-4 text-amber-700" />
                      <span>Minta Perbaikan / Revisi Dokumen</span>
                    </button>
                    <button
                      onClick={() => onUpdateStatus(team.id, 'rejected', 'Diskualifikasi karena tidak memenuhi regulasi turnamen.')}
                      className="px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                    >
                      Tolak Pendaftaran
                    </button>
                  </div>
                  {team.screeningNotes && (
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 mt-2">
                      <strong>Catatan Tim Panitia:</strong> {team.screeningNotes}
                    </div>
                  )}
                </div>
              ) : (
                team.screeningNotes && (
                  <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                    <strong>Catatan dari Panitia Screening:</strong> {team.screeningNotes}
                  </div>
                )
              )}
            </div>
          )}

          {/* TAB 4: MATCH SUMMARY */}
          {activeTab === 'matches' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Riwayat Hasil & Berita Acara Pertandingan (Match Summary)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Menampilkan seluruh laga yang melibatkan {team.name} beserta skor, pencetak gol, kartu disiplin, MOTM, dan cetak berita acara resmi.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-md text-slate-700">
                    Total: {teamMatches.length} Laga
                  </span>
                </div>
              </div>

              {teamMatches.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
                  <Activity className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-600">Belum Ada Jadwal / Pertandingan</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Laga akan otomatis tercantum setelah drawing grup dan penyusunan jadwal selesai.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {teamMatches.map((match) => {
                    const homeTeam = teamMap.get(match.homeTeamId);
                    const awayTeam = teamMap.get(match.awayTeamId);
                    const isHome = match.homeTeamId === team.id;
                    const opponent = isHome ? awayTeam : homeTeam;

                    const hasPlayed = match.status === 'completed';
                    const isLive = match.status === 'live';

                    // Result relative to current team
                    let matchResult: 'W' | 'D' | 'L' | null = null;
                    if (hasPlayed && match.homeScore !== undefined && match.awayScore !== undefined) {
                      const ourScore = isHome ? match.homeScore : match.awayScore;
                      const oppScore = isHome ? match.awayScore : match.homeScore;
                      if (ourScore > oppScore) matchResult = 'W';
                      else if (ourScore < oppScore) matchResult = 'L';
                      else matchResult = 'D';
                    }

                    return (
                      <div
                        key={match.id}
                        className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:border-slate-300 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                              Laga #{match.matchNumber}
                            </span>
                            <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                              {match.stage}
                            </span>
                            <span className="text-slate-400">·</span>
                            <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{formatDateIndo(match.date)}</span>
                            </div>
                            <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{match.time} WIB</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {match.status === 'completed' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                                Selesai
                              </span>
                            ) : match.status === 'live' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-rose-600 text-white animate-pulse">
                                Live
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">
                                Jadwal
                              </span>
                            )}

                            {matchResult && (
                              <span
                                className={`w-6 h-6 rounded flex items-center justify-center font-black text-xs text-white ${
                                  matchResult === 'W'
                                    ? 'bg-emerald-600'
                                    : matchResult === 'L'
                                    ? 'bg-rose-600'
                                    : 'bg-amber-600'
                                }`}
                                title={
                                  matchResult === 'W'
                                    ? 'Menang'
                                    : matchResult === 'L'
                                    ? 'Kalah'
                                    : 'Seri / Imbang'
                                }
                              >
                                {matchResult}
                              </span>
                            )}

                            <button
                              onClick={() => setSelectedMatchForPrint(match)}
                              className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                              title="Cetak Berita Acara & Match Summary"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Berita Acara</span>
                            </button>
                          </div>
                        </div>

                        {/* Match Teams & Scoreboard */}
                        <div className="py-3 flex items-center justify-between gap-4">
                          {/* Home Team */}
                          <div className={`flex items-center gap-3 flex-1 ${match.homeTeamId === team.id ? 'font-bold' : ''}`}>
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-2xs"
                              style={{ backgroundColor: homeTeam?.primaryJerseyColor || '#334155' }}
                            >
                              {homeTeam?.code || 'HOM'}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs sm:text-sm truncate text-slate-900">
                                {homeTeam?.name || 'TBD'}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {match.homeTeamId === team.id ? 'Klub Ini (Tuan Rumah)' : 'Tuan Rumah'}
                              </div>
                            </div>
                          </div>

                          {/* Score Badge */}
                          <div className="text-center shrink-0 px-4">
                            {hasPlayed || isLive ? (
                              <div className="flex flex-col items-center">
                                <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-slate-900 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                                  {match.homeScore ?? 0} - {match.awayScore ?? 0}
                                </div>
                                {match.halfTimeScore && (
                                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                    HT: {match.halfTimeScore.home} - {match.halfTimeScore.away}
                                  </div>
                                )}
                                {match.homePenaltyScore !== undefined && match.awayPenaltyScore !== undefined && (
                                  <div className="text-[10px] text-amber-700 font-bold font-mono mt-0.5">
                                    (Pen: {match.homePenaltyScore} - {match.awayPenaltyScore})
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                                VS
                              </div>
                            )}
                          </div>

                          {/* Away Team */}
                          <div className={`flex items-center justify-end gap-3 flex-1 text-right ${match.awayTeamId === team.id ? 'font-bold' : ''}`}>
                            <div className="min-w-0">
                              <div className="text-xs sm:text-sm truncate text-slate-900">
                                {awayTeam?.name || 'TBD'}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {match.awayTeamId === team.id ? 'Klub Ini (Tamu)' : 'Tim Tamu'}
                              </div>
                            </div>
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-2xs"
                              style={{ backgroundColor: awayTeam?.primaryJerseyColor || '#334155' }}
                            >
                              {awayTeam?.code || 'AWY'}
                            </div>
                          </div>
                        </div>

                        {/* Events summary if available */}
                        {((match.goals && match.goals.length > 0) || (match.cards && match.cards.length > 0) || match.manOfTheMatch || match.summaryNotes) && (
                          <div className="pt-2.5 mt-1 border-t border-slate-100 text-[11px] space-y-1.5 bg-slate-50/70 p-2.5 rounded-lg">
                            {match.goals && match.goals.length > 0 && (
                              <div className="flex items-start gap-1.5 text-slate-700">
                                <span className="font-bold text-slate-800">⚽ Gol:</span>
                                <span className="text-slate-600">
                                  {match.goals.map((g, idx, arr) => (
                                    <span key={idx}>
                                      {g.playerName} ({g.minute}
                                      {g.isPenalty ? " 'P'" : ''}
                                      {g.isOwnGoal ? " 'OG'" : ''})
                                      {idx < arr.length - 1 ? ', ' : ''}
                                    </span>
                                  ))}
                                </span>
                              </div>
                            )}

                            {match.cards && match.cards.length > 0 && (
                              <div className="flex items-start gap-1.5 text-slate-700">
                                <span className="font-bold text-slate-800">🟨 Disiplin:</span>
                                <span className="text-slate-600">
                                  {match.cards.map((c, idx, arr) => (
                                    <span key={idx}>
                                      {c.playerName} ({c.type === 'yellow' ? 'K. Kuning' : 'K. Merah'} {c.minute}')
                                      {idx < arr.length - 1 ? ', ' : ''}
                                    </span>
                                  ))}
                                </span>
                              </div>
                            )}

                            {match.manOfTheMatch && (
                              <div className="flex items-center gap-1.5 text-amber-900 font-medium">
                                <Award className="w-3.5 h-3.5 text-amber-600" />
                                <span>Man of the Match: <strong>{match.manOfTheMatch}</strong></span>
                              </div>
                            )}

                            {match.summaryNotes && (
                              <div className="text-slate-500 italic text-[11px]">
                                "{match.summaryNotes}"
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: FINANCE */}
          {activeTab === 'finance' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-500 mb-1">Total Biaya Pendaftaran</div>
                  <div className="text-xl font-bold font-mono text-slate-900 tabular-nums">
                    {formatRupiah(config.registrationFee)}
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-500 mb-1">Nominal Terbayar</div>
                  <div className="text-xl font-bold font-mono text-emerald-700 tabular-nums">
                    {formatRupiah(team.paidAmount)}
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-500 mb-1">Sisa Kekurangan</div>
                  <div className="text-xl font-bold font-mono text-slate-700 tabular-nums">
                    {formatRupiah(Math.max(0, config.registrationFee - team.paidAmount))}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Kwitansi Pembayaran Digital: {team.receiptNumber || 'Belum Diterbitkan'}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Status: {team.paymentStatus === 'paid' ? 'Lunas Penuh' : team.paymentStatus === 'down_payment' ? 'Uang Muka / DP' : 'Belum Membayar'}
                  </div>
                </div>
                <button
                  onClick={() => onOpenReceipt(team)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-950 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Receipt className="w-4 h-4" />
                  <span>Buka Kuitansi Resmi PDF/Print</span>
                </button>
              </div>

              {/* Official Login Credentials Box */}
              {team.paymentStatus === 'paid' ? (
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xs text-emerald-950 uppercase tracking-wide">
                      <Key className="w-4 h-4 text-emerald-700" />
                      <span>Kode Akses Login Resmi Portal Tim</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-mono font-bold uppercase">
                      Status: Aktif (Lunas)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-3 bg-white rounded-lg border border-emerald-200">
                      <span className="text-[10px] text-slate-500 font-sans font-semibold uppercase block mb-1">
                        Username Login:
                      </span>
                      <strong className="text-slate-900 text-sm select-all">
                        {team.portalUsername || getDefaultTeamUsername(team)}
                      </strong>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-emerald-200">
                      <span className="text-[10px] text-slate-500 font-sans font-semibold uppercase block mb-1">
                        Kode Akses / PIN Sandi:
                      </span>
                      <strong className="text-emerald-950 text-sm font-black select-all tracking-wider">
                        {team.portalPassword || getDefaultTeamPassword(team)}
                      </strong>
                    </div>
                  </div>

                  <p className="text-[11px] text-emerald-900 leading-relaxed font-sans">
                    ✓ Ofisial tim menggunakan kredensial di atas untuk masuk ke menu <strong>Akses Tim Peserta</strong> guna mengunggah berkas BPJS Ketenagakerjaan, melengkapi susunan pemain, serta memantau audit screening panitia.
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-3 text-xs text-amber-900">
                  <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-sm text-amber-950">Kode Akses Login Belum Diterbitkan</div>
                    <p className="text-[11px] text-amber-800 mt-1 leading-relaxed">
                      Kode login resmi portal tim hanya diterbitkan setelah biaya pendaftaran turnamen berstatus <strong>LUNAS</strong>. Silakan perbarui pembayaran tim di modul Keuangan.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50/50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Tutup Jendela
          </button>
        </div>
      </div>

      {/* Match Summary Official Print Preview Modal */}
      {selectedMatchForPrint && (
        <MatchSummaryPrintModal
          isOpen={!!selectedMatchForPrint}
          onClose={() => setSelectedMatchForPrint(null)}
          match={selectedMatchForPrint}
          homeTeam={teamMap.get(selectedMatchForPrint.homeTeamId)}
          awayTeam={teamMap.get(selectedMatchForPrint.awayTeamId)}
          config={config}
        />
      )}
    </div>
  );
};
