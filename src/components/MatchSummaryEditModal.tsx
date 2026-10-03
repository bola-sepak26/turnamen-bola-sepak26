import React, { useState, useEffect } from 'react';
import { Match, Team, GoalEvent, CardEvent, MatchStats } from '../types/tournament';
import { X, Plus, Trash2, Trophy, Shield, Activity, Award, FileText } from 'lucide-react';

interface MatchSummaryEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedMatch: Match) => void;
  match: Match | null;
  homeTeam?: Team;
  awayTeam?: Team;
}

export const MatchSummaryEditModal: React.FC<MatchSummaryEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  match,
  homeTeam,
  awayTeam,
}) => {
  const [status, setStatus] = useState<Match['status']>('completed');
  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);
  const [htHome, setHtHome] = useState<number>(0);
  const [htAway, setHtAway] = useState<number>(0);
  const [homePen, setHomePen] = useState<number | undefined>(undefined);
  const [awayPen, setAwayPen] = useState<number | undefined>(undefined);
  const [manOfTheMatch, setManOfTheMatch] = useState<string>('');
  const [summaryNotes, setSummaryNotes] = useState<string>('');
  const [referee, setReferee] = useState<string>('');

  // Goals & Cards
  const [goals, setGoals] = useState<GoalEvent[]>([]);
  const [cards, setCards] = useState<CardEvent[]>([]);

  // Statistics
  const [homePossession, setHomePossession] = useState<number>(50);
  const [homeShots, setHomeShots] = useState<number>(8);
  const [awayShots, setAwayShots] = useState<number>(8);
  const [homeShotsOnTarget, setHomeShotsOnTarget] = useState<number>(4);
  const [awayShotsOnTarget, setAwayShotsOnTarget] = useState<number>(4);
  const [homeCorners, setHomeCorners] = useState<number>(4);
  const [awayCorners, setAwayCorners] = useState<number>(4);
  const [homeFouls, setHomeFouls] = useState<number>(10);
  const [awayFouls, setAwayFouls] = useState<number>(10);

  // New Goal Input Draft
  const [newGoalMinute, setNewGoalMinute] = useState<number>(1);
  const [newGoalTeamId, setNewGoalTeamId] = useState<string>('');
  const [newGoalPlayerName, setNewGoalPlayerName] = useState<string>('');
  const [newGoalIsPenalty, setNewGoalIsPenalty] = useState<boolean>(false);
  const [newGoalIsOwnGoal, setNewGoalIsOwnGoal] = useState<boolean>(false);

  // New Card Input Draft
  const [newCardMinute, setNewCardMinute] = useState<number>(1);
  const [newCardTeamId, setNewCardTeamId] = useState<string>('');
  const [newCardPlayerName, setNewCardPlayerName] = useState<string>('');
  const [newCardType, setNewCardType] = useState<'yellow' | 'red'>('yellow');
  const [newCardReason, setNewCardReason] = useState<string>('');

  useEffect(() => {
    if (!match) return;

    setStatus(match.status === 'upcoming' ? 'completed' : match.status);
    setHomeScore(match.homeScore ?? 0);
    setAwayScore(match.awayScore ?? 0);
    setHtHome(match.halfTimeScore?.home ?? Math.min(match.homeScore ?? 0, 1));
    setHtAway(match.halfTimeScore?.away ?? Math.min(match.awayScore ?? 0, 0));
    setHomePen(match.homePenaltyScore);
    setAwayPen(match.awayPenaltyScore);
    setManOfTheMatch(match.manOfTheMatch || '');
    setSummaryNotes(match.summaryNotes || match.notes || '');
    setReferee(match.referee || '');

    setGoals(match.goals || []);
    setCards(match.cards || []);

    const stats = match.matchStats;
    setHomePossession(stats?.homePossession ?? 50);
    setHomeShots(stats?.homeShots ?? 8);
    setAwayShots(stats?.awayShots ?? 8);
    setHomeShotsOnTarget(stats?.homeShotsOnTarget ?? 4);
    setAwayShotsOnTarget(stats?.awayShotsOnTarget ?? 4);
    setHomeCorners(stats?.homeCorners ?? 4);
    setAwayCorners(stats?.awayCorners ?? 4);
    setHomeFouls(stats?.homeFouls ?? 10);
    setAwayFouls(stats?.awayFouls ?? 10);

    // Default draft teams
    setNewGoalTeamId(match.homeTeamId);
    setNewCardTeamId(match.homeTeamId);
  }, [match]);

  if (!isOpen || !match) return null;

  const isKnockout = match.stage.includes('Final') || match.stage.includes('Juara');

  // Handle adding goal
  const handleAddGoal = () => {
    if (!newGoalPlayerName.trim()) return;
    const goal: GoalEvent = {
      id: `g-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      minute: Number(newGoalMinute) || 1,
      teamId: newGoalTeamId || match.homeTeamId,
      playerName: newGoalPlayerName.trim(),
      isPenalty: newGoalIsPenalty,
      isOwnGoal: newGoalIsOwnGoal,
    };
    const updatedGoals = [...goals, goal].sort((a, b) => a.minute - b.minute);
    setGoals(updatedGoals);

    // Auto update score
    const homeGoalsCount = updatedGoals.filter(
      (g) => (g.teamId === match.homeTeamId && !g.isOwnGoal) || (g.teamId === match.awayTeamId && g.isOwnGoal)
    ).length;
    const awayGoalsCount = updatedGoals.filter(
      (g) => (g.teamId === match.awayTeamId && !g.isOwnGoal) || (g.teamId === match.homeTeamId && g.isOwnGoal)
    ).length;
    setHomeScore(homeGoalsCount);
    setAwayScore(awayGoalsCount);

    setNewGoalPlayerName('');
    setNewGoalIsPenalty(false);
    setNewGoalIsOwnGoal(false);
  };

  const handleRemoveGoal = (id: string) => {
    const updated = goals.filter((g) => g.id !== id);
    setGoals(updated);
    const homeGoalsCount = updated.filter(
      (g) => (g.teamId === match.homeTeamId && !g.isOwnGoal) || (g.teamId === match.awayTeamId && g.isOwnGoal)
    ).length;
    const awayGoalsCount = updated.filter(
      (g) => (g.teamId === match.awayTeamId && !g.isOwnGoal) || (g.teamId === match.homeTeamId && g.isOwnGoal)
    ).length;
    setHomeScore(homeGoalsCount);
    setAwayScore(awayGoalsCount);
  };

  // Handle adding card
  const handleAddCard = () => {
    if (!newCardPlayerName.trim()) return;
    const card: CardEvent = {
      id: `c-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      minute: Number(newCardMinute) || 1,
      teamId: newCardTeamId || match.homeTeamId,
      playerName: newCardPlayerName.trim(),
      type: newCardType,
      reason: newCardReason.trim() || undefined,
    };
    setCards([...cards, card].sort((a, b) => a.minute - b.minute));
    setNewCardPlayerName('');
    setNewCardReason('');
  };

  const handleRemoveCard = (id: string) => {
    setCards(cards.filter((c) => c.id !== id));
  };

  // Save all
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const stats: MatchStats = {
      homePossession,
      awayPossession: 100 - homePossession,
      homeShots,
      awayShots,
      homeShotsOnTarget,
      awayShotsOnTarget,
      homeCorners,
      awayCorners,
      homeFouls,
      awayFouls,
    };

    const updated: Match = {
      ...match,
      status,
      homeScore,
      awayScore,
      homePenaltyScore: isKnockout && homeScore === awayScore ? homePen : undefined,
      awayPenaltyScore: isKnockout && homeScore === awayScore ? awayPen : undefined,
      halfTimeScore: {
        home: htHome,
        away: htAway,
      },
      goals,
      cards,
      matchStats: stats,
      manOfTheMatch: manOfTheMatch.trim() || undefined,
      referee: referee.trim() || match.referee,
      summaryNotes: summaryNotes.trim() || undefined,
      notes: summaryNotes.trim() || match.notes,
    };

    onSave(updated);
    onClose();
  };

  const homePlayers = homeTeam?.players || [];
  const awayPlayers = awayTeam?.players || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                Match #{match.matchNumber}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {match.stage} · {match.venue}
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 font-display mt-0.5">
              Input / Perbarui Match Summary Resmi
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* 1. Scoreboard & Status */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between gap-4">
              {/* Home Team */}
              <div className="flex-1 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center mb-1.5 shadow-2xs">
                  {homeTeam?.logoUrl ? (
                    <img src={homeTeam.logoUrl} alt="" className="w-full h-full object-contain" />
                  ) : (
                    <span className="font-bold text-xs" style={{ color: homeTeam?.primaryJerseyColor || '#000' }}>
                      {homeTeam?.code || 'HOM'}
                    </span>
                  )}
                </div>
                <span className="font-bold text-slate-900 text-sm">{homeTeam?.name || 'Tuan Rumah'}</span>
                <span className="text-[10px] text-slate-400">Tuan Rumah</span>
                <input
                  type="number"
                  min={0}
                  max={99}
                  value={homeScore}
                  onChange={(e) => setHomeScore(Math.max(0, Number(e.target.value)))}
                  className="w-16 h-12 mt-2 text-center text-2xl font-mono font-black border-2 border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 bg-white"
                  title="Skor Akhir Home"
                  required
                />
                <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                  <span>Babak 1:</span>
                  <input
                    type="number"
                    min={0}
                    max={homeScore}
                    value={htHome}
                    onChange={(e) => setHtHome(Math.max(0, Number(e.target.value)))}
                    className="w-10 text-center font-mono py-0.5 border border-slate-300 rounded bg-white"
                  />
                </div>
              </div>

              {/* Status & VS */}
              <div className="flex flex-col items-center px-2">
                <span className="text-xl font-black text-slate-400 mb-1">:</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Match['status'])}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300 bg-white text-slate-800 shadow-2xs cursor-pointer focus:outline-none focus:border-emerald-600"
                >
                  <option value="completed">Selesai (Full Time)</option>
                  <option value="live">Sedang Berlangsung (Live)</option>
                  <option value="upcoming">Akan Datang (Jadwal)</option>
                  <option value="postponed">Ditunda (Postponed)</option>
                </select>
                <span className="text-[10px] text-slate-400 mt-1 font-mono">Skor Akhir Penuh</span>
              </div>

              {/* Away Team */}
              <div className="flex-1 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center mb-1.5 shadow-2xs">
                  {awayTeam?.logoUrl ? (
                    <img src={awayTeam.logoUrl} alt="" className="w-full h-full object-contain" />
                  ) : (
                    <span className="font-bold text-xs" style={{ color: awayTeam?.primaryJerseyColor || '#000' }}>
                      {awayTeam?.code || 'AWY'}
                    </span>
                  )}
                </div>
                <span className="font-bold text-slate-900 text-sm">{awayTeam?.name || 'Tim Tamu'}</span>
                <span className="text-[10px] text-slate-400">Tim Tamu</span>
                <input
                  type="number"
                  min={0}
                  max={99}
                  value={awayScore}
                  onChange={(e) => setAwayScore(Math.max(0, Number(e.target.value)))}
                  className="w-16 h-12 mt-2 text-center text-2xl font-mono font-black border-2 border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 bg-white"
                  title="Skor Akhir Away"
                  required
                />
                <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                  <span>Babak 1:</span>
                  <input
                    type="number"
                    min={0}
                    max={awayScore}
                    value={htAway}
                    onChange={(e) => setHtAway(Math.max(0, Number(e.target.value)))}
                    className="w-10 text-center font-mono py-0.5 border border-slate-300 rounded bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Penalty shootout if tie and knockout */}
            {isKnockout && homeScore === awayScore && (
              <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
                <div className="font-bold text-amber-900 text-xs mb-2">
                  Adu Penalti (Skor Berakhir Imbang Pada Babak Gugur)
                </div>
                <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700">{homeTeam?.code || 'Home'}:</span>
                    <input
                      type="number"
                      min={0}
                      value={homePen ?? ''}
                      onChange={(e) => setHomePen(e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="0"
                      className="w-12 text-center py-1 font-mono font-bold border border-amber-300 rounded bg-white"
                    />
                  </div>
                  <span className="font-bold text-slate-400">Penalti</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700">{awayTeam?.code || 'Away'}:</span>
                    <input
                      type="number"
                      min={0}
                      value={awayPen ?? ''}
                      onChange={(e) => setAwayPen(e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="0"
                      className="w-12 text-center py-1 font-mono font-bold border border-amber-300 rounded bg-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. Goal Scorers Section */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                <span>⚽</span>
                <span>Daftar Pencetak Gol (Goal Scorers)</span>
                <span className="text-xs font-normal text-slate-500">({goals.length} gol tercatat)</span>
              </div>
            </div>

            {/* Goals List */}
            {goals.length > 0 ? (
              <div className="space-y-1.5">
                {goals.map((g) => {
                  const isHome = g.teamId === match.homeTeamId;
                  const teamName = isHome ? homeTeam?.name : awayTeam?.name;
                  return (
                    <div
                      key={g.id}
                      className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          {g.minute}'
                        </span>
                        <span className="font-bold text-slate-800">{g.playerName}</span>
                        {g.isPenalty && (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                            Penalti
                          </span>
                        )}
                        {g.isOwnGoal && (
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                            Gol Bunuh Diri
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400">({teamName})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveGoal(g.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 cursor-pointer"
                        title="Hapus gol"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-slate-400 text-xs italic py-2 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
                Belum ada pencetak gol yang ditambahkan.
              </div>
            )}

            {/* Add Goal Form Row */}
            <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center gap-2 bg-slate-50/50 p-2.5 rounded-lg">
              <div className="w-16">
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={newGoalMinute}
                  onChange={(e) => setNewGoalMinute(Number(e.target.value))}
                  placeholder="Mnt"
                  className="w-full px-2 py-1.5 border border-slate-300 rounded font-mono text-center bg-white"
                  title="Menit gol (1-120)"
                />
              </div>

              <select
                value={newGoalTeamId}
                onChange={(e) => {
                  setNewGoalTeamId(e.target.value);
                  setNewGoalPlayerName('');
                }}
                className="px-2 py-1.5 border border-slate-300 rounded bg-white font-medium"
              >
                <option value={match.homeTeamId}>{homeTeam?.name || 'Home'}</option>
                <option value={match.awayTeamId}>{awayTeam?.name || 'Away'}</option>
              </select>

              <div className="flex-1 min-w-[160px]">
                {/* Select from squad or custom input */}
                <input
                  type="text"
                  list={`squad-${newGoalTeamId}`}
                  value={newGoalPlayerName}
                  onChange={(e) => setNewGoalPlayerName(e.target.value)}
                  placeholder="Nama pencetak gol..."
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                />
                <datalist id={`squad-${newGoalTeamId}`}>
                  {(newGoalTeamId === match.homeTeamId ? homePlayers : awayPlayers).map((p) => (
                    <option key={p.id} value={`#${p.number} ${p.name}`} />
                  ))}
                </datalist>
              </div>

              <label className="flex items-center gap-1 cursor-pointer select-none text-[11px] text-slate-700">
                <input
                  type="checkbox"
                  checked={newGoalIsPenalty}
                  onChange={(e) => setNewGoalIsPenalty(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-0"
                />
                Penalti
              </label>

              <label className="flex items-center gap-1 cursor-pointer select-none text-[11px] text-slate-700">
                <input
                  type="checkbox"
                  checked={newGoalIsOwnGoal}
                  onChange={(e) => setNewGoalIsOwnGoal(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-0"
                />
                OG
              </label>

              <button
                type="button"
                onClick={handleAddGoal}
                className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded hover:bg-emerald-700 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah
              </button>
            </div>
          </div>

          {/* 3. Disciplinary Cards Section */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                <span>🟨🟥</span>
                <span>Kartu Disiplin & Pelanggaran (Cards)</span>
                <span className="text-xs font-normal text-slate-500">({cards.length} kartu)</span>
              </div>
            </div>

            {/* Cards List */}
            {cards.length > 0 ? (
              <div className="space-y-1.5">
                {cards.map((c) => {
                  const isHome = c.teamId === match.homeTeamId;
                  const teamName = isHome ? homeTeam?.name : awayTeam?.name;
                  return (
                    <div
                      key={c.id}
                      className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-3.5 h-5 rounded-xs inline-block shadow-2xs ${
                            c.type === 'yellow' ? 'bg-amber-400 border border-amber-500' : 'bg-rose-600 border border-rose-700'
                          }`}
                        />
                        <span className="font-mono font-bold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          {c.minute}'
                        </span>
                        <span className="font-bold text-slate-800">{c.playerName}</span>
                        {c.reason && <span className="text-[11px] text-slate-500 italic">— {c.reason}</span>}
                        <span className="text-[11px] text-slate-400">({teamName})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCard(c.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 cursor-pointer"
                        title="Hapus kartu"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-slate-400 text-xs italic py-2 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
                Tidak ada kartu kuning atau merah tercatat pada laga ini (Pertandingan Bersih).
              </div>
            )}

            {/* Add Card Form Row */}
            <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center gap-2 bg-slate-50/50 p-2.5 rounded-lg">
              <div className="w-16">
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={newCardMinute}
                  onChange={(e) => setNewCardMinute(Number(e.target.value))}
                  placeholder="Mnt"
                  className="w-full px-2 py-1.5 border border-slate-300 rounded font-mono text-center bg-white"
                  title="Menit kartu (1-120)"
                />
              </div>

              <select
                value={newCardType}
                onChange={(e) => setNewCardType(e.target.value as 'yellow' | 'red')}
                className="px-2 py-1.5 border border-slate-300 rounded bg-white font-bold"
              >
                <option value="yellow">🟨 Kartu Kuning</option>
                <option value="red">🟥 Kartu Merah</option>
              </select>

              <select
                value={newCardTeamId}
                onChange={(e) => {
                  setNewCardTeamId(e.target.value);
                  setNewCardPlayerName('');
                }}
                className="px-2 py-1.5 border border-slate-300 rounded bg-white font-medium"
              >
                <option value={match.homeTeamId}>{homeTeam?.name || 'Home'}</option>
                <option value={match.awayTeamId}>{awayTeam?.name || 'Away'}</option>
              </select>

              <div className="flex-1 min-w-[140px]">
                <input
                  type="text"
                  list={`card-squad-${newCardTeamId}`}
                  value={newCardPlayerName}
                  onChange={(e) => setNewCardPlayerName(e.target.value)}
                  placeholder="Nama penerima kartu..."
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                />
                <datalist id={`card-squad-${newCardTeamId}`}>
                  {(newCardTeamId === match.homeTeamId ? homePlayers : awayPlayers).map((p) => (
                    <option key={p.id} value={`#${p.number} ${p.name}`} />
                  ))}
                </datalist>
              </div>

              <div className="w-36">
                <input
                  type="text"
                  value={newCardReason}
                  onChange={(e) => setNewCardReason(e.target.value)}
                  placeholder="Alasan / jenis foul..."
                  className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white text-[11px]"
                />
              </div>

              <button
                type="button"
                onClick={handleAddCard}
                className="px-3 py-1.5 bg-slate-800 text-white font-bold rounded hover:bg-slate-900 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah
              </button>
            </div>
          </div>

          {/* 4. Match Details & Man of the Match */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                ⭐ Man of the Match (Pemain Terbaik Laga)
              </label>
              <input
                type="text"
                value={manOfTheMatch}
                onChange={(e) => setManOfTheMatch(e.target.value)}
                placeholder="Contoh: Arkhan Kaka (#6 Garuda Muda)"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Wasit Utama & Perangkat Pertandingan
              </label>
              <input
                type="text"
                value={referee}
                onChange={(e) => setReferee(e.target.value)}
                placeholder="Nama wasit utama..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 bg-white"
              />
            </div>
          </div>

          {/* 5. Match Statistics */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Statistik Pertandingan (Match Stats)</span>
            </div>

            <div className="space-y-3">
              {/* Possession */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span>{homeTeam?.code || 'Home'}: {homePossession}%</span>
                  <span className="text-slate-500 font-normal">Penguasaan Bola</span>
                  <span>{awayTeam?.code || 'Away'}: {100 - homePossession}%</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={80}
                  value={homePossession}
                  onChange={(e) => setHomePossession(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              {/* Total Shots & Shots on Target */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center">
                  <div className="text-[10px] text-slate-500">Tembakan (Home / Away)</div>
                  <div className="flex items-center justify-center gap-2 mt-1 font-mono font-bold">
                    <input
                      type="number"
                      min={0}
                      value={homeShots}
                      onChange={(e) => setHomeShots(Number(e.target.value))}
                      className="w-12 text-center py-0.5 border border-slate-300 rounded bg-white"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      min={0}
                      value={awayShots}
                      onChange={(e) => setAwayShots(Number(e.target.value))}
                      className="w-12 text-center py-0.5 border border-slate-300 rounded bg-white"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center">
                  <div className="text-[10px] text-slate-500">Tembakan On Target</div>
                  <div className="flex items-center justify-center gap-2 mt-1 font-mono font-bold">
                    <input
                      type="number"
                      min={0}
                      value={homeShotsOnTarget}
                      onChange={(e) => setHomeShotsOnTarget(Number(e.target.value))}
                      className="w-12 text-center py-0.5 border border-slate-300 rounded bg-white"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      min={0}
                      value={awayShotsOnTarget}
                      onChange={(e) => setAwayShotsOnTarget(Number(e.target.value))}
                      className="w-12 text-center py-0.5 border border-slate-300 rounded bg-white"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center">
                  <div className="text-[10px] text-slate-500">Tendangan Sudut (Corners)</div>
                  <div className="flex items-center justify-center gap-2 mt-1 font-mono font-bold">
                    <input
                      type="number"
                      min={0}
                      value={homeCorners}
                      onChange={(e) => setHomeCorners(Number(e.target.value))}
                      className="w-12 text-center py-0.5 border border-slate-300 rounded bg-white"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      min={0}
                      value={awayCorners}
                      onChange={(e) => setAwayCorners(Number(e.target.value))}
                      className="w-12 text-center py-0.5 border border-slate-300 rounded bg-white"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center">
                  <div className="text-[10px] text-slate-500">Pelanggaran (Fouls)</div>
                  <div className="flex items-center justify-center gap-2 mt-1 font-mono font-bold">
                    <input
                      type="number"
                      min={0}
                      value={homeFouls}
                      onChange={(e) => setHomeFouls(Number(e.target.value))}
                      className="w-12 text-center py-0.5 border border-slate-300 rounded bg-white"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      min={0}
                      value={awayFouls}
                      onChange={(e) => setAwayFouls(Number(e.target.value))}
                      className="w-12 text-center py-0.5 border border-slate-300 rounded bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 6. Match Commissioner Summary Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Ringkasan Jalannya Pertandingan & Catatan Pengawas (Match Report)</span>
            </label>
            <textarea
              rows={3}
              value={summaryNotes}
              onChange={(e) => setSummaryNotes(e.target.value)}
              placeholder="Catatan resmi wasit dan pengawas pertandingan, ringkasan dinamika babak pertama dan kedua..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 bg-white"
            />
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-700 hover:bg-slate-200 rounded-lg font-semibold transition-colors cursor-pointer"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            Simpan Match Summary
          </button>
        </div>
      </div>
    </div>
  );
};
