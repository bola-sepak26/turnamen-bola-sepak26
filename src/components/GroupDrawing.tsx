import React, { useState } from 'react';
import { Team, TournamentConfig } from '../types/tournament';
import { 
  RotateCcw, 
  Printer, 
  Calendar, 
  ArrowRight,
  Users
} from 'lucide-react';

interface GroupDrawingProps {
  teams: Team[];
  config: TournamentConfig;
  onUpdateTeamGroup: (teamId: string, groupName: string | undefined) => void;
  onSaveAllGroups: (assignments: { teamId: string; groupName: string }[]) => void;
  onNavigateToSchedule?: () => void;
}

export const GroupDrawing: React.FC<GroupDrawingProps> = ({
  teams,
  config,
  onUpdateTeamGroup,
  onSaveAllGroups,
  onNavigateToSchedule,
}) => {
  // Group definitions
  const groupNames = ['Grup A', 'Grup B', 'Grup C', 'Grup D', 'Grup E', 'Grup F'];

  // Current groups map
  const groups: Record<string, Team[]> = {
    'Grup A': teams.filter((t) => t.assignedGroup === 'Grup A'),
    'Grup B': teams.filter((t) => t.assignedGroup === 'Grup B'),
    'Grup C': teams.filter((t) => t.assignedGroup === 'Grup C'),
    'Grup D': teams.filter((t) => t.assignedGroup === 'Grup D'),
    'Grup E': teams.filter((t) => t.assignedGroup === 'Grup E'),
    'Grup F': teams.filter((t) => t.assignedGroup === 'Grup F'),
  };

  const unassignedTeams = teams.filter((t) => !t.assignedGroup);

  const handleResetGroups = () => {
    if (window.confirm('Reset semua pembagian grup tim saat ini?')) {
      const cleared = teams.map((t) => ({ teamId: t.id, groupName: '' }));
      onSaveAllGroups(cleared);
    }
  };

  // Generate Matchday 1 fixtures preview based on groups
  const fixtures = [];
  for (const gName of groupNames) {
    const grpTeams = groups[gName];
    if (grpTeams.length >= 2) {
      fixtures.push({
        group: gName,
        match1: { teamA: grpTeams[0], teamB: grpTeams[1], time: '08:30 WIB', pitch: 'Lapangan 1' },
      });
    }
    if (grpTeams.length >= 4) {
      fixtures.push({
        group: gName,
        match2: { teamA: grpTeams[2], teamB: grpTeams[3], time: '10:00 WIB', pitch: 'Lapangan 2' },
      });
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-display">
            Pengundian Grup Turnamen (Official Drawing)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Bagan pembagian {teams.length} tim ke dalam 4 grup (Grup A s/d D) menuju fase gugur
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetGroups}
            className="px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Grup</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Bagan Hasil Drawing</span>
          </button>
        </div>
      </div>

      {/* Unassigned Teams Indicator */}
      {unassignedTeams.length > 0 && (
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 space-y-2">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
            <Users className="w-4 h-4 text-amber-700" />
            <span>Terdapat {unassignedTeams.length} tim belum dialokasikan ke grup:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {unassignedTeams.map((t) => (
              <div
                key={t.id}
                className="bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 flex items-center gap-2 text-xs shadow-2xs"
              >
                <div
                  className="w-5 h-5 rounded text-white text-[9px] font-bold flex items-center justify-center shrink-0"
                  style={{ backgroundColor: t.primaryJerseyColor }}
                >
                  {t.code}
                </div>
                <span className="font-semibold text-slate-900">{t.name}</span>
                <span className="text-[11px] text-slate-400">→</span>
                <select
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) {
                      onUpdateTeamGroup(t.id, e.target.value);
                    }
                  }}
                  className="text-[11px] py-0.5 px-1.5 bg-slate-50 border border-slate-200 rounded font-medium text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="" disabled>Pilih Grup</option>
                  <option value="Grup A">Grup A</option>
                  <option value="Grup B">Grup B</option>
                  <option value="Grup C">Grup C</option>
                  <option value="Grup D">Grup D</option>
                  <option value="Grup E">Grup E</option>
                  <option value="Grup F">Grup F</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6 Groups Grid Layout (A sampai F) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {groupNames.map((gName) => {
          const gTeams = groups[gName] || [];

          return (
            <div
              key={gName}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between"
            >
              <div>
                {/* Group Header */}
                <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
                  <div className="font-extrabold text-sm tracking-wide font-display">
                    {gName}
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                    {gTeams.length} Tim
                  </span>
                </div>

                {/* Team Rows */}
                <div className="p-3 divide-y divide-slate-100">
                  {gTeams.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      Belum ada tim di {gName}
                    </div>
                  ) : (
                    gTeams.map((team, idx) => (
                      <div key={team.id} className="py-2.5 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-5 text-center text-xs font-mono font-bold text-slate-400">
                            {idx + 1}
                          </span>
                          <div
                            className="w-6 h-6 rounded flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                            style={{ backgroundColor: team.primaryJerseyColor }}
                          >
                            {team.code}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900 truncate">
                              {team.name}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {team.originCity}
                            </div>
                          </div>
                        </div>

                        {/* Change group dropdown */}
                        <select
                          value={team.assignedGroup || ''}
                          onChange={(e) => onUpdateTeamGroup(team.id, e.target.value || undefined)}
                          className="text-[11px] py-0.5 px-1 bg-slate-50 border border-slate-200 rounded text-slate-600 focus:outline-none cursor-pointer"
                        >
                          <option value="Grup A">A</option>
                          <option value="Grup B">B</option>
                          <option value="Grup C">C</option>
                          <option value="Grup D">D</option>
                          <option value="Grup E">E</option>
                          <option value="Grup F">F</option>
                        </select>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Group Footer */}
              <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 text-center">
                Peringkat grup turnamen
              </div>
            </div>
          );
        })}
      </div>

      {/* Match Fixture Draft Schedule */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 font-display">
              Draft Jadwal Pertandingan Matchday 1 (Fase Grup)
            </h2>
            <p className="text-xs text-slate-500">
              Pratinjau susunan laga Matchday 1 berdasarkan hasil undian pot grup
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs font-semibold text-slate-500 hidden sm:flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Kick-Off: {config.tournamentStartDate}</span>
            </div>
            {onNavigateToSchedule && (
              <button
                onClick={onNavigateToSchedule}
                className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <span>Menu Jadwal Lengkap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groupNames.map((gName) => {
            const grpTeams = groups[gName];
            if (grpTeams.length < 2) return null;

            return (
              <div key={gName} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                <div className="text-xs font-extrabold text-slate-800 flex items-center justify-between">
                  <span>Matchday 1 — {gName}</span>
                  <span className="text-[11px] text-slate-500">{config.stadiumVenue}</span>
                </div>

                {/* Match 1 */}
                <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 justify-end font-bold text-xs text-slate-900 text-right">
                    <span>{grpTeams[0]?.name}</span>
                    <div className="w-5 h-5 rounded text-white text-[9px] font-bold flex items-center justify-center shrink-0" style={{ backgroundColor: grpTeams[0]?.primaryJerseyColor }}>
                      {grpTeams[0]?.code}
                    </div>
                  </div>

                  <div className="px-3 text-center">
                    <span className="text-[11px] font-bold text-slate-400">VS</span>
                    <div className="text-[10px] text-emerald-700 font-mono font-semibold">08:30 WIB</div>
                  </div>

                  <div className="flex items-center gap-2 flex-1 justify-start font-bold text-xs text-slate-900">
                    <div className="w-5 h-5 rounded text-white text-[9px] font-bold flex items-center justify-center shrink-0" style={{ backgroundColor: grpTeams[1]?.primaryJerseyColor }}>
                      {grpTeams[1]?.code}
                    </div>
                    <span>{grpTeams[1]?.name}</span>
                  </div>
                </div>

                {/* Match 2 if at least 4 teams */}
                {grpTeams.length >= 4 && (
                  <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 justify-end font-bold text-xs text-slate-900 text-right">
                      <span>{grpTeams[2]?.name}</span>
                      <div className="w-5 h-5 rounded text-white text-[9px] font-bold flex items-center justify-center shrink-0" style={{ backgroundColor: grpTeams[2]?.primaryJerseyColor }}>
                        {grpTeams[2]?.code}
                      </div>
                    </div>

                    <div className="px-3 text-center">
                      <span className="text-[11px] font-bold text-slate-400">VS</span>
                      <div className="text-[10px] text-emerald-700 font-mono font-semibold">10:15 WIB</div>
                    </div>

                    <div className="flex items-center gap-2 flex-1 justify-start font-bold text-xs text-slate-900">
                      <div className="w-5 h-5 rounded text-white text-[9px] font-bold flex items-center justify-center shrink-0" style={{ backgroundColor: grpTeams[3]?.primaryJerseyColor }}>
                        {grpTeams[3]?.code}
                      </div>
                      <span>{grpTeams[3]?.name}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
