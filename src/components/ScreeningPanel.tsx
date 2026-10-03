import React, { useState } from 'react';
import { Team, TournamentConfig, Player } from '../types/tournament';
import { calculateAge, formatDateIndo, validateTeamEligibility } from '../utils/formatters';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Check, 
  Printer, 
  Info,
  ChevronDown,
  ChevronRight,
  UserCheck,
  Unlock
} from 'lucide-react';

interface ScreeningPanelProps {
  teams: Team[];
  config: TournamentConfig;
  onUpdateTeamStatus: (teamId: string, status: Team['status'], notes?: string) => void;
  onUpdatePlayerVerification: (teamId: string, playerId: string, isVerified: boolean) => void;
  onSelectTeam: (team: Team) => void;
}

export const ScreeningPanel: React.FC<ScreeningPanelProps> = ({
  teams,
  config,
  onUpdateTeamStatus,
  onUpdatePlayerVerification,
  onSelectTeam,
}) => {
  const [selectedTeamId, setSelectedTeamId] = useState<string>(teams[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'flagged' | 'verified'>('all');
  const [committeeNotes, setCommitteeNotes] = useState('');

  const selectedTeam = teams.find((t) => t.id === selectedTeamId) || teams[0];
  const eligibility = selectedTeam ? validateTeamEligibility(selectedTeam, config) : null;

  // Filtered teams list for sidebar/selection
  const filteredTeams = teams.filter((team) => {
    const el = validateTeamEligibility(team, config);
    const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          team.originCity.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterType === 'flagged') return !el.isValid || team.status === 'action_required';
    if (filterType === 'verified') return team.status === 'verified';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-display">
            Pusat Screening & Verifikasi Keabsahan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Validasi foto KTP/KIA & kartu BPJS Ketenagakerjaan, serta nomor punggung pemain
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-2xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Berita Acara Screening</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Screening Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Team Selector List */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col h-[650px] overflow-hidden">
          <div className="p-3 border-b border-slate-100 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari tim untuk di-screening..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:bg-white"
              />
            </div>
            <div className="flex items-center bg-slate-100 p-0.5 rounded-md text-[11px] font-medium">
              <button
                onClick={() => setFilterType('all')}
                className={`flex-1 py-1 text-center rounded transition-colors cursor-pointer ${
                  filterType === 'all' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
                }`}
              >
                Semua ({teams.length})
              </button>
              <button
                onClick={() => setFilterType('flagged')}
                className={`flex-1 py-1 text-center rounded transition-colors cursor-pointer ${
                  filterType === 'flagged' ? 'bg-white text-amber-900 shadow-2xs font-semibold' : 'text-slate-600'
                }`}
              >
                Bermasalah
              </button>
              <button
                onClick={() => setFilterType('verified')}
                className={`flex-1 py-1 text-center rounded transition-colors cursor-pointer ${
                  filterType === 'verified' ? 'bg-white text-emerald-900 shadow-2xs font-semibold' : 'text-slate-600'
                }`}
              >
                Sah Lolos
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredTeams.map((team) => {
              const el = validateTeamEligibility(team, config);
              const isSelected = team.id === selectedTeam?.id;

              return (
                <div
                  key={team.id}
                  onClick={() => {
                    setSelectedTeamId(team.id);
                    setCommitteeNotes(team.screeningNotes || '');
                  }}
                  className={`p-3 cursor-pointer transition-colors flex items-start justify-between gap-2 ${
                    isSelected ? 'bg-emerald-50/80 border-l-4 border-emerald-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded flex items-center justify-center text-white text-[9px] font-bold shrink-0"
                        style={{ backgroundColor: team.primaryJerseyColor }}
                      >
                        {team.code}
                      </div>
                      <span className="font-bold text-xs text-slate-900 truncate">
                        {team.name}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                      <span>{team.originCity}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">{team.players.length} Pemain</span>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    {!el.isValid ? (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                        Perlu Tindakan
                      </span>
                    ) : team.status === 'verified' ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                        Lolos
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500">
                        Review
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Screening Dossier for Selected Team */}
        {selectedTeam && (
          <div className="lg:col-span-8 space-y-5">
            {/* Top Alert & Compliance Status Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900 font-display">
                      {selectedTeam.name} ({selectedTeam.code})
                    </h2>
                    <span className="text-xs text-slate-500">
                      {selectedTeam.originCity}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Manajer: <strong>{selectedTeam.managerName}</strong> ({selectedTeam.managerPhone}) · Pelatih: <strong>{selectedTeam.headCoachName}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectTeam(selectedTeam)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    Buka Profil Tim
                  </button>
                </div>
              </div>

              {/* Automated Audit Checklist Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-[11px] text-slate-500 mb-0.5">Validasi Batas Usia ({config.category})</div>
                  {eligibility && eligibility.overagePlayersCount > 0 ? (
                    <div className="text-xs font-bold text-rose-600 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>{eligibility.overagePlayersCount} Pemain Lewat Umur</span>
                    </div>
                  ) : (
                    <div className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Semua Pemain Memenuhi Syarat</span>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-[11px] text-slate-500 mb-0.5">Nomor Punggung Skuad</div>
                  {eligibility && eligibility.duplicateNumbers.length > 0 ? (
                    <div className="text-xs font-bold text-rose-600 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Nomor Ganda: #{eligibility.duplicateNumbers.join(', #')}</span>
                    </div>
                  ) : (
                    <div className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Nomor Unik (1-99)</span>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-[11px] text-slate-500 mb-0.5">Kelengkapan Kuota Tim</div>
                  <div className="text-xs font-bold text-slate-800 font-mono">
                    {selectedTeam.players.length} / {config.maxPlayersPerTeam} Pemain
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-[11px] text-slate-500 mb-0.5">Struktur Official 5</div>
                  {(() => {
                    const hasMgr = selectedTeam.officials.some(o => o.role === 'Manajer' && o.name.trim()) || !!selectedTeam.managerName?.trim();
                    const hasHc = selectedTeam.officials.some(o => o.role === 'Pelatih Kepala' && o.name.trim()) || !!selectedTeam.headCoachName?.trim();
                    const acCount = selectedTeam.officials.filter(o => o.role === 'Asisten Pelatih' && o.name.trim()).length;
                    const hasMed = selectedTeam.officials.some(o => o.role === 'Medis/Fisioterapis' && o.name.trim());
                    const isComplete = hasMgr && hasHc && acCount >= 2 && hasMed;
                    return (
                      <div className={`text-xs font-bold flex items-center gap-1 ${isComplete ? 'text-emerald-700' : 'text-amber-600'}`}>
                        {isComplete ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                        <span>{isComplete ? 'Lengkap (5/5)' : `${selectedTeam.officials.length}/5 Terdaftar`}</span>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Any Validation Errors Banner */}
              {eligibility && !eligibility.isValid && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 space-y-1 mb-4">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Catatan Temuan Pelanggaran Administrasi:</span>
                  </div>
                  {eligibility.errors.map((err, i) => (
                    <div key={i} className="pl-5 text-amber-950 font-medium">
                      • {err}
                    </div>
                  ))}
                </div>
              )}

              {/* Decision Buttons */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      onUpdateTeamStatus(selectedTeam.id, 'verified', 'Lolos screening keabsahan panitia.');
                    }}
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Sahkan Tim (Kunci Portal)</span>
                  </button>
                  <button
                    onClick={() => {
                      const note = prompt('Tuliskan alasan buka kunci / audit ulang:', selectedTeam.screeningNotes || 'Buka kunci pendaftaran oleh panitia untuk perbaikan data tim.');
                      if (note !== null) {
                        onUpdateTeamStatus(selectedTeam.id, 'pending', note);
                      }
                    }}
                    className="px-3.5 py-2 text-xs font-bold text-blue-900 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                    title="Buka kunci tim dan kembalikan ke status audit dokumen (Pending)"
                  >
                    <Unlock className="w-4 h-4 text-blue-700" />
                    <span>Buka Kunci (Pending)</span>
                  </button>
                  <button
                    onClick={() => {
                      const note = prompt('Tuliskan catatan perbaikan berkas untuk tim ini:', selectedTeam.screeningNotes || 'Perbaiki data pemain sebelum batas akhir.');
                      if (note !== null) {
                        onUpdateTeamStatus(selectedTeam.id, 'action_required', note);
                      }
                    }}
                    className="px-3.5 py-2 text-xs font-bold text-amber-950 bg-amber-200 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    <span>Minta Revisi (Buka Kunci)</span>
                  </button>
                  <button
                    onClick={() => {
                      const note = prompt('Tuliskan alasan penolakan/diskualifikasi:', selectedTeam.screeningNotes || 'Tidak memenuhi kualifikasi batas usia atau syarat pendaftaran.');
                      if (note !== null) {
                        onUpdateTeamStatus(selectedTeam.id, 'rejected', note);
                      }
                    }}
                    className="px-3 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Tolak Tim</span>
                  </button>
                </div>

                <div className="text-xs text-slate-500 font-mono-tech">
                  Status saat ini: <strong className="uppercase text-slate-900">{selectedTeam.status}</strong>
                </div>
              </div>
            </div>

            {/* Player Roster Screening Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Verifikasi Perorangan Pemain ({selectedTeam.players.length} Pemain)
                  </h3>
                  <div className="text-[11px] text-slate-400">
                    Klik tombol ceklis untuk memverifikasi keabsahan kartu identitas / akta pemain
                  </div>
                </div>
                <button
                  onClick={() => {
                    // Bulk verify all players in team
                    selectedTeam.players.forEach((p) => {
                      onUpdatePlayerVerification(selectedTeam.id, p.id, true);
                    });
                  }}
                  className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors cursor-pointer"
                >
                  Sahkan Semua Pemain
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 text-center w-12">No</th>
                      <th className="py-2.5 px-4">Nama Lengkap</th>
                      <th className="py-2.5 px-3 text-center w-16">Posisi</th>
                      <th className="py-2.5 px-4">Tanggal Lahir</th>
                      <th className="py-2.5 px-3 text-center">Usia Resmi</th>
                      <th className="py-2.5 px-4 text-center">Berkas KTP & BPJS</th>
                      <th className="py-2.5 px-3 text-center">Keabsahan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedTeam.players.map((p) => {
                      const age = calculateAge(p.birthDate, config.tournamentStartDate);
                      const isOverage = config.maxAgeLimit < 90 && age > config.maxAgeLimit;

                      return (
                        <tr key={p.id} className={isOverage ? 'bg-rose-50/60' : 'hover:bg-slate-50'}>
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900">
                            #{p.number}
                          </td>
                          <td className="py-2.5 px-4">
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                              <span>{p.name}</span>
                              {p.isCaptain && (
                                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1 py-0.2 rounded">
                                  KAPTEN
                                </span>
                              )}
                            </div>
                            {p.documentNote && (
                              <div className="text-[10px] font-bold text-rose-600">{p.documentNote}</div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-[11px] text-slate-700">
                            {p.position}
                          </td>
                          <td className="py-2.5 px-4 font-mono text-slate-700">
                            {formatDateIndo(p.birthDate)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`font-mono font-bold text-xs tabular-nums ${
                                isOverage ? 'text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded' : 'text-slate-800'
                              }`}
                            >
                              {age} Thn
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                  p.ktpPhotoUrl
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-slate-100 text-slate-400'
                                }`}
                              >
                                {p.ktpPhotoUrl ? 'KTP ✓' : 'KTP -'}
                              </span>
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                  p.bpjsPhotoUrl
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-slate-100 text-slate-400'
                                }`}
                              >
                                {p.bpjsPhotoUrl ? 'BPJS ✓' : 'BPJS -'}
                              </span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => onUpdatePlayerVerification(selectedTeam.id, p.id, !p.isVerified)}
                              className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer inline-flex items-center gap-1 ${
                                p.isVerified
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {p.isVerified ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-700" />
                                  <span>Sah</span>
                                </>
                              ) : (
                                <span>Verifikasi</span>
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
