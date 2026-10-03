import React, { useState, useMemo } from 'react';
import { Match, Team, TournamentConfig } from '../types/tournament';
import { formatDateIndo } from '../utils/formatters';
import { 
  Trophy, 
  Flame, 
  Search, 
  Filter, 
  Printer, 
  Edit3, 
  FileText, 
  Activity, 
  Shield, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  MapPin, 
  Award,
  Users,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { MatchSummaryEditModal } from './MatchSummaryEditModal';
import { MatchSummaryPrintModal } from './MatchSummaryPrintModal';

interface MatchSummaryViewProps {
  matches: Match[];
  teams: Team[];
  config: TournamentConfig;
  onSaveMatch: (match: Match) => void;
  onOpenMatchSheet: (team: Team) => void;
  isReadOnly?: boolean;
}

export const MatchSummaryView: React.FC<MatchSummaryViewProps> = ({
  matches,
  teams,
  config,
  onSaveMatch,
  onOpenMatchSheet,
  isReadOnly = false,
}) => {
  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'live' | 'upcoming'>('all');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [selectedMatchForEdit, setSelectedMatchForEdit] = useState<Match | null>(null);
  const [selectedMatchForPrint, setSelectedMatchForPrint] = useState<Match | null>(null);

  // Teams mapping
  const teamMap = useMemo(() => new Map<string, Team>(teams.map((t) => [t.id, t])), [teams]);

  // Statistics
  const completedMatches = matches.filter((m) => m.status === 'completed');
  const liveMatches = matches.filter((m) => m.status === 'live');
  const upcomingMatches = matches.filter((m) => m.status === 'upcoming');

  const totalGoals = matches.reduce((sum, m) => {
    if (m.homeScore !== undefined && m.awayScore !== undefined) {
      return sum + m.homeScore + m.awayScore;
    }
    return sum;
  }, 0);

  const avgGoalsPerMatch = completedMatches.length > 0
    ? (totalGoals / completedMatches.length).toFixed(1)
    : '0.0';

  // Calculate Top Scorers
  const topScorers = useMemo(() => {
    const scorerMap: Record<string, { name: string; teamName: string; goals: number; penalties: number }> = {};

    matches.forEach((m) => {
      const homeTeam = teamMap.get(m.homeTeamId);
      const awayTeam = teamMap.get(m.awayTeamId);

      m.goals?.forEach((g) => {
        if (g.isOwnGoal) return;
        const key = `${g.playerName.toLowerCase().trim()}_${g.teamId}`;
        const teamName = g.teamId === m.homeTeamId ? homeTeam?.name || 'Home' : awayTeam?.name || 'Away';

        if (!scorerMap[key]) {
          scorerMap[key] = {
            name: g.playerName,
            teamName,
            goals: 0,
            penalties: 0,
          };
        }
        scorerMap[key].goals += 1;
        if (g.isPenalty) scorerMap[key].penalties += 1;
      });
    });

    return Object.values(scorerMap)
      .sort((a, b) => b.goals - a.goals)
      .slice(0, 5);
  }, [matches, teamMap]);

  // Calculate disciplinary stats
  const totalYellowCards = matches.reduce((sum, m) => {
    return sum + (m.cards?.filter((c) => c.type === 'yellow').length || 0);
  }, 0);

  const totalRedCards = matches.reduce((sum, m) => {
    return sum + (m.cards?.filter((c) => c.type === 'red').length || 0);
  }, 0);

  // Filtered Matches
  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      // Status filter
      if (statusFilter !== 'all' && m.status !== statusFilter) {
        return false;
      }

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

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const home = teamMap.get(m.homeTeamId)?.name.toLowerCase() || '';
        const away = teamMap.get(m.awayTeamId)?.name.toLowerCase() || '';
        const venue = m.venue.toLowerCase();
        const referee = (m.referee || '').toLowerCase();
        const stage = m.stage.toLowerCase();
        const motm = (m.manOfTheMatch || '').toLowerCase();
        const notes = (m.summaryNotes || m.notes || '').toLowerCase();

        if (
          !home.includes(q) &&
          !away.includes(q) &&
          !venue.includes(q) &&
          !referee.includes(q) &&
          !stage.includes(q) &&
          !motm.includes(q) &&
          !notes.includes(q)
        ) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      // Sort completed/live first, then by matchNumber
      const statusWeight = (s: string) => {
        if (s === 'live') return 1;
        if (s === 'completed') return 2;
        if (s === 'upcoming') return 3;
        return 4;
      };
      if (statusWeight(a.status) !== statusWeight(b.status)) {
        return statusWeight(a.status) - statusWeight(b.status);
      }
      return a.matchNumber - b.matchNumber;
    });
  }, [matches, statusFilter, stageFilter, searchQuery, teamMap]);

  return (
    <div className="space-y-6">
      {/* 1. Header & Navigation Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-display flex items-center gap-2">
              <Trophy className="w-6 h-6 text-emerald-700" />
              <span>Match Summary & Berita Acara Pertandingan</span>
            </h1>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Admin Menu
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Rekapitulasi lengkap skor akhir, daftar pencetak gol (goal scorers), kartu pelanggaran, statistik pertandingan, dan berita acara resmi {config.name}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Cetak Rekap Turnamen</span>
          </button>
        </div>
      </div>

      {/* 2. Key Performance Indicators (KPI Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Matches */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Pertandingan</span>
            <Calendar className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">{matches.length}</span>
            <span className="text-xs text-slate-500">Laga Terjadwal</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-600">
            <span className="font-semibold text-emerald-700">{completedMatches.length} Selesai</span>
            <span>·</span>
            <span className="font-semibold text-blue-600">{liveMatches.length} Live</span>
            <span>·</span>
            <span>{upcomingMatches.length} Menunggu</span>
          </div>
        </div>

        {/* Goals Metric */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Produktivitas Gol</span>
            <span className="text-sm">⚽</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">{totalGoals}</span>
            <span className="text-xs text-slate-500">Total Gol</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-600">
            Rata-rata: <strong className="text-emerald-700 font-mono">{avgGoalsPerMatch}</strong> gol per pertandingan selesai
          </div>
        </div>

        {/* Top Scorers Spotlight */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Top Skorer Sementara</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          {topScorers.length > 0 ? (
            <div className="mt-1.5">
              <div className="font-bold text-slate-900 text-xs truncate">
                🥇 {topScorers[0].name}
              </div>
              <div className="text-[11px] text-slate-500 flex items-center justify-between mt-0.5">
                <span className="truncate max-w-[130px]">{topScorers[0].teamName}</span>
                <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  {topScorers[0].goals} Gol
                </span>
              </div>
            </div>
          ) : (
            <div className="mt-2 text-xs text-slate-400 italic">Belum ada gol tercatat</div>
          )}
        </div>

        {/* Fair Play & Discipline */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Disiplin & Fair Play</span>
            <Shield className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-2 py-1 rounded-md">
              <span className="w-2.5 h-3.5 bg-amber-400 border border-amber-500 rounded-2xs inline-block" />
              <span className="font-mono font-bold text-amber-900 text-sm">{totalYellowCards}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 px-2 py-1 rounded-md">
              <span className="w-2.5 h-3.5 bg-rose-600 border border-rose-700 rounded-2xs inline-block" />
              <span className="font-mono font-bold text-rose-900 text-sm">{totalRedCards}</span>
            </div>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Total kartu pelanggaran turnamen
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua ({matches.length})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              statusFilter === 'completed'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Selesai ({completedMatches.length})
          </button>
          <button
            onClick={() => setStatusFilter('live')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              statusFilter === 'live'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Live ({liveMatches.length})
          </button>
          <button
            onClick={() => setStatusFilter('upcoming')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              statusFilter === 'upcoming'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Akan Datang ({upcomingMatches.length})
          </button>
        </div>

        {/* Stage Filter & Search Input */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Stage Dropdown */}
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-medium cursor-pointer focus:outline-none focus:border-emerald-600"
          >
            <option value="all">Semua Babak & Grup</option>
            <option value="group_all">Seluruh Babak Grup</option>
            <option value="Grup A">Grup A</option>
            <option value="Grup B">Grup B</option>
            <option value="Grup C">Grup C</option>
            <option value="Grup D">Grup D</option>
            <option value="knockout_all">Seluruh Fase Gugur</option>
            <option value="Perempat Final">Perempat Final</option>
            <option value="Semifinal">Semifinal</option>
            <option value="Perebutan Juara 3">Perebutan Juara 3</option>
            <option value="Final">Grand Final</option>
          </select>

          {/* Search Box */}
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari klub, wasit, MOTM..."
              className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 bg-white"
            />
          </div>
        </div>
      </div>

      {/* 4. Match Summary List */}
      <div className="space-y-4">
        {filteredMatches.length > 0 ? (
          filteredMatches.map((m) => {
            const home = teamMap.get(m.homeTeamId);
            const away = teamMap.get(m.awayTeamId);
            const isKnockout = m.stage.includes('Final') || m.stage.includes('Juara');
            const hasSummaryData = (m.goals && m.goals.length > 0) || (m.cards && m.cards.length > 0) || m.summaryNotes;

            return (
              <div
                key={m.id}
                className="bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-sm transition-shadow overflow-hidden"
              >
                {/* Top Bar: Match info, date, referee, status */}
                <div className="px-4 sm:px-6 py-2.5 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                      MATCH #{m.matchNumber}
                    </span>
                    <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {m.stage}
                    </span>
                    <span className="text-slate-400 hidden sm:inline">·</span>
                    <span className="text-slate-600 hidden sm:inline flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {formatDateIndo(m.date)} pukul {m.time} WIB
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status Badge */}
                    {m.status === 'live' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-rose-600 inline-block" />
                        LIVE LAGA
                      </span>
                    ) : m.status === 'completed' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Selesai (FT)
                      </span>
                    ) : m.status === 'postponed' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800">
                        Ditunda
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        Akan Datang
                      </span>
                    )}

                    {/* Venue & Referee */}
                    <span className="text-slate-500 hidden md:inline text-[11px]">
                      📍 {m.venue}
                    </span>
                  </div>
                </div>

                {/* Main Scoreboard Section */}
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    {/* Home Team */}
                    <div className="md:col-span-4 flex items-center md:justify-end gap-3 order-1 md:order-1">
                      <div className="text-left md:text-right">
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                          {home?.name || 'Tuan Rumah'}
                        </h3>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">
                          {home?.originCity} ({home?.code})
                        </div>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0 shadow-2xs">
                        {home?.logoUrl ? (
                          <img src={home.logoUrl} alt="" className="w-full h-full object-contain" />
                        ) : (
                          <span className="font-bold text-xs" style={{ color: home?.primaryJerseyColor || '#000' }}>
                            {home?.code || 'HOM'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Score Center Box */}
                    <div className="md:col-span-4 flex flex-col items-center justify-center text-center order-3 md:order-2 py-2 px-4 bg-slate-50/70 rounded-xl border border-slate-200">
                      <div className="text-3xl sm:text-4xl font-mono font-black tracking-wider text-slate-900">
                        {m.status === 'upcoming' ? 'VS' : `${m.homeScore ?? 0} - ${m.awayScore ?? 0}`}
                      </div>

                      {m.status !== 'upcoming' && (
                        <div className="text-xs font-bold text-slate-600 mt-1 font-mono">
                          Babak 1: ({m.halfTimeScore?.home ?? 0} - {m.halfTimeScore?.away ?? 0})
                        </div>
                      )}

                      {isKnockout && m.homePenaltyScore !== undefined && m.awayPenaltyScore !== undefined && (
                        <div className="text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full mt-1.5 font-mono">
                          Penalti: {m.homePenaltyScore} - {m.awayPenaltyScore}
                        </div>
                      )}

                      {/* Man of the Match Spotlight */}
                      {m.manOfTheMatch && (
                        <div className="mt-2 pt-2 border-t border-slate-200 text-center w-full">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <Award className="w-3 h-3 text-emerald-600" />
                            <span>MOTM: {m.manOfTheMatch}</span>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Away Team */}
                    <div className="md:col-span-4 flex items-center gap-3 order-2 md:order-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0 shadow-2xs">
                        {away?.logoUrl ? (
                          <img src={away.logoUrl} alt="" className="w-full h-full object-contain" />
                        ) : (
                          <span className="font-bold text-xs" style={{ color: away?.primaryJerseyColor || '#000' }}>
                            {away?.code || 'AWY'}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                          {away?.name || 'Tim Tamu'}
                        </h3>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">
                          {away?.originCity} ({away?.code})
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary Details: Goals & Cards timeline */}
                  {hasSummaryData && (
                    <div className="mt-5 pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {/* Goals Timeline */}
                      <div>
                        <div className="font-semibold text-slate-700 flex items-center gap-1.5 mb-2">
                          <span>⚽</span>
                          <span>Pencetak Gol:</span>
                        </div>
                        {m.goals && m.goals.length > 0 ? (
                          <div className="space-y-1">
                            {m.goals.map((g) => {
                              const isHome = g.teamId === m.homeTeamId;
                              const teamCode = isHome ? home?.code : away?.code;
                              return (
                                <div key={g.id} className="flex items-center gap-1.5 text-slate-800">
                                  <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200 text-[10px]">
                                    {g.minute}'
                                  </span>
                                  <span className="font-semibold">{g.playerName}</span>
                                  {g.isPenalty && (
                                    <span className="text-[10px] text-amber-700 font-bold">(Penalti)</span>
                                  )}
                                  {g.isOwnGoal && (
                                    <span className="text-[10px] text-rose-700 font-bold">(Gol Bunuh Diri)</span>
                                  )}
                                  <span className="text-[10px] text-slate-400 font-mono">[{teamCode}]</span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Tidak ada gol dicetak.</span>
                        )}
                      </div>

                      {/* Cards Timeline */}
                      <div>
                        <div className="font-semibold text-slate-700 flex items-center gap-1.5 mb-2">
                          <span>🟨🟥</span>
                          <span>Kartu Disiplin:</span>
                        </div>
                        {m.cards && m.cards.length > 0 ? (
                          <div className="space-y-1">
                            {m.cards.map((c) => {
                              const isHome = c.teamId === m.homeTeamId;
                              const teamCode = isHome ? home?.code : away?.code;
                              return (
                                <div key={c.id} className="flex items-center gap-1.5 text-slate-800">
                                  <span
                                    className={`w-2.5 h-3.5 rounded-2xs inline-block shadow-2xs ${
                                      c.type === 'yellow' ? 'bg-amber-400' : 'bg-rose-600'
                                    }`}
                                  />
                                  <span className="font-mono font-bold text-slate-700 text-[10px]">
                                    {c.minute}'
                                  </span>
                                  <span className="font-semibold">{c.playerName}</span>
                                  {c.reason && (
                                    <span className="text-[10px] text-slate-400">({c.reason})</span>
                                  )}
                                  <span className="text-[10px] text-slate-400 font-mono">[{teamCode}]</span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Laga bersih tanpa kartu.</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Referee Summary Notes preview */}
                  {(m.summaryNotes || m.notes) && (
                    <div className="mt-3 p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-600 text-[11px]">
                      <span className="font-bold text-slate-700">Catatan Ringkasan Laga: </span>
                      {m.summaryNotes || m.notes}
                    </div>
                  )}
                </div>

                {/* Bottom Action Footer for Admins */}
                <div className="px-4 sm:px-6 py-2.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="text-[11px] text-slate-500">
                    Wasit Utama: <strong className="text-slate-800">{m.referee || 'Belum ditugaskan'}</strong>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* View DSP Home */}
                    {home && (
                      <button
                        onClick={() => onOpenMatchSheet(home)}
                        className="px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors text-[11px] font-semibold cursor-pointer"
                        title={`Lihat Daftar Susunan Pemain ${home.name}`}
                      >
                        DSP {home.code}
                      </button>
                    )}

                    {/* View DSP Away */}
                    {away && (
                      <button
                        onClick={() => onOpenMatchSheet(away)}
                        className="px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors text-[11px] font-semibold cursor-pointer"
                        title={`Lihat Daftar Susunan Pemain ${away.name}`}
                      >
                        DSP {away.code}
                      </button>
                    )}

                    {/* Official Match Summary Print Sheet */}
                    <button
                      onClick={() => setSelectedMatchForPrint(m)}
                      className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded font-semibold text-slate-800 transition-colors flex items-center gap-1 cursor-pointer text-xs shadow-2xs"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-600" />
                      <span>Berita Acara</span>
                    </button>

                    {/* Edit Match Summary (Admin) */}
                    {!isReadOnly && (
                      <button
                        onClick={() => setSelectedMatchForEdit(m)}
                        className="px-3.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-bold transition-colors flex items-center gap-1 cursor-pointer text-xs shadow-2xs"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Input / Edit Summary</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 text-xs">
            <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <div className="font-bold text-slate-800 text-sm">Tidak ada data pertandingan ditemukan</div>
            <div className="mt-1 text-slate-400">
              Silakan sesuaikan filter status, babak pertandingan, atau kata kunci pencarian Anda.
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      {/* 1. Match Summary Edit Modal */}
      {selectedMatchForEdit && (
        <MatchSummaryEditModal
          isOpen={!!selectedMatchForEdit}
          onClose={() => setSelectedMatchForEdit(null)}
          onSave={(updated) => {
            onSaveMatch(updated);
            setSelectedMatchForEdit(null);
          }}
          match={selectedMatchForEdit}
          homeTeam={teamMap.get(selectedMatchForEdit.homeTeamId)}
          awayTeam={teamMap.get(selectedMatchForEdit.awayTeamId)}
        />
      )}

      {/* 2. Match Summary Print Modal */}
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
