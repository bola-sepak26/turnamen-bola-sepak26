import React, { useState } from 'react';
import { Match, Team, TournamentConfig } from '../types/tournament';
import { formatDateIndo } from '../utils/formatters';
import { Printer, X, Calendar, Shield } from 'lucide-react';

interface MatchSchedulePrintModalProps {
  matches: Match[];
  teams: Team[];
  config: TournamentConfig;
  isOpen: boolean;
  onClose: () => void;
}

export const MatchSchedulePrintModal: React.FC<MatchSchedulePrintModalProps> = ({
  matches,
  teams,
  config,
  isOpen,
  onClose,
}) => {
  const [filterStage, setFilterStage] = useState<string>('all');

  if (!isOpen) return null;

  const teamMap = new Map<string, Team>(teams.map((t) => [t.id, t]));

  const filteredMatches = matches
    .filter((m) => filterStage === 'all' || m.stage === filterStage)
    .sort((a, b) => {
      // Sort by date, then time, then matchNumber
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      const timeCompare = a.time.localeCompare(b.time);
      if (timeCompare !== 0) return timeCompare;
      return a.matchNumber - b.matchNumber;
    });

  // Unique stages for filter
  const stages = Array.from(new Set(matches.map((m) => m.stage)));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Topbar */}
        <div className="px-6 py-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 no-print">
          <div>
            <h2 className="text-xs font-bold text-slate-800">
              Lembar Cetak Jadwal Resmi Turnamen
            </h2>
            <div className="text-[11px] text-slate-500">
              Format Dokumen Resmi Panitia Pelaksana Siap Cetak (A4)
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
              className="text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Babak ({matches.length})</option>
              {stages.map((stg) => (
                <option key={stg} value={stg}>{stg}</option>
              ))}
            </select>

            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Dokumen (A4)</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Document */}
        <div className="p-8 overflow-y-auto flex-1 text-slate-900 bg-white print:p-0">
          <div className="border border-slate-300 p-6 rounded text-xs space-y-4">
            {/* Kop Surat / Header */}
            <div className="text-center border-b-2 border-slate-900 pb-3">
              <div className="text-[10px] font-bold tracking-widest text-slate-600 uppercase">
                {config.organizer}
              </div>
              <h1 className="text-lg font-black uppercase tracking-tight font-display">
                {config.name} ({config.category})
              </h1>
              <div className="text-xs text-slate-600 mt-0.5">
                {config.tagline ? `${config.tagline} · ` : ''}{config.edition}
              </div>
              <div className="text-xs font-extrabold uppercase mt-2 tracking-wider bg-slate-100 py-1 inline-block px-4 rounded border border-slate-200">
                JADWAL & HASIL RESMI PERTANDINGAN (OFFICIAL MATCH FIXTURES)
              </div>
            </div>

            {/* Sub Info */}
            <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200">
              <div>
                <strong>Lokasi / Venue:</strong> {config.stadiumVenue} ({config.city})
              </div>
              <div>
                <strong>Periode Turnamen:</strong> {formatDateIndo(config.tournamentStartDate)} s/d {formatDateIndo(config.tournamentEndDate)}
              </div>
            </div>

            {/* Table of Matches */}
            <div className="border border-slate-200 rounded overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 font-bold border-b border-slate-300 text-slate-800">
                  <tr>
                    <th className="py-2 px-2 text-center border-r border-slate-200 w-10">No</th>
                    <th className="py-2 px-2 border-r border-slate-200 w-24">Babak</th>
                    <th className="py-2 px-3 border-r border-slate-200 w-28">Hari, Tanggal</th>
                    <th className="py-2 px-2 text-center border-r border-slate-200 w-16">Waktu</th>
                    <th className="py-2 px-3 border-r border-slate-200">Pertandingan (Home vs Away)</th>
                    <th className="py-2 px-2 text-center border-r border-slate-200 w-16">Skor</th>
                    <th className="py-2 px-3 border-r border-slate-200 w-36">Lapangan / Venue</th>
                    <th className="py-2 px-3 w-28">Wasit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredMatches.map((m, idx) => {
                    const home = teamMap.get(m.homeTeamId);
                    const away = teamMap.get(m.awayTeamId);

                    return (
                      <tr key={m.id} className={idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}>
                        <td className="py-2 px-2 text-center font-mono font-bold border-r border-slate-200">
                          #{m.matchNumber}
                        </td>
                        <td className="py-2 px-2 font-semibold text-slate-700 border-r border-slate-200">
                          {m.stage}
                        </td>
                        <td className="py-2 px-3 font-mono border-r border-slate-200 whitespace-nowrap">
                          {formatDateIndo(m.date)}
                        </td>
                        <td className="py-2 px-2 text-center font-mono font-bold border-r border-slate-200">
                          {m.time} WIB
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200">
                          <div className="font-bold flex items-center gap-1.5">
                            <span className="text-slate-900">{home?.name || 'TBD'}</span>
                            <span className="text-slate-400 font-normal text-[10px]">VS</span>
                            <span className="text-slate-900">{away?.name || 'TBD'}</span>
                          </div>
                          {m.notes && (
                            <div className="text-[10px] text-slate-500 italic mt-0.5 line-clamp-1">
                              {m.notes}
                            </div>
                          )}
                        </td>
                        <td className="py-2 px-2 text-center font-mono font-bold border-r border-slate-200">
                          {m.status === 'completed' && m.homeScore !== undefined && m.awayScore !== undefined ? (
                            <span className="text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded font-black">
                              {m.homeScore} - {m.awayScore}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">-</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-slate-700 border-r border-slate-200">
                          {m.venue}
                        </td>
                        <td className="py-2 px-3 text-slate-600">
                          {m.referee ? m.referee.split('(')[0].trim() : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Signatures and Stamp Block */}
            <div className="grid grid-cols-3 gap-6 pt-6 text-center text-xs">
              <div>
                <div className="font-bold text-slate-800 mb-12">
                  Koordinator Pertandingan / Match Commissioner
                </div>
                <div className="border-t border-slate-400 pt-1 font-semibold text-slate-900">
                  ( ...................................................... )
                </div>
                <div className="text-[10px] text-slate-500">Match Commissioner PSSI</div>
              </div>

              <div>
                <div className="font-bold text-slate-800 mb-12">
                  Koordinator Wasit & Perangkat
                </div>
                <div className="border-t border-slate-400 pt-1 font-semibold text-slate-900">
                  ( ...................................................... )
                </div>
                <div className="text-[10px] text-slate-500">Komite Wasit Wilayah</div>
              </div>

              <div>
                <div className="font-bold text-slate-800 mb-12">
                  Ketua Panitia Pelaksana
                </div>
                <div className="border-t border-slate-400 pt-1 font-semibold text-slate-900">
                  {config.contactPerson && !config.contactPerson.toLowerCase().includes('bambang') && config.contactPerson.trim() !== ''
                    ? config.contactPerson.split('(')[0].trim()
                    : '( ...................................................... )'}
                </div>
                <div className="text-[10px] text-slate-500">Panpel {config.name}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
