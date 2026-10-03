import React, { useState } from 'react';
import { Team, TournamentConfig } from '../types/tournament';
import { formatDateIndo } from '../utils/formatters';
import { Printer, X } from 'lucide-react';

interface MatchSheetPrintModalProps {
  team: Team | null;
  config: TournamentConfig;
  isOpen: boolean;
  onClose: () => void;
}

export const MatchSheetPrintModal: React.FC<MatchSheetPrintModalProps> = ({
  team,
  config,
  isOpen,
  onClose,
}) => {
  const [opponentName, setOpponentName] = useState('..........................................');
  const [matchDate, setMatchDate] = useState(config.tournamentStartDate);
  const [matchTime, setMatchTime] = useState('08:30 WIB');
  const [pitchName, setPitchName] = useState(config.stadiumVenue);

  if (!isOpen || !team) return null;

  // Split into starting 11 and substitutes
  const startingXI = team.players.slice(0, 11);
  const substitutes = team.players.slice(11);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Topbar */}
        <div className="px-6 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50 no-print">
          <div>
            <h2 className="text-xs font-bold text-slate-800">
              Formulir Resmi Daftar Susunan Pemain (DSP Match Sheet)
            </h2>
            <div className="text-[11px] text-slate-500">
              Format Standar Match Commissioner Siap Cetak (A4)
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Formulir DSP (A4)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Match Sheet Document */}
        <div className="p-8 overflow-y-auto flex-1 text-slate-900 bg-white print:p-0">
          <div className="border border-slate-400 p-6 rounded text-xs space-y-4">
            {/* Header */}
            <div className="text-center border-b-2 border-slate-900 pb-3">
              <div className="text-[10px] font-bold tracking-widest text-slate-600 uppercase">
                {config.organizer}
              </div>
              <h1 className="text-base sm:text-lg font-black uppercase tracking-tight font-display">
                {config.name} ({config.category})
              </h1>
              <div className="text-xs font-extrabold uppercase mt-0.5 tracking-wider bg-slate-100 py-0.5 inline-block px-3 rounded">
                FORMULIR DAFTAR SUSUNAN PEMAIN (DSP)
              </div>
            </div>

            {/* Match Info Grid */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded border border-slate-200 text-xs">
              <div className="space-y-1">
                <div>
                  <span className="font-semibold text-slate-600">Kesebelasan / Tim:</span>{' '}
                  <strong className="text-slate-900 font-bold uppercase">{team.name}</strong> ({team.code})
                </div>
                <div>
                  <span className="font-semibold text-slate-600">Lawan Tanding:</span>{' '}
                  <span className="text-slate-900">{opponentName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-600">Kostum (Jersey):</span>{' '}
                  <div className="inline-flex items-center gap-1.5">
                    <span className="text-slate-800">Home</span>
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-400 inline-block" style={{ backgroundColor: team.primaryJerseyColor }} />
                    <span className="text-slate-400">/</span>
                    <span className="text-slate-800">Away</span>
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-400 inline-block" style={{ backgroundColor: team.secondaryJerseyColor }} />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <div>
                  <span className="font-semibold text-slate-600">Hari / Tanggal:</span>{' '}
                  <span>{formatDateIndo(matchDate)}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-600">Waktu Kick-off:</span>{' '}
                  <span>{matchTime}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-600">Tempat / Stadion:</span>{' '}
                  <span>{pitchName}</span>
                </div>
              </div>
            </div>

            {/* 11 Starting Lineup Table */}
            <div>
              <div className="font-extrabold text-xs text-slate-900 mb-1 uppercase tracking-wide">
                A. SUSUNAN 11 PEMAIN UTAMA (STARTING XI)
              </div>
              <table className="w-full border-collapse border border-slate-300 text-[11px]">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="border border-slate-300 py-1 px-2 text-center w-8">No</th>
                    <th className="border border-slate-300 py-1 px-2 text-center w-12">No. Punggung</th>
                    <th className="border border-slate-300 py-1 px-3 text-left">Nama Lengkap Pemain</th>
                    <th className="border border-slate-300 py-1 px-2 text-center w-16">Posisi</th>
                    <th className="border border-slate-300 py-1 px-3 text-left w-36">Tgl Lahir / Usia</th>
                    <th className="border border-slate-300 py-1 px-3 text-center w-24">Tanda Tangan</th>
                  </tr>
                </thead>
                <tbody>
                  {startingXI.map((p, idx) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="border border-slate-300 py-1 px-2 text-center">{idx + 1}</td>
                      <td className="border border-slate-300 py-1 px-2 text-center font-bold font-mono">#{p.number}</td>
                      <td className="border border-slate-300 py-1 px-3 font-semibold uppercase">
                        {p.name} {p.isCaptain ? '(C)' : ''}
                      </td>
                      <td className="border border-slate-300 py-1 px-2 text-center font-bold">{p.position}</td>
                      <td className="border border-slate-300 py-1 px-3 font-mono text-[10px]">{p.birthDate || '-'}</td>
                      <td className="border border-slate-300 py-1 px-3 text-center text-slate-300">........</td>
                    </tr>
                  ))}
                  {/* Fill empty rows up to 11 if team has fewer */}
                  {Array.from({ length: Math.max(0, 11 - startingXI.length) }).map((_, i) => (
                    <tr key={`empty-${i}`}>
                      <td className="border border-slate-300 py-1 px-2 text-center">{startingXI.length + i + 1}</td>
                      <td className="border border-slate-300 py-1 px-2 text-center font-mono">-</td>
                      <td className="border border-slate-300 py-1 px-3 text-slate-300">..................................</td>
                      <td className="border border-slate-300 py-1 px-2 text-center">-</td>
                      <td className="border border-slate-300 py-1 px-3 text-slate-300">-</td>
                      <td className="border border-slate-300 py-1 px-3 text-center text-slate-300">........</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Substitutes Table */}
            <div>
              <div className="font-extrabold text-xs text-slate-900 mb-1 uppercase tracking-wide">
                B. PEMAIN CADANGAN (SUBSTITUTES)
              </div>
              <table className="w-full border-collapse border border-slate-300 text-[11px]">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="border border-slate-300 py-1 px-2 text-center w-8">No</th>
                    <th className="border border-slate-300 py-1 px-2 text-center w-12">No. Punggung</th>
                    <th className="border border-slate-300 py-1 px-3 text-left">Nama Lengkap Pemain</th>
                    <th className="border border-slate-300 py-1 px-2 text-center w-16">Posisi</th>
                    <th className="border border-slate-300 py-1 px-3 text-left w-36">Tgl Lahir / Usia</th>
                    <th className="border border-slate-300 py-1 px-3 text-center w-24">Tanda Tangan</th>
                  </tr>
                </thead>
                <tbody>
                  {substitutes.map((p, idx) => (
                    <tr key={p.id}>
                      <td className="border border-slate-300 py-1 px-2 text-center">{idx + 12}</td>
                      <td className="border border-slate-300 py-1 px-2 text-center font-bold font-mono">#{p.number}</td>
                      <td className="border border-slate-300 py-1 px-3 font-semibold uppercase">{p.name}</td>
                      <td className="border border-slate-300 py-1 px-2 text-center font-bold">{p.position}</td>
                      <td className="border border-slate-300 py-1 px-3 font-mono text-[10px]">{p.birthDate || '-'}</td>
                      <td className="border border-slate-300 py-1 px-3 text-center text-slate-300">........</td>
                    </tr>
                  ))}
                  {substitutes.length === 0 && (
                    <tr>
                      <td colSpan={6} className="border border-slate-300 py-2 text-center text-slate-400">
                        Tidak ada pemain cadangan terdaftar
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Officials on Bench Table (Official 5) */}
            <div>
              <div className="font-extrabold text-xs text-slate-900 mb-1 uppercase tracking-wide flex items-center justify-between">
                <span>C. OFFICIAL DI BENCH - OFFICIAL 5 (BANGKU CADANGAN)</span>
                <span className="text-[10px] font-normal text-slate-500">Maksimal 5 Official Berhak di Area Teknis</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
                <div className="p-2 border border-slate-300 rounded bg-slate-50/50">
                  <div className="text-[9px] font-bold text-slate-500 uppercase">1. MANAJER TIM:</div>
                  <div className="font-bold text-slate-900 truncate">{team.managerName || '-'}</div>
                </div>
                <div className="p-2 border border-slate-300 rounded bg-slate-50/50">
                  <div className="text-[9px] font-bold text-slate-500 uppercase">2. PELATIH KEPALA:</div>
                  <div className="font-bold text-slate-900 truncate">{team.headCoachName || '-'}</div>
                </div>
                <div className="p-2 border border-slate-300 rounded bg-slate-50/50">
                  <div className="text-[9px] font-bold text-slate-500 uppercase">3. ASISTEN PELATIH 1:</div>
                  <div className="font-bold text-slate-900 truncate">
                    {team.officials.filter((o) => o.role === 'Asisten Pelatih')[0]?.name || '-'}
                  </div>
                </div>
                <div className="p-2 border border-slate-300 rounded bg-slate-50/50">
                  <div className="text-[9px] font-bold text-slate-500 uppercase">4. ASISTEN PELATIH 2:</div>
                  <div className="font-bold text-slate-900 truncate">
                    {team.officials.filter((o) => o.role === 'Asisten Pelatih')[1]?.name || '-'}
                  </div>
                </div>
                <div className="p-2 border border-slate-300 rounded bg-slate-50/50">
                  <div className="text-[9px] font-bold text-slate-500 uppercase">5. DOKTER / MEDIS:</div>
                  <div className="font-bold text-slate-900 truncate">
                    {team.officials.find((o) => o.role === 'Medis/Fisioterapis')?.name || '-'}
                  </div>
                </div>
              </div>
            </div>

            {/* Official Signatures Row */}
            <div className="grid grid-cols-3 gap-6 pt-6 text-center text-[11px]">
              <div>
                <div className="text-slate-500">Kapten Kesebelasan,</div>
                <div className="h-12 flex items-center justify-center text-slate-300">.......................</div>
                <div className="font-bold uppercase text-slate-900">
                  {team.players.find((p) => p.isCaptain)?.name || team.players[0]?.name || '(Kapten)'}
                </div>
              </div>

              <div>
                <div className="text-slate-500">Manajer / Pelatih Tim,</div>
                <div className="h-12 flex items-center justify-center text-slate-300">.......................</div>
                <div className="font-bold uppercase text-slate-900">{team.managerName}</div>
              </div>

              <div>
                <div className="text-slate-500">Pengawas Pertandingan (PP),</div>
                <div className="h-12 flex items-center justify-center text-slate-300">.......................</div>
                <div className="font-bold uppercase text-slate-900">(Match Commissioner)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
