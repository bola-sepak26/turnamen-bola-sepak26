import React, { useState, useEffect } from 'react';
import { Match, Team, TournamentConfig, MatchStatus } from '../types/tournament';
import { X, Calendar, Clock, MapPin, Trophy, Shield, User } from 'lucide-react';

interface MatchEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveMatch: (match: Match) => void;
  match: Match | null;
  teams: Team[];
  config: TournamentConfig;
  nextMatchNumber: number;
}

export const MatchEditModal: React.FC<MatchEditModalProps> = ({
  isOpen,
  onClose,
  onSaveMatch,
  match,
  teams,
  config,
  nextMatchNumber,
}) => {
  const [matchNumber, setMatchNumber] = useState<number>(match ? match.matchNumber : nextMatchNumber);
  const [stage, setStage] = useState<string>(match ? match.stage : 'Grup A');
  const [matchday, setMatchday] = useState<number>(match?.matchday || 1);
  const [homeTeamId, setHomeTeamId] = useState<string>(match ? match.homeTeamId : (teams[0]?.id || ''));
  const [awayTeamId, setAwayTeamId] = useState<string>(match ? match.awayTeamId : (teams[1]?.id || ''));
  const [date, setDate] = useState<string>(match ? match.date : config.tournamentStartDate);
  const [time, setTime] = useState<string>(match ? match.time : '08:30');
  const [venue, setVenue] = useState<string>(match ? match.venue : config.stadiumVenue);
  const [referee, setReferee] = useState<string>(match?.referee || '');
  const [assistantReferee1, setAssistantReferee1] = useState<string>(match?.assistantReferee1 || '');
  const [assistantReferee2, setAssistantReferee2] = useState<string>(match?.assistantReferee2 || '');
  const [fourthOfficial, setFourthOfficial] = useState<string>(match?.fourthOfficial || '');
  const [status, setStatus] = useState<MatchStatus>(match ? match.status : 'upcoming');
  const [homeScore, setHomeScore] = useState<number | undefined>(match?.homeScore);
  const [awayScore, setAwayScore] = useState<number | undefined>(match?.awayScore);
  const [homePenaltyScore, setHomePenaltyScore] = useState<number | undefined>(match?.homePenaltyScore);
  const [awayPenaltyScore, setAwayPenaltyScore] = useState<number | undefined>(match?.awayPenaltyScore);
  const [notes, setNotes] = useState<string>(match?.notes || '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (match) {
      setMatchNumber(match.matchNumber);
      setStage(match.stage);
      setMatchday(match.matchday || 1);
      setHomeTeamId(match.homeTeamId);
      setAwayTeamId(match.awayTeamId);
      setDate(match.date);
      setTime(match.time);
      setVenue(match.venue);
      setReferee(match.referee || '');
      setAssistantReferee1(match.assistantReferee1 || '');
      setAssistantReferee2(match.assistantReferee2 || '');
      setFourthOfficial(match.fourthOfficial || '');
      setStatus(match.status);
      setHomeScore(match.homeScore);
      setAwayScore(match.awayScore);
      setHomePenaltyScore(match.homePenaltyScore);
      setAwayPenaltyScore(match.awayPenaltyScore);
      setNotes(match.notes || '');
    } else {
      setMatchNumber(nextMatchNumber);
      setStage('Grup A');
      setMatchday(1);
      setHomeTeamId(teams[0]?.id || '');
      setAwayTeamId(teams[1]?.id || '');
      setDate(config.tournamentStartDate);
      setTime('08:30');
      setVenue(config.stadiumVenue);
      setReferee('');
      setAssistantReferee1('');
      setAssistantReferee2('');
      setFourthOfficial('');
      setStatus('upcoming');
      setHomeScore(undefined);
      setAwayScore(undefined);
      setHomePenaltyScore(undefined);
      setAwayPenaltyScore(undefined);
      setNotes('');
    }
    setError(null);
  }, [match, nextMatchNumber, config, teams, isOpen]);

  if (!isOpen) return null;

  const homeTeam = teams.find((t) => t.id === homeTeamId);
  const awayTeam = teams.find((t) => t.id === awayTeamId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeTeamId || !awayTeamId) {
      setError('Pilih tim tuan rumah (Home) dan tim tamu (Away).');
      return;
    }
    if (homeTeamId === awayTeamId) {
      setError('Tim Home dan Away tidak boleh sama.');
      return;
    }
    if (!date) {
      setError('Tentukan tanggal pertandingan.');
      return;
    }
    if (!time) {
      setError('Tentukan waktu kick-off pertandingan.');
      return;
    }

    const payload: Match = {
      id: match ? match.id : `match-${Date.now()}`,
      matchNumber,
      stage,
      matchday: Number(matchday) || 1,
      homeTeamId,
      awayTeamId,
      date,
      time,
      venue: venue || config.stadiumVenue,
      referee: referee || undefined,
      assistantReferee1: assistantReferee1 || undefined,
      assistantReferee2: assistantReferee2 || undefined,
      fourthOfficial: fourthOfficial || undefined,
      status,
      homeScore: status === 'completed' && homeScore !== undefined ? Number(homeScore) : undefined,
      awayScore: status === 'completed' && awayScore !== undefined ? Number(awayScore) : undefined,
      homePenaltyScore: homePenaltyScore !== undefined ? Number(homePenaltyScore) : undefined,
      awayPenaltyScore: awayPenaltyScore !== undefined ? Number(awayPenaltyScore) : undefined,
      notes: notes.trim() || undefined,
    };

    onSaveMatch(payload);
    onClose();
  };

  const isKnockout = stage.includes('Final') || stage.includes('Juara') || stage.includes('Gugur');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-sm font-bold text-slate-900 font-display">
              {match ? `Edit Jadwal Pertandingan #${match.matchNumber}` : 'Tambah Jadwal Pertandingan Baru'}
            </h2>
            <p className="text-xs text-slate-500">
              {config.name} · {config.category}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg font-medium text-xs">
              {error}
            </div>
          )}

          {/* Stage & Match Number */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nomor Pertandingan
              </label>
              <input
                type="number"
                min={1}
                value={matchNumber}
                onChange={(e) => setMatchNumber(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Babak / Fase
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 bg-white cursor-pointer font-medium"
              >
                <option value="Grup A">Fase Grup - Grup A</option>
                <option value="Grup B">Fase Grup - Grup B</option>
                <option value="Grup C">Fase Grup - Grup C</option>
                <option value="Grup D">Fase Grup - Grup D</option>
                <option value="Grup E">Fase Grup - Grup E</option>
                <option value="Grup F">Fase Grup - Grup F</option>
                <option value="Perempat Final">Perempat Final (Quarter Final)</option>
                <option value="Semifinal">Semifinal</option>
                <option value="Perebutan Juara 3">Perebutan Juara 3</option>
                <option value="Final">Grand Final</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Matchday (Pekan Ke)
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={matchday}
                onChange={(e) => setMatchday(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 font-mono"
              />
            </div>
          </div>

          {/* Teams Selection Card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-600" />
              <span>Tim yang Bertanding (Head-to-Head)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Home Team */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700">
                  Tim Tuan Rumah (Home)
                </label>
                <select
                  value={homeTeamId}
                  onChange={(e) => setHomeTeamId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 bg-white font-medium cursor-pointer"
                  required
                >
                  <option value="" disabled>-- Pilih Tim Home --</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.code}) {t.assignedGroup ? `· ${t.assignedGroup}` : ''}
                    </option>
                  ))}
                </select>

                {homeTeam && (
                  <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200">
                    {homeTeam.logoUrl ? (
                      <img src={homeTeam.logoUrl} alt="" className="w-7 h-7 object-contain rounded" />
                    ) : (
                      <div
                        className="w-7 h-7 rounded flex items-center justify-center text-white font-bold text-[10px]"
                        style={{ backgroundColor: homeTeam.primaryJerseyColor }}
                      >
                        {homeTeam.code}
                      </div>
                    )}
                    <div className="truncate">
                      <div className="font-bold text-slate-900 truncate">{homeTeam.name}</div>
                      <div className="text-[10px] text-slate-500">{homeTeam.originCity}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Away Team */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700">
                  Tim Tamu (Away)
                </label>
                <select
                  value={awayTeamId}
                  onChange={(e) => setAwayTeamId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 bg-white font-medium cursor-pointer"
                  required
                >
                  <option value="" disabled>-- Pilih Tim Away --</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id} disabled={t.id === homeTeamId}>
                      {t.name} ({t.code}) {t.assignedGroup ? `· ${t.assignedGroup}` : ''}
                    </option>
                  ))}
                </select>

                {awayTeam && (
                  <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200">
                    {awayTeam.logoUrl ? (
                      <img src={awayTeam.logoUrl} alt="" className="w-7 h-7 object-contain rounded" />
                    ) : (
                      <div
                        className="w-7 h-7 rounded flex items-center justify-center text-white font-bold text-[10px]"
                        style={{ backgroundColor: awayTeam.primaryJerseyColor }}
                      >
                        {awayTeam.code}
                      </div>
                    )}
                    <div className="truncate">
                      <div className="font-bold text-slate-900 truncate">{awayTeam.name}</div>
                      <div className="text-[10px] text-slate-500">{awayTeam.originCity}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Date, Time & Venue */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tanggal Pertandingan
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 font-mono"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Waktu Kick-off (WIB)
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="08:30"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 font-mono"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Lapangan / Venue
              </label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="Stadion Madya / Lapangan 1"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                required
              />
            </div>
          </div>

          {/* Match Officials / Referees */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="font-semibold text-slate-800 text-xs">
              Perangkat Pertandingan (Wasit & Asisten)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-600 mb-0.5">Wasit Utama</label>
                <input
                  type="text"
                  value={referee}
                  onChange={(e) => setReferee(e.target.value)}
                  placeholder="Contoh: Thoriq Alkatiri (FIFA)"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md focus:outline-none text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 mb-0.5">Cadangan / Wasit Keempat</label>
                <input
                  type="text"
                  value={fourthOfficial}
                  onChange={(e) => setFourthOfficial(e.target.value)}
                  placeholder="Contoh: Yudi Nurcahya"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md focus:outline-none text-xs"
                />
              </div>
            </div>
          </div>

          {/* Status & Scores */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800">
                Status Pertandingan
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as MatchStatus)}
                className="px-3 py-1 bg-white border border-slate-300 rounded-lg font-semibold text-xs focus:outline-none cursor-pointer"
              >
                <option value="upcoming">Akan Datang (Upcoming)</option>
                <option value="live">Sedang Berlangsung (Live)</option>
                <option value="completed">Selesai (Completed)</option>
                <option value="postponed">Ditunda (Postponed)</option>
              </select>
            </div>

            {/* Score inputs if completed or live */}
            {(status === 'completed' || status === 'live') && (
              <div className="pt-2 border-t border-slate-200 space-y-3">
                <div className="text-xs font-semibold text-slate-700">
                  Skor Akhir Pertandingan:
                </div>
                <div className="flex items-center justify-center gap-4 bg-white p-3 rounded-lg border border-slate-200">
                  <div className="text-center">
                    <div className="text-[11px] font-bold text-slate-700 truncate max-w-[120px] mb-1">
                      {homeTeam?.code || 'HOME'}
                    </div>
                    <input
                      type="number"
                      min={0}
                      max={99}
                      value={homeScore ?? ''}
                      onChange={(e) => setHomeScore(e.target.value === '' ? undefined : Number(e.target.value))}
                      className="w-16 h-12 text-center text-xl font-mono font-black border-2 border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                      placeholder="0"
                    />
                  </div>

                  <span className="text-xl font-black text-slate-400 mt-4">-</span>

                  <div className="text-center">
                    <div className="text-[11px] font-bold text-slate-700 truncate max-w-[120px] mb-1">
                      {awayTeam?.code || 'AWAY'}
                    </div>
                    <input
                      type="number"
                      min={0}
                      max={99}
                      value={awayScore ?? ''}
                      onChange={(e) => setAwayScore(e.target.value === '' ? undefined : Number(e.target.value))}
                      className="w-16 h-12 text-center text-xl font-mono font-black border-2 border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                      placeholder="0"
                    />
                  </div>
                </div>

                {isKnockout && (
                  <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="text-[11px] font-semibold text-amber-900 mb-1.5">
                      Adu Penalti (Opsional jika skor imbang di babak gugur):
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-amber-800 font-bold">{homeTeam?.code}:</span>
                        <input
                          type="number"
                          min={0}
                          value={homePenaltyScore ?? ''}
                          onChange={(e) => setHomePenaltyScore(e.target.value === '' ? undefined : Number(e.target.value))}
                          className="w-12 py-1 text-center font-mono text-xs border border-amber-300 rounded bg-white"
                          placeholder="Pen"
                        />
                      </div>
                      <span className="text-amber-500">-</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-amber-800 font-bold">{awayTeam?.code}:</span>
                        <input
                          type="number"
                          min={0}
                          value={awayPenaltyScore ?? ''}
                          onChange={(e) => setAwayPenaltyScore(e.target.value === '' ? undefined : Number(e.target.value))}
                          className="w-12 py-1 text-center font-mono text-xs border border-amber-300 rounded bg-white"
                          placeholder="Pen"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notes / Pencetak Gol */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Catatan Pertandingan / Pencetak Gol / Kartu
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Gol Fatih 24' (pen), Kartu Kuning Bagas 45'. Cuaca cerah."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 text-xs"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              {match ? 'Simpan Perubahan Jadwal' : 'Simpan Jadwal Pertandingan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
