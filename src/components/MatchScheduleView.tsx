import React, { useState, useMemo } from 'react';
import { Match, Team, TournamentConfig, MatchStatus } from '../types/tournament';
import { formatDateIndo } from '../utils/formatters';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Plus, 
  Printer, 
  Search, 
  Trophy, 
  Edit3, 
  Trash2, 
  FileText, 
  CheckCircle2, 
  Activity, 
  AlertCircle,
  Users,
  Shield,
  Filter,
  ArrowRight
} from 'lucide-react';
import { MatchEditModal } from './MatchEditModal';
import { MatchScoreModal } from './MatchScoreModal';
import { MatchSchedulePrintModal } from './MatchSchedulePrintModal';

interface MatchScheduleViewProps {
  matches: Match[];
  teams: Team[];
  config: TournamentConfig;
  onSaveMatch: (match: Match) => void;
  onDeleteMatch: (matchId: string) => void;
  onOpenMatchSheet: (team: Team) => void;
  isReadOnly?: boolean;
}

export const MatchScheduleView: React.FC<MatchScheduleViewProps> = ({
  matches,
  teams,
  config,
  onSaveMatch,
  onDeleteMatch,
  onOpenMatchSheet,
  isReadOnly = false,
}) => {
  // Navigation sub-tab: 'fixtures' or 'standings'
  const [subTab, setSubTab] = useState<'fixtures' | 'standings'>('fixtures');

  // Filters
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);

  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [scoreMatch, setScoreMatch] = useState<Match | null>(null);

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Teams map for fast lookup
  const teamMap = useMemo(() => new Map<string, Team>(teams.map((t) => [t.id, t])), [teams]);

  // Statistics
  const totalMatches = matches.length;
  const completedMatches = matches.filter((m) => m.status === 'completed').length;
  const upcomingMatches = matches.filter((m) => m.status === 'upcoming').length;
  const totalGoals = matches.reduce((sum, m) => {
    if (m.status === 'completed' && m.homeScore !== undefined && m.awayScore !== undefined) {
      return sum + m.homeScore + m.awayScore;
    }
    return sum;
  }, 0);

  // Filtered matches
  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      // Stage filter
      if (stageFilter !== 'all') {
        if (stageFilter === 'group_all') {
          if (!m.stage.startsWith('Grup')) return false;
        } else if (stageFilter === 'knockout_all') {
          if (m.stage.startsWith('Grup')) return false;
        } else if (m.stage !== stageFilter) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'all' && m.status !== statusFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const home = teamMap.get(m.homeTeamId);
        const away = teamMap.get(m.awayTeamId);
        const homeName = home ? home.name.toLowerCase() : '';
        const awayName = away ? away.name.toLowerCase() : '';
        const venue = m.venue.toLowerCase();
        const referee = (m.referee || '').toLowerCase();
        const stageName = m.stage.toLowerCase();
        if (
          !homeName.includes(q) &&
          !awayName.includes(q) &&
          !venue.includes(q) &&
          !referee.includes(q) &&
          !stageName.includes(q)
        ) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      // Sort by date, then time, then matchNumber
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      const timeCompare = a.time.localeCompare(b.time);
      if (timeCompare !== 0) return timeCompare;
      return a.matchNumber - b.matchNumber;
    });
  }, [matches, stageFilter, statusFilter, searchQuery, teamMap]);

  // Handle Score update from Quick Score Modal
  const handleSaveScore = (
    matchId: string,
    homeScore: number,
    awayScore: number,
    status: Match['status'],
    notes?: string,
    homePen?: number,
    awayPen?: number
  ) => {
    const target = matches.find((m) => m.id === matchId);
    if (!target) return;

    const updated: Match = {
      ...target,
      status,
      homeScore,
      awayScore,
      homePenaltyScore: homePen,
      awayPenaltyScore: awayPen,
      notes: notes !== undefined ? notes : target.notes,
    };
    onSaveMatch(updated);
  };

  // Group standings computation
  const groupStandings = useMemo(() => {
    const groupNames = ['Grup A', 'Grup B', 'Grup C', 'Grup D', 'Grup E', 'Grup F'];
    const result: Record<string, any[]> = {};

    groupNames.forEach((gName) => {
      const gTeams = teams.filter((t) => t.assignedGroup === gName);

      const table = gTeams.map((team) => {
        let played = 0;
        let won = 0;
        let drawn = 0;
        let lost = 0;
        let gf = 0;
        let ga = 0;
        const form: ('W' | 'D' | 'L')[] = [];

        matches
          .filter((m) => m.stage === gName && m.status === 'completed')
          .forEach((m) => {
            const isHome = m.homeTeamId === team.id;
            const isAway = m.awayTeamId === team.id;

            if ((isHome || isAway) && m.homeScore !== undefined && m.awayScore !== undefined) {
              played++;
              const myScore = isHome ? m.homeScore : m.awayScore;
              const oppScore = isHome ? m.awayScore : m.homeScore;

              gf += myScore;
              ga += oppScore;

              if (myScore > oppScore) {
                won++;
                form.push('W');
              } else if (myScore === oppScore) {
                drawn++;
                form.push('D');
              } else {
                lost++;
                form.push('L');
              }
            }
          });

        const gd = gf - ga;
        const points = won * 3 + drawn * 1;

        return {
          team,
          played,
          won,
          drawn,
          lost,
          gf,
          ga,
          gd,
          points,
          form,
        };
      });

      // Sort by points desc, then GD desc, then GF desc
      table.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.gd !== a.gd) return b.gd - a.gd;
        return b.gf - a.gf;
      });

      result[gName] = table;
    });

    return result;
  }, [teams, matches]);

  const nextMatchNum = matches.length > 0 ? Math.max(...matches.map((m) => m.matchNumber)) + 1 : 1;

  return (
    <div className="space-y-6">
      {/* Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-display">
              Jadwal & Hasil Pertandingan Turnamen
            </h1>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {totalMatches} Laga
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manajemen jadwal kick-off, wasit, lapangan pertandingan, formulir DSP, serta klasemen grup resmi {config.name}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Cetak Jadwal Resmi</span>
          </button>

          {!isReadOnly && (
            <button
              onClick={() => {
                setEditingMatch(null);
                setIsEditModalOpen(true);
              }}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-950 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Jadwal</span>
            </button>
          )}
        </div>
      </div>

      {/* Team Viewer Banner */}
      {isReadOnly && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <div>
              <span className="font-bold">Akses Portal Tim:</span> Menampilkan jadwal kick-off resmi, nama wasit, venue lapangan, serta pembaruan skor langsung dan klasemen grup.
            </div>
          </div>
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="font-bold text-emerald-800 hover:text-emerald-950 underline self-start sm:self-auto cursor-pointer shrink-0"
          >
            Cetak Salinan Jadwal
          </button>
        </div>
      )}

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500">Total Pertandingan</div>
          <div className="text-xl font-black font-mono text-slate-900 mt-0.5">
            {totalMatches} <span className="text-xs font-normal text-slate-400 font-sans">Laga</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500">Laga Selesai</div>
          <div className="text-xl font-black font-mono text-emerald-700 mt-0.5">
            {completedMatches} <span className="text-xs font-normal text-slate-400 font-sans">Skor Masuk</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500">Akan Datang / Terjadwal</div>
          <div className="text-xl font-black font-mono text-blue-700 mt-0.5">
            {upcomingMatches} <span className="text-xs font-normal text-slate-400 font-sans">Laga</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500">Total Gol Tercipta</div>
          <div className="text-xl font-black font-mono text-amber-700 mt-0.5">
            {totalGoals} <span className="text-xs font-normal text-slate-400 font-sans">Gol</span>
          </div>
        </div>
      </div>

      {/* Sub-view switcher: Fixtures vs Group Standings */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 rounded-xl shadow-2xs">
        <div className="flex items-center gap-6 text-xs font-semibold">
          <button
            onClick={() => setSubTab('fixtures')}
            className={`py-3.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              subTab === 'fixtures'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Daftar Jadwal & Skor ({matches.length})</span>
          </button>

          <button
            onClick={() => setSubTab('standings')}
            className={`py-3.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              subTab === 'standings'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Klasemen Sementara Fase Grup</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: MATCH FIXTURES LIST */}
      {subTab === 'fixtures' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari klub, wasit, atau lapangan..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:bg-white focus:border-emerald-600"
              />
            </div>

            {/* Filter selectors */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-1">
                <span className="text-slate-500 font-medium">Babak:</span>
                <select
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-md py-1 px-2 text-xs font-medium text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="all">Semua Babak</option>
                  <option value="group_all">Semua Fase Grup</option>
                  <option value="Grup A">Grup A</option>
                  <option value="Grup B">Grup B</option>
                  <option value="Grup C">Grup C</option>
                  <option value="Grup D">Grup D</option>
                  <option value="Grup E">Grup E</option>
                  <option value="Grup F">Grup F</option>
                  <option value="knockout_all">Semua Fase Gugur</option>
                  <option value="Perempat Final">Perempat Final</option>
                  <option value="Semifinal">Semifinal</option>
                  <option value="Final">Grand Final</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-slate-500 font-medium">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-md py-1 px-2 text-xs font-medium text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="all">Semua Status</option>
                  <option value="completed">Selesai (Completed)</option>
                  <option value="upcoming">Akan Datang (Upcoming)</option>
                  <option value="live">Sedang Main (Live)</option>
                  <option value="postponed">Ditunda (Postponed)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Matches Grid / Empty State */}
          {filteredMatches.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-slate-800 font-display">
                Tidak Ada Pertandingan Ditemukan
              </h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                {matches.length === 0
                  ? 'Belum ada jadwal pertandingan yang dibuat. Silakan klik tombol "Tambah Jadwal" untuk menambahkan pertandingan.'
                  : 'Tidak ada jadwal yang cocok dengan kata kunci atau filter yang Anda pilih.'}
              </p>
              {matches.length === 0 && !isReadOnly && (
                <button
                  onClick={() => {
                    setEditingMatch(null);
                    setIsEditModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-950 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Jadwal Pertandingan</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredMatches.map((m) => {
                const home = teamMap.get(m.homeTeamId);
                const away = teamMap.get(m.awayTeamId);

                return (
                  <div
                    key={m.id}
                    className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all shadow-2xs overflow-hidden flex flex-col justify-between"
                  >
                    {/* Top strip with match info & status */}
                    <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                          #{m.matchNumber}
                        </span>
                        <span className="font-bold text-slate-800">{m.stage}</span>
                        {m.matchday && (
                          <span className="text-[11px] text-slate-500">· Pekan {m.matchday}</span>
                        )}
                      </div>

                      {/* Status pill */}
                      {m.status === 'completed' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Selesai</span>
                        </span>
                      )}
                      {m.status === 'live' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 animate-pulse">
                          <Activity className="w-3 h-3" />
                          <span>Live Main</span>
                        </span>
                      )}
                      {m.status === 'upcoming' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          <Clock className="w-3 h-3" />
                          <span>Akan Datang</span>
                        </span>
                      )}
                      {m.status === 'postponed' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">
                          <AlertCircle className="w-3 h-3" />
                          <span>Ditunda</span>
                        </span>
                      )}
                    </div>

                    {/* Teams Head to Head Body */}
                    <div className="p-4 sm:p-5">
                      <div className="flex items-center justify-between gap-2">
                        {/* Home Team */}
                        <div className="flex-1 flex flex-col items-center text-center">
                          <div 
                            className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-2xs p-1 flex items-center justify-center mb-2 overflow-hidden"
                            style={{ backgroundColor: !home?.logoUrl ? (home?.primaryJerseyColor || '#1e293b') + '12' : '#ffffff' }}
                          >
                            {home?.logoUrl ? (
                              <img src={home.logoUrl} alt={home.name} className="w-full h-full object-contain" />
                            ) : (
                              <Shield className="w-6 h-6" style={{ color: home?.primaryJerseyColor || '#1e293b' }} />
                            )}
                          </div>
                          <div className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1">
                            {home?.name || 'TBD (Home)'}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate mt-0.5">
                            {home?.originCity || 'Tuan Rumah'}
                          </div>
                        </div>

                        {/* Middle: Score or Kickoff Time */}
                        <div className="px-3 text-center shrink-0">
                          {m.status === 'completed' || m.status === 'live' ? (
                            <div>
                              <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-slate-900">
                                {m.homeScore ?? 0} - {m.awayScore ?? 0}
                              </div>
                              {m.homePenaltyScore !== undefined && m.awayPenaltyScore !== undefined && (
                                <div className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 mt-1">
                                  Pen: {m.homePenaltyScore} - {m.awayPenaltyScore}
                                </div>
                              )}
                              <div className="text-[10px] font-semibold text-slate-400 mt-0.5">
                                {m.status === 'completed' ? 'Skor Akhir' : 'Live'}
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <span className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">
                                VS
                              </span>
                              <div className="text-sm sm:text-base font-bold font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded">
                                {m.time} WIB
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Away Team */}
                        <div className="flex-1 flex flex-col items-center text-center">
                          <div 
                            className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-2xs p-1 flex items-center justify-center mb-2 overflow-hidden"
                            style={{ backgroundColor: !away?.logoUrl ? (away?.primaryJerseyColor || '#1e293b') + '12' : '#ffffff' }}
                          >
                            {away?.logoUrl ? (
                              <img src={away.logoUrl} alt={away.name} className="w-full h-full object-contain" />
                            ) : (
                              <Shield className="w-6 h-6" style={{ color: away?.primaryJerseyColor || '#1e293b' }} />
                            )}
                          </div>
                          <div className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1">
                            {away?.name || 'TBD (Away)'}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate mt-0.5">
                            {away?.originCity || 'Tim Tamu'}
                          </div>
                        </div>
                      </div>

                      {/* Date, Venue, Referee footer metadata */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-medium text-slate-700">{formatDateIndo(m.date)}</span>
                          <span>·</span>
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{m.time} WIB</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate max-w-[180px]">{m.venue}</span>
                        </div>
                      </div>

                      {/* Wasit & Notes */}
                      {(m.referee || m.notes) && (
                        <div className="mt-2 text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-100 space-y-1">
                          {m.referee && (
                            <div className="text-slate-600 truncate">
                              <span className="font-semibold text-slate-700">Wasit:</span> {m.referee}
                            </div>
                          )}
                          {m.notes && (
                            <div className="text-slate-500 italic text-[10px] line-clamp-1">
                              "{m.notes}"
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Toolbar */}
                    <div className="bg-slate-50/80 px-4 py-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                      {/* Left: Input Skor or Status for Team */}
                      <div className="flex items-center gap-2">
                        {!isReadOnly ? (
                          <button
                            onClick={() => {
                              setScoreMatch(m);
                              setIsScoreModalOpen(true);
                            }}
                            className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                          >
                            <Trophy className="w-3 h-3" />
                            <span>{m.status === 'completed' ? 'Ubah Skor' : 'Input Skor'}</span>
                          </button>
                        ) : (
                          <div className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>{m.status === 'completed' ? 'Pertandingan Selesai' : m.status === 'live' ? 'Sedang Berlangsung' : 'Terjadwal Resmi'}</span>
                          </div>
                        )}

                        {/* Print DSP for teams */}
                        {home && (
                          <button
                            onClick={() => onOpenMatchSheet(home)}
                            title={`Cetak formulir DSP ${home.name}`}
                            className="px-2 py-1 text-[11px] text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <FileText className="w-3 h-3 text-slate-400" />
                            <span>DSP {home.code}</span>
                          </button>
                        )}
                        {away && (
                          <button
                            onClick={() => onOpenMatchSheet(away)}
                            title={`Cetak formulir DSP ${away.name}`}
                            className="px-2 py-1 text-[11px] text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <FileText className="w-3 h-3 text-slate-400" />
                            <span>DSP {away.code}</span>
                          </button>
                        )}
                      </div>

                      {/* Right: Edit & Delete (Admin Only) */}
                      {!isReadOnly && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingMatch(m);
                              setIsEditModalOpen(true);
                            }}
                            title="Edit Jadwal & Venue"
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-white rounded transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Hapus pertandingan #${m.matchNumber} (${home?.name || 'Home'} vs ${away?.name || 'Away'})?`)) {
                                onDeleteMatch(m.id);
                              }
                            }}
                            title="Hapus Pertandingan"
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-white rounded transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: KLASEMEN SEMENTARA FASE GRUP */}
      {subTab === 'standings' && (
        <div className="space-y-6">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-600" />
              <span>
                Klasemen dihitung otomatis secara real-time dari seluruh pertandingan fase grup berstatus <strong>Selesai</strong>.
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-[11px]">
              <span className="inline-block w-2.5 h-2.5 bg-emerald-100 border border-emerald-300 rounded-xs" />
              <span className="text-slate-500">Peringkat 1 & 2 Lolos ke Perempat Final</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {['Grup A', 'Grup B', 'Grup C', 'Grup D', 'Grup E', 'Grup F'].map((gName) => {
              const tableRows = groupStandings[gName] || [];

              return (
                <div
                  key={gName}
                  className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden"
                >
                  <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
                    <div className="font-bold font-display text-sm flex items-center gap-2">
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      <span>{gName}</span>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-400">
                      {tableRows.length} Tim
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-2 text-center w-8">#</th>
                          <th className="py-2.5 px-3">Klub Sepak Bola</th>
                          <th className="py-2.5 px-2 text-center w-8" title="Main">Mn</th>
                          <th className="py-2.5 px-2 text-center w-8" title="Menang">M</th>
                          <th className="py-2.5 px-2 text-center w-8" title="Seri">S</th>
                          <th className="py-2.5 px-2 text-center w-8" title="Kalah">K</th>
                          <th className="py-2.5 px-2 text-center w-10" title="Gol Masuk">GM</th>
                          <th className="py-2.5 px-2 text-center w-10" title="Gol Kebobolan">GK</th>
                          <th className="py-2.5 px-2 text-center w-10" title="Selisih Gol">SG</th>
                          <th className="py-2.5 px-3 text-center w-12 font-bold text-slate-900" title="Poin">Pts</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {tableRows.length === 0 ? (
                          <tr>
                            <td colSpan={10} className="py-6 text-center text-slate-400 text-xs">
                              Belum ada tim yang masuk ke {gName}. Lakukan pembagian di menu Drawing Grup.
                            </td>
                          </tr>
                        ) : (
                          tableRows.map((row, posIdx) => {
                            const isTopTwo = posIdx < 2;

                            return (
                              <tr
                                key={row.team.id}
                                className={isTopTwo ? 'bg-emerald-50/40 hover:bg-emerald-50/70' : 'hover:bg-slate-50'}
                              >
                                <td className="py-2 px-2 text-center font-mono font-bold text-slate-700">
                                  {posIdx + 1}
                                </td>
                                <td className="py-2 px-3">
                                  <div className="flex items-center gap-2">
                                    {row.team.logoUrl ? (
                                      <img
                                        src={row.team.logoUrl}
                                        alt=""
                                        className="w-5 h-5 object-contain shrink-0 rounded"
                                      />
                                    ) : (
                                      <div
                                        className="w-5 h-5 rounded flex items-center justify-center text-white font-bold text-[9px] shrink-0"
                                        style={{ backgroundColor: row.team.primaryJerseyColor }}
                                      >
                                        {row.team.code}
                                      </div>
                                    )}
                                    <span className="font-bold text-slate-900 truncate">
                                      {row.team.name}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-2 px-2 text-center font-mono text-slate-600">
                                  {row.played}
                                </td>
                                <td className="py-2 px-2 text-center font-mono text-emerald-700 font-semibold">
                                  {row.won}
                                </td>
                                <td className="py-2 px-2 text-center font-mono text-slate-600">
                                  {row.drawn}
                                </td>
                                <td className="py-2 px-2 text-center font-mono text-rose-600">
                                  {row.lost}
                                </td>
                                <td className="py-2 px-2 text-center font-mono text-slate-600">
                                  {row.gf}
                                </td>
                                <td className="py-2 px-2 text-center font-mono text-slate-600">
                                  {row.ga}
                                </td>
                                <td className="py-2 px-2 text-center font-mono font-bold text-slate-800">
                                  {row.gd > 0 ? `+${row.gd}` : row.gd}
                                </td>
                                <td className="py-2 px-3 text-center font-mono font-black text-xs text-slate-950 bg-slate-100/50">
                                  {row.points}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modals */}
      <MatchEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingMatch(null);
        }}
        onSaveMatch={onSaveMatch}
        match={editingMatch}
        teams={teams}
        config={config}
        nextMatchNumber={nextMatchNum}
      />

      <MatchScoreModal
        isOpen={isScoreModalOpen}
        onClose={() => {
          setIsScoreModalOpen(false);
          setScoreMatch(null);
        }}
        onSaveScore={handleSaveScore}
        match={scoreMatch}
        homeTeam={scoreMatch ? teamMap.get(scoreMatch.homeTeamId) : undefined}
        awayTeam={scoreMatch ? teamMap.get(scoreMatch.awayTeamId) : undefined}
      />

      <MatchSchedulePrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        matches={matches}
        teams={teams}
        config={config}
      />
    </div>
  );
};
