import React, { useState } from 'react';
import { Team, TournamentConfig } from '../types/tournament';
import { calculateAge } from '../utils/formatters';
import { Printer, X, Shield, User, Award } from 'lucide-react';

interface IdCardPrintModalProps {
  team: Team | null;
  config: TournamentConfig;
  isOpen: boolean;
  onClose: () => void;
}

export const IdCardPrintModal: React.FC<IdCardPrintModalProps> = ({
  team,
  config,
  isOpen,
  onClose,
}) => {
  const [cardTarget, setCardTarget] = useState<'all' | 'players' | 'officials'>('all');

  if (!isOpen || !team) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Control Bar (Hidden on print) */}
        <div className="px-6 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50 no-print">
          <div>
            <h2 className="text-xs font-bold text-slate-800">
              ID Card Akreditasi Resmi: {team.name}
            </h2>
            <div className="text-[11px] text-slate-500">
              Format Kartu Lanyard Siap Cetak (A4 Layout)
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-200 p-0.5 rounded-lg text-xs">
              <button
                onClick={() => setCardTarget('all')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  cardTarget === 'all' ? 'bg-white font-bold text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Semua ({team.players.length + team.officials.length})
              </button>
              <button
                onClick={() => setCardTarget('players')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  cardTarget === 'players' ? 'bg-white font-bold text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Pemain Saja ({team.players.length})
              </button>
              <button
                onClick={() => setCardTarget('officials')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  cardTarget === 'officials' ? 'bg-white font-bold text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Official ({team.officials.length})
              </button>
            </div>

            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Kartu (Print)</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Card Sheet Grid */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-100 print:bg-white print:p-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 print:grid-cols-3 print:gap-4 max-w-5xl mx-auto">
            {/* Player Cards */}
            {(cardTarget === 'all' || cardTarget === 'players') &&
              team.players.map((player) => {
                const age = calculateAge(player.birthDate, config.tournamentStartDate);

                return (
                  <div
                    key={player.id}
                    className="w-full bg-white rounded-xl border-2 border-dashed border-slate-300 p-1 print:border-slate-400 break-inside-avoid shadow-xs"
                  >
                    {/* Inner Card Container */}
                    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white flex flex-col justify-between h-[360px] text-center relative">
                      {/* Lanyard punch hole guide */}
                      <div className="w-6 h-2 mx-auto mt-2 bg-slate-200 rounded-full border border-slate-300" />

                      {/* Header */}
                      <div className="bg-slate-900 text-white px-3 py-2 mt-1">
                        <div className="text-[9px] font-bold tracking-widest text-emerald-400 uppercase">
                          {config.category} · {config.edition}
                        </div>
                        <div className="text-xs font-black uppercase tracking-tight truncate font-display">
                          {config.name}
                        </div>
                      </div>

                      {/* Role & Number Banner */}
                      <div className="flex items-center justify-between px-3 py-1 bg-emerald-50 border-b border-emerald-100">
                        <span className="text-[10px] font-bold text-emerald-900 uppercase">
                          PEMAIN / ATLET
                        </span>
                        <span className="text-sm font-black font-mono text-emerald-700">
                          #{player.number}
                        </span>
                      </div>

                      {/* Photo / Silhouette Area */}
                      <div className="py-2 px-4 flex flex-col items-center">
                        <div className="w-20 h-24 rounded-lg bg-slate-100 border-2 border-slate-300 flex items-center justify-center relative overflow-hidden mb-2 shadow-2xs">
                          {player.photoUrl ? (
                            <img
                              src={player.photoUrl}
                              alt={player.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-slate-400 flex flex-col items-center">
                              <User className="w-10 h-10 text-slate-300" />
                              <span className="text-[8px] font-mono text-slate-400 mt-0.5">PAS FOTO</span>
                            </div>
                          )}
                          <div
                            className="absolute bottom-0 inset-x-0 text-[9px] font-bold text-white text-center py-0.5"
                            style={{ backgroundColor: team.primaryJerseyColor }}
                          >
                            {player.position}
                          </div>
                        </div>

                        {/* Player name & details */}
                        <div className="font-extrabold text-xs text-slate-900 leading-tight uppercase line-clamp-2 max-w-[200px]">
                          {player.name}
                        </div>
                        <div className="flex items-center justify-center gap-1.5 mt-0.5 max-w-[200px] truncate">
                          {team.logoUrl && (
                            <img src={team.logoUrl} alt="" className="w-3.5 h-3.5 object-contain shrink-0" />
                          )}
                          <span className="text-[11px] font-bold text-slate-700 truncate">{team.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Usia: {age} Thn · {team.originCity}
                        </div>
                      </div>

                      {/* Card Footer Barcode & Stempel */}
                      <div className="bg-slate-50 border-t border-slate-200 px-3 py-1.5 flex items-center justify-between text-left">
                        <div>
                          <div className="text-[7px] text-slate-400 uppercase font-mono">AKREDITASI ID</div>
                          <div className="text-[8px] font-mono font-bold text-slate-800">
                            {team.code}-{player.number}-{player.id.slice(-4)}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[8px] font-extrabold text-emerald-800 border border-emerald-600 px-1 py-0.5 rounded uppercase">
                            SAH PANPEL
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

            {/* Official Staff Cards */}
            {(cardTarget === 'all' || cardTarget === 'officials') &&
              team.officials.map((official) => (
                <div
                  key={official.id}
                  className="w-full bg-white rounded-xl border-2 border-dashed border-slate-300 p-1 print:border-slate-400 break-inside-avoid shadow-xs"
                >
                  <div className="border border-slate-200 rounded-lg overflow-hidden bg-white flex flex-col justify-between h-[360px] text-center relative">
                    {/* Lanyard punch hole guide */}
                    <div className="w-6 h-2 mx-auto mt-2 bg-slate-200 rounded-full border border-slate-300" />

                    {/* Header */}
                    <div className="bg-slate-900 text-white px-3 py-2 mt-1">
                      <div className="text-[9px] font-bold tracking-widest text-amber-400 uppercase">
                        OFFICIAL TEAM · {config.edition}
                      </div>
                      <div className="text-xs font-black uppercase tracking-tight truncate font-display">
                        {config.name}
                      </div>
                    </div>

                    {/* Role Banner */}
                    <div className="px-3 py-1 bg-amber-50 border-b border-amber-100 text-center">
                      <span className="text-[11px] font-extrabold text-amber-900 uppercase">
                        {official.role}
                      </span>
                    </div>

                    {/* Photo / Avatar */}
                    <div className="py-2 px-4 flex flex-col items-center">
                      <div className="w-20 h-24 rounded-lg bg-slate-100 border-2 border-slate-300 flex items-center justify-center relative overflow-hidden mb-2 shadow-2xs">
                        <User className="w-10 h-10 text-slate-300" />
                        <div className="absolute bottom-0 inset-x-0 text-[8px] font-bold bg-amber-600 text-white text-center py-0.5">
                          OFFICIAL
                        </div>
                      </div>

                      <div className="font-extrabold text-xs text-slate-900 uppercase line-clamp-2 max-w-[200px]">
                        {official.name}
                      </div>
                      <div className="flex items-center justify-center gap-1.5 mt-0.5 max-w-[200px] truncate">
                        {team.logoUrl && (
                          <img src={team.logoUrl} alt="" className="w-3.5 h-3.5 object-contain shrink-0" />
                        )}
                        <span className="text-[11px] font-bold text-slate-700 truncate">{team.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Official Tim
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-slate-50 border-t border-slate-200 px-3 py-1.5 flex items-center justify-between text-left">
                      <div>
                        <div className="text-[7px] text-slate-400 uppercase font-mono">OFFICIAL ID</div>
                        <div className="text-[8px] font-mono font-bold text-slate-800">
                          {team.code}-OFF-{official.id.slice(-4)}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] font-extrabold text-amber-800 border border-amber-600 px-1 py-0.5 rounded uppercase">
                          AKREDITASI
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
