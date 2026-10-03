import React from 'react';
import { Match, Team, TournamentConfig } from '../types/tournament';
import { formatDateIndo } from '../utils/formatters';
import { Printer, X, Trophy, CheckCircle2 } from 'lucide-react';

interface MatchSummaryPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: Match | null;
  homeTeam?: Team;
  awayTeam?: Team;
  config: TournamentConfig;
}

export const MatchSummaryPrintModal: React.FC<MatchSummaryPrintModalProps> = ({
  isOpen,
  onClose,
  match,
  homeTeam,
  awayTeam,
  config,
}) => {
  if (!isOpen || !match) return null;

  const handlePrint = () => {
    window.print();
  };

  const isKnockout = match.stage.includes('Final') || match.stage.includes('Juara');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh]">
        {/* Action Header - Hidden during print */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between no-print shrink-0">
          <div>
            <h2 className="text-sm font-bold text-slate-900 font-display">
              Pratinjau Lembar Berita Acara & Match Summary Resmi
            </h2>
            <div className="text-[11px] text-slate-500">
              Laga #{match.matchNumber} · {match.stage} · {homeTeam?.name || 'Home'} vs {awayTeam?.name || 'Away'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 text-xs shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-100 flex justify-center">
          <div className="w-full max-w-[210mm] bg-white border border-slate-300 p-8 shadow-md text-slate-900 text-xs print:m-0 print:p-0 print:border-none print:shadow-none font-sans">
            {/* Kop Surat / Official Header */}
            <div className="border-b-2 border-slate-900 pb-4 mb-4 text-center">
              <div className="text-[11px] uppercase tracking-wider font-extrabold text-slate-600">
                {config.organizer}
              </div>
              <h1 className="text-xl font-black uppercase tracking-tight text-slate-950 mt-0.5">
                {config.name} — {config.edition}
              </h1>
              <div className="text-xs font-semibold text-slate-700 mt-0.5">
                Kategori: {config.category} · Musim Turnamen {new Date().getFullYear()}
              </div>
              <div className="mt-2 inline-block px-4 py-1 bg-slate-950 text-white text-xs font-extrabold tracking-wider uppercase rounded-xs">
                OFFICIAL MATCH SUMMARY REPORT / BERITA ACARA PERTANDINGAN
              </div>
            </div>

            {/* Match Information Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 border border-slate-300 p-3 rounded-md mb-4 text-[11px]">
              <div>
                <span className="text-slate-500 block">Nomor Pertandingan:</span>
                <span className="font-bold text-slate-900 font-mono">MATCH #{match.matchNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Babak / Fase:</span>
                <span className="font-bold text-slate-900">{match.stage}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Waktu & Tanggal:</span>
                <span className="font-bold text-slate-900">
                  {formatDateIndo(match.date)} · {match.time} WIB
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Tempat / Lapangan:</span>
                <span className="font-bold text-slate-900">{match.venue}</span>
              </div>
            </div>

            {/* Official Scoreboard */}
            <div className="border-2 border-slate-900 rounded-lg p-5 mb-5 bg-slate-50/50">
              <div className="flex items-center justify-between">
                {/* Home */}
                <div className="w-5/12 text-center">
                  <div className="font-black text-lg text-slate-950">{homeTeam?.name || 'HOME'}</div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    Asal: {homeTeam?.originCity || '-'} ({homeTeam?.code})
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1 flex items-center justify-center gap-1.5">
                    <span>Jersey:</span>
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-400 inline-block shadow-2xs" style={{ backgroundColor: homeTeam?.primaryJerseyColor }} />
                  </div>
                </div>

                {/* Score */}
                <div className="w-2/12 text-center">
                  <div className="text-3xl font-black font-mono tracking-wider text-slate-950">
                    {match.status === 'upcoming' ? 'VS' : `${match.homeScore ?? 0} - ${match.awayScore ?? 0}`}
                  </div>
                  {match.status !== 'upcoming' && (
                    <div className="text-[11px] font-bold text-slate-600 mt-1 font-mono">
                      (HT: {match.halfTimeScore?.home ?? 0} - {match.halfTimeScore?.away ?? 0})
                    </div>
                  )}
                  {isKnockout && match.homePenaltyScore !== undefined && match.awayPenaltyScore !== undefined && (
                    <div className="text-[10px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded mt-1 font-mono">
                      Pen: {match.homePenaltyScore} - {match.awayPenaltyScore}
                    </div>
                  )}
                  <div className="text-[10px] uppercase font-bold text-slate-400 mt-1 tracking-wider">
                    {match.status === 'completed'
                      ? 'Full Time'
                      : match.status === 'live'
                      ? 'Live Laga'
                      : match.status === 'postponed'
                      ? 'Ditunda'
                      : 'Terjadwal'}
                  </div>
                </div>

                {/* Away */}
                <div className="w-5/12 text-center">
                  <div className="font-black text-lg text-slate-950">{awayTeam?.name || 'AWAY'}</div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    Asal: {awayTeam?.originCity || '-'} ({awayTeam?.code})
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1 flex items-center justify-center gap-1.5">
                    <span>Jersey:</span>
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-400 inline-block shadow-2xs" style={{ backgroundColor: awayTeam?.primaryJerseyColor }} />
                  </div>
                </div>
              </div>

              {/* Man of the Match */}
              {match.manOfTheMatch && (
                <div className="mt-4 pt-3 border-t border-slate-300 text-center">
                  <span className="text-xs font-semibold text-slate-500">⭐ Man of the Match (Bintang Lapangan): </span>
                  <span className="font-bold text-slate-950 text-xs">{match.manOfTheMatch}</span>
                </div>
              )}
            </div>

            {/* Goals & Scorers Table */}
            <div className="mb-5">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
                I. Rekapitulasi Gol Pertandingan
              </h3>
              {match.goals && match.goals.length > 0 ? (
                <table className="w-full text-left border-collapse border border-slate-300 text-[11px]">
                  <thead>
                    <tr className="bg-slate-100 font-bold text-slate-700">
                      <th className="border border-slate-300 py-1.5 px-2 text-center w-12">Menit</th>
                      <th className="border border-slate-300 py-1.5 px-3">Nama Pencetak Gol</th>
                      <th className="border border-slate-300 py-1.5 px-3">Klub / Tim</th>
                      <th className="border border-slate-300 py-1.5 px-3">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {match.goals.map((g, idx) => (
                      <tr key={idx} className="border-b border-slate-200">
                        <td className="border border-slate-300 py-1 px-2 text-center font-mono font-bold">
                          {g.minute}'
                        </td>
                        <td className="border border-slate-300 py-1 px-3 font-semibold text-slate-900">
                          {g.playerName}
                        </td>
                        <td className="border border-slate-300 py-1 px-3">
                          {g.teamId === match.homeTeamId ? homeTeam?.name : awayTeam?.name}
                        </td>
                        <td className="border border-slate-300 py-1 px-3 font-mono text-[10px]">
                          {g.isPenalty ? 'Tendangan Penalti' : g.isOwnGoal ? 'Gol Bunuh Diri' : 'Open Play'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-slate-500 italic text-[11px] p-2 bg-slate-50 border border-slate-200 rounded">
                  Tidak ada gol tercatat / Laga berakhir tanpa gol (0 - 0) atau belum dimulai.
                </div>
              )}
            </div>

            {/* Disciplinary Records (Cards) */}
            <div className="mb-5">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
                II. Rekapitulasi Kartu Disiplin & Pelanggaran
              </h3>
              {match.cards && match.cards.length > 0 ? (
                <table className="w-full text-left border-collapse border border-slate-300 text-[11px]">
                  <thead>
                    <tr className="bg-slate-100 font-bold text-slate-700">
                      <th className="border border-slate-300 py-1.5 px-2 text-center w-12">Menit</th>
                      <th className="border border-slate-300 py-1.5 px-2 text-center w-16">Kartu</th>
                      <th className="border border-slate-300 py-1.5 px-3">Pemain</th>
                      <th className="border border-slate-300 py-1.5 px-3">Klub / Tim</th>
                      <th className="border border-slate-300 py-1.5 px-3">Alasan / Catatan Disiplin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {match.cards.map((c, idx) => (
                      <tr key={idx} className="border-b border-slate-200">
                        <td className="border border-slate-300 py-1 px-2 text-center font-mono font-bold">
                          {c.minute}'
                        </td>
                        <td className="border border-slate-300 py-1 px-2 text-center font-bold">
                          {c.type === 'yellow' ? '🟨 Kuning' : '🟥 Merah'}
                        </td>
                        <td className="border border-slate-300 py-1 px-3 font-semibold text-slate-900">
                          {c.playerName}
                        </td>
                        <td className="border border-slate-300 py-1 px-3">
                          {c.teamId === match.homeTeamId ? homeTeam?.name : awayTeam?.name}
                        </td>
                        <td className="border border-slate-300 py-1 px-3 text-[10px] text-slate-600">
                          {c.reason || 'Pelanggaran Disiplin'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-slate-500 italic text-[11px] p-2 bg-slate-50 border border-slate-200 rounded">
                  Tidak ada kartu kuning atau kartu merah yang dikeluarkan wasit.
                </div>
              )}
            </div>

            {/* Match Statistics Table */}
            {match.matchStats && (
              <div className="mb-5">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
                  III. Statistik Pertandingan
                </h3>
                <table className="w-full text-center border-collapse border border-slate-300 text-[11px]">
                  <thead>
                    <tr className="bg-slate-100 font-bold text-slate-700">
                      <th className="border border-slate-300 py-1 px-3 w-4/12 text-left">{homeTeam?.name || 'Home'}</th>
                      <th className="border border-slate-300 py-1 px-3 w-4/12">Parameter Statistik</th>
                      <th className="border border-slate-300 py-1 px-3 w-4/12 text-right">{awayTeam?.name || 'Away'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-slate-300 py-1 px-3 text-left font-bold">{match.matchStats.homePossession ?? 50}%</td>
                      <td className="border border-slate-300 py-1 px-3 font-medium">Penguasaan Bola</td>
                      <td className="border border-slate-300 py-1 px-3 text-right font-bold">{match.matchStats.awayPossession ?? 50}%</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 py-1 px-3 text-left font-bold">{match.matchStats.homeShots ?? 0}</td>
                      <td className="border border-slate-300 py-1 px-3 font-medium">Total Tembakan</td>
                      <td className="border border-slate-300 py-1 px-3 text-right font-bold">{match.matchStats.awayShots ?? 0}</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 py-1 px-3 text-left font-bold">{match.matchStats.homeShotsOnTarget ?? 0}</td>
                      <td className="border border-slate-300 py-1 px-3 font-medium">Tembakan Tepat Sasaran</td>
                      <td className="border border-slate-300 py-1 px-3 text-right font-bold">{match.matchStats.awayShotsOnTarget ?? 0}</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 py-1 px-3 text-left font-bold">{match.matchStats.homeCorners ?? 0}</td>
                      <td className="border border-slate-300 py-1 px-3 font-medium">Tendangan Sudut</td>
                      <td className="border border-slate-300 py-1 px-3 text-right font-bold">{match.matchStats.awayCorners ?? 0}</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 py-1 px-3 text-left font-bold">{match.matchStats.homeFouls ?? 0}</td>
                      <td className="border border-slate-300 py-1 px-3 font-medium">Pelanggaran (Fouls)</td>
                      <td className="border border-slate-300 py-1 px-3 text-right font-bold">{match.matchStats.awayFouls ?? 0}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Official Report Notes */}
            <div className="mb-8">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
                IV. Catatan Khusus Wasit & Pengawas Pertandingan
              </h3>
              <div className="p-3 border border-slate-300 rounded bg-slate-50 text-[11px] text-slate-700 min-h-[48px]">
                {match.summaryNotes || match.notes || 'Pertandingan berjalan kondusif, tertib, dan sesuai dengan Kode Disiplin dan Regulasi Turnamen.'}
              </div>
            </div>

            {/* Signatures Block */}
            <div className="grid grid-cols-3 gap-6 pt-4 border-t border-slate-300 text-center text-[10px]">
              <div>
                <span className="text-slate-500 block mb-1">Manajer / Kapten Tim A:</span>
                <div className="h-14 flex items-end justify-center font-bold text-slate-900 border-b border-dashed border-slate-400 pb-1">
                  ({homeTeam?.managerName || '.....................................'})
                </div>
                <span className="text-[9px] text-slate-400 block mt-1">{homeTeam?.name}</span>
              </div>

              <div>
                <span className="text-slate-500 block mb-1">Wasit Utama (Referee):</span>
                <div className="h-14 flex items-end justify-center font-bold text-slate-900 border-b border-dashed border-slate-400 pb-1">
                  ({match.referee || '.....................................'})
                </div>
                <span className="text-[9px] text-slate-400 block mt-1">Perangkat Wasit Pertandingan</span>
              </div>

              <div>
                <span className="text-slate-500 block mb-1">Manajer / Kapten Tim B:</span>
                <div className="h-14 flex items-end justify-center font-bold text-slate-900 border-b border-dashed border-slate-400 pb-1">
                  ({awayTeam?.managerName || '.....................................'})
                </div>
                <span className="text-[9px] text-slate-400 block mt-1">{awayTeam?.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
