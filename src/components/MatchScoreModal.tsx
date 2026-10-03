import React, { useState, useEffect } from 'react';
import { Match, Team } from '../types/tournament';
import { X, Trophy } from 'lucide-react';

interface MatchScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveScore: (matchId: string, homeScore: number, awayScore: number, status: Match['status'], notes?: string, homePen?: number, awayPen?: number) => void;
  match: Match | null;
  homeTeam?: Team;
  awayTeam?: Team;
}

export const MatchScoreModal: React.FC<MatchScoreModalProps> = ({
  isOpen,
  onClose,
  onSaveScore,
  match,
  homeTeam,
  awayTeam,
}) => {
  const [homeScore, setHomeScore] = useState<number>(match?.homeScore ?? 0);
  const [awayScore, setAwayScore] = useState<number>(match?.awayScore ?? 0);
  const [status, setStatus] = useState<Match['status']>(match?.status === 'upcoming' ? 'completed' : (match?.status || 'upcoming'));
  const [homePen, setHomePen] = useState<number | undefined>(match?.homePenaltyScore);
  const [awayPen, setAwayPen] = useState<number | undefined>(match?.awayPenaltyScore);
  const [notes, setNotes] = useState<string>(match?.notes || '');

  useEffect(() => {
    if (match) {
      setHomeScore(match.homeScore ?? 0);
      setAwayScore(match.awayScore ?? 0);
      setStatus(match.status === 'upcoming' ? 'completed' : match.status);
      setHomePen(match.homePenaltyScore);
      setAwayPen(match.awayPenaltyScore);
      setNotes(match.notes || '');
    }
  }, [match]);

  if (!isOpen || !match) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveScore(match.id, Number(homeScore), Number(awayScore), status, notes.trim() || undefined, homePen, awayPen);
    onClose();
  };

  const isKnockout = match.stage.includes('Final') || match.stage.includes('Juara');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-sm font-bold text-slate-900 font-display">
              Input Skor & Hasil Pertandingan
            </h2>
            <div className="text-[11px] text-slate-500">
              Laga #{match.matchNumber} · {match.stage}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Teams and Score Entry */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-around gap-2">
            {/* Home */}
            <div className="flex flex-col items-center text-center w-28">
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 p-1 shadow-2xs flex items-center justify-center mb-1.5 overflow-hidden">
                {homeTeam?.logoUrl ? (
                  <img src={homeTeam.logoUrl} alt="" className="w-full h-full object-contain" />
                ) : (
                  <span className="font-bold text-xs" style={{ color: homeTeam?.primaryJerseyColor || '#000' }}>
                    {homeTeam?.code || 'HOM'}
                  </span>
                )}
              </div>
              <span className="font-bold text-slate-900 text-xs truncate w-full">
                {homeTeam?.name || 'Home'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Tuan Rumah</span>

              <input
                type="number"
                min={0}
                max={99}
                value={homeScore}
                onChange={(e) => setHomeScore(Math.max(0, Number(e.target.value)))}
                className="w-16 h-12 mt-2 text-center text-2xl font-mono font-black border-2 border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 bg-white"
                required
              />
            </div>

            <div className="text-xl font-black text-slate-400 mb-2">:</div>

            {/* Away */}
            <div className="flex flex-col items-center text-center w-28">
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 p-1 shadow-2xs flex items-center justify-center mb-1.5 overflow-hidden">
                {awayTeam?.logoUrl ? (
                  <img src={awayTeam.logoUrl} alt="" className="w-full h-full object-contain" />
                ) : (
                  <span className="font-bold text-xs" style={{ color: awayTeam?.primaryJerseyColor || '#000' }}>
                    {awayTeam?.code || 'AWY'}
                  </span>
                )}
              </div>
              <span className="font-bold text-slate-900 text-xs truncate w-full">
                {awayTeam?.name || 'Away'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Tim Tamu</span>

              <input
                type="number"
                min={0}
                max={99}
                value={awayScore}
                onChange={(e) => setAwayScore(Math.max(0, Number(e.target.value)))}
                className="w-16 h-12 mt-2 text-center text-2xl font-mono font-black border-2 border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 bg-white"
                required
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Status Pertandingan
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Match['status'])}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 bg-white font-medium cursor-pointer"
            >
              <option value="completed">Selesai Penuh (Full Time)</option>
              <option value="live">Sedang Berlangsung (Live)</option>
              <option value="upcoming">Akan Datang (Reset Skor)</option>
              <option value="postponed">Ditunda (Postponed)</option>
            </select>
          </div>

          {/* Penalty Shootout if tie & knockout */}
          {isKnockout && homeScore === awayScore && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-1.5">
              <div className="font-semibold text-amber-900 text-[11px]">
                Skor Imbang di Babak Gugur — Hasil Adu Penalti:
              </div>
              <div className="flex items-center justify-center gap-3">
                <input
                  type="number"
                  min={0}
                  value={homePen ?? ''}
                  onChange={(e) => setHomePen(e.target.value === '' ? undefined : Number(e.target.value))}
                  placeholder={`${homeTeam?.code || 'H'} Pen`}
                  className="w-20 py-1.5 px-2 text-center text-xs font-mono font-bold bg-white border border-amber-300 rounded"
                />
                <span className="font-bold text-amber-600">-</span>
                <input
                  type="number"
                  min={0}
                  value={awayPen ?? ''}
                  onChange={(e) => setAwayPen(e.target.value === '' ? undefined : Number(e.target.value))}
                  placeholder={`${awayTeam?.code || 'A'} Pen`}
                  className="w-20 py-1.5 px-2 text-center text-xs font-mono font-bold bg-white border border-amber-300 rounded"
                />
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Catatan Gol / Kartu / Keterangan Pertandingan
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Gol Fatih 24', Bagas 67'. Kartu Merah: Persikota 85'."
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 text-xs"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              Simpan Skor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
