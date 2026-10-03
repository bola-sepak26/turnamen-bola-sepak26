/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Team, TournamentConfig, NavTab, AdminUser, Match, TournamentDocument } from './types/tournament';
import { initialConfig, initialTeams, initialMatches } from './data/initialTournamentData';
import { loadTournamentData, saveTournamentData, resetToInitialData } from './utils/storage';
import { ensureTeamCredentials } from './utils/credentials';

// Components
import { Navbar } from './components/Navbar';
import { Menu, X, Settings, LogOut, Key, Database, ArrowRight, ShieldCheck } from 'lucide-react';
import { AdminLogin } from './components/AdminLogin';

// Modals
// Komponen berat dimuat saat dibutuhkan (code-splitting) agar loading awal cepat
const DashboardOverview = lazy(() => import('./components/DashboardOverview').then((m) => ({ default: m.DashboardOverview })));
const TeamList = lazy(() => import('./components/TeamList').then((m) => ({ default: m.TeamList })));
const TeamRegistrationPortalView = lazy(() => import('./components/TeamRegistrationPortalView').then((m) => ({ default: m.TeamRegistrationPortalView })));
const ScreeningPanel = lazy(() => import('./components/ScreeningPanel').then((m) => ({ default: m.ScreeningPanel })));
const GroupDrawing = lazy(() => import('./components/GroupDrawing').then((m) => ({ default: m.GroupDrawing })));
const MatchScheduleView = lazy(() => import('./components/MatchScheduleView').then((m) => ({ default: m.MatchScheduleView })));
const MatchSummaryView = lazy(() => import('./components/MatchSummaryView').then((m) => ({ default: m.MatchSummaryView })));
const FinanceView = lazy(() => import('./components/FinanceView').then((m) => ({ default: m.FinanceView })));
const DocumentStorageView = lazy(() => import('./components/DocumentStorageView').then((m) => ({ default: m.DocumentStorageView })));
const TeamRegistrationModal = lazy(() => import('./components/TeamRegistrationModal').then((m) => ({ default: m.TeamRegistrationModal })));
const TeamDetailModal = lazy(() => import('./components/TeamDetailModal').then((m) => ({ default: m.TeamDetailModal })));
const ReceiptPrintModal = lazy(() => import('./components/ReceiptPrintModal').then((m) => ({ default: m.ReceiptPrintModal })));
const IdCardPrintModal = lazy(() => import('./components/IdCardPrintModal').then((m) => ({ default: m.IdCardPrintModal })));
const MatchSheetPrintModal = lazy(() => import('./components/MatchSheetPrintModal').then((m) => ({ default: m.MatchSheetPrintModal })));
const TournamentSettingsModal = lazy(() => import('./components/TournamentSettingsModal').then((m) => ({ default: m.TournamentSettingsModal })));
const ChangePasswordModal = lazy(() => import('./components/ChangePasswordModal').then((m) => ({ default: m.ChangePasswordModal })));

import {
  fetchTournamentData,
  saveTeamApi,
  deleteTeamApi,
  deleteAllTeamsApi,
  saveMatchApi,
  saveConfigApi,
} from './utils/api';

export default function App() {
  // Admin Auth State
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(() => {
    try {
      const raw = localStorage.getItem('ligapora_admin_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // Main Data States (defaults to empty array for empty team database)
  const [config, setConfig] = useState<TournamentConfig>(initialConfig);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [documents, setDocuments] = useState<TournamentDocument[]>([]);
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [isDbConnected, setIsDbConnected] = useState<boolean>(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Modal States
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptTeam, setReceiptTeam] = useState<Team | null>(null);

  const [isIdCardsModalOpen, setIsIdCardsModalOpen] = useState(false);
  const [idCardsTeam, setIdCardsTeam] = useState<Team | null>(null);

  const [isMatchSheetModalOpen, setIsMatchSheetModalOpen] = useState(false);
  const [matchSheetTeam, setMatchSheetTeam] = useState<Team | null>(null);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  // Toast / Status notification banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isTeamViewer = currentAdmin?.role === 'team_viewer';

  // Security route safeguard for team viewers: prevent access to admin-only tabs
  useEffect(() => {
    if (
      isTeamViewer &&
      (activeTab === 'overview' ||
        activeTab === 'teams' ||
        activeTab === 'screening' ||
        activeTab === 'drawing' ||
        activeTab === 'finance' ||
        activeTab === 'match_summary' ||
        activeTab === 'documents')
    ) {
      setActiveTab('registration');
    }
  }, [isTeamViewer, activeTab]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Pending verification count
  const pendingScreeningCount = teams.filter((t) => t.status === 'pending' || t.status === 'action_required').length;

  // Load persisted data on mount & fetch from database
  useEffect(() => {
    // Fetch from persistent Cloud SQL Database API
    fetchTournamentData().then((res) => {
      if (res) {
        setIsDbConnected(true);
        if (res.config) setConfig(res.config);
        const resolvedTeams = (Array.isArray(res.teams) ? res.teams : []).map((t) =>
          t.paymentStatus === 'paid' ? ensureTeamCredentials(t) : t
        );
        setTeams(resolvedTeams);
        setMatches(Array.isArray(res.matches) ? res.matches : []);
        if (Array.isArray(res.documents)) setDocuments(res.documents);
        saveTournamentData(res.config, resolvedTeams, res.matches || []);
      } else {
        const loaded = loadTournamentData();
        if (loaded.config) setConfig(loaded.config);
        const resolvedTeams = (Array.isArray(loaded.teams) ? loaded.teams : []).map((t) =>
          t.paymentStatus === 'paid' ? ensureTeamCredentials(t) : t
        );
        setTeams(resolvedTeams);
        setMatches(Array.isArray(loaded.matches) ? loaded.matches : []);
      }
    });
  }, []);

  // Sync to localStorage on changes
  const updateTeamsAndPersist = (newTeams: Team[]) => {
    setTeams(newTeams);
    saveTournamentData(config, newTeams, matches);
  };

  const handleClearAllTeams = async () => {
    setTeams([]);
    setMatches([]);
    saveTournamentData(config, [], []);
    await deleteAllTeamsApi();
    showToast('Semua data tim peserta berhasil dikosongkan.');
  };

  const updateConfigAndPersist = (newConfig: TournamentConfig) => {
    setConfig(newConfig);
    saveTournamentData(newConfig, teams, matches);
    saveConfigApi(newConfig);
    showToast('Regulasi dan konfigurasi turnamen berhasil diperbarui!');
  };

  const updateMatchesAndPersist = (newMatches: Match[]) => {
    setMatches(newMatches);
    saveTournamentData(config, teams, newMatches);
  };

  // Team CRUD
  const handleSaveTeam = (savedTeam: Team) => {
    // If team is already verified and accessed by team viewer, lock registration edits
    const existing = teams.find((t) => t.id === savedTeam.id);
    if (isTeamViewer && existing?.status === 'verified') {
      showToast('Portal pendaftaran terkunci: Data tim telah disahkan & diverifikasi panitia.');
      return;
    }

    const existingIndex = teams.findIndex((t) => t.id === savedTeam.id);
    let updatedTeams: Team[];

    if (existingIndex >= 0) {
      updatedTeams = [...teams];
      updatedTeams[existingIndex] = savedTeam;
      showToast(`Data tim "${savedTeam.name}" berhasil diperbarui.`);
    } else {
      updatedTeams = [savedTeam, ...teams];
      showToast(`Tim "${savedTeam.name}" berhasil didaftarkan ke turnamen!`);
    }

    updateTeamsAndPersist(updatedTeams);
    saveTeamApi(savedTeam);
    if (selectedTeam && selectedTeam.id === savedTeam.id) {
      setSelectedTeam(savedTeam);
    }
  };

  const handleDeleteTeam = (teamId: string) => {
    const target = teams.find((t) => t.id === teamId);
    const updatedTeams = teams.filter((t) => t.id !== teamId);
    updateTeamsAndPersist(updatedTeams);
    deleteTeamApi(teamId);
    if (selectedTeam?.id === teamId) {
      setIsDetailModalOpen(false);
    }
    showToast(`Tim ${target ? target.name : ''} telah dihapus dari turnamen.`);
  };

  // Team Screening & Verification updates
  const handleUpdateTeamStatus = (teamId: string, status: Team['status'], notes?: string) => {
    const updated = teams.map((t) => {
      if (t.id === teamId) {
        return {
          ...t,
          status,
          screeningNotes: notes !== undefined ? notes : t.screeningNotes,
        };
      }
      return t;
    });
    updateTeamsAndPersist(updated);
    if (selectedTeam?.id === teamId) {
      setSelectedTeam({
        ...selectedTeam,
        status,
        screeningNotes: notes !== undefined ? notes : selectedTeam.screeningNotes,
      });
    }
    showToast(`Status tim berhasil diubah menjadi: ${status.toUpperCase()}`);
  };

  const handleUpdatePlayerVerification = (teamId: string, playerId: string, isVerified: boolean) => {
    const updated = teams.map((team) => {
      if (team.id === teamId) {
        const updatedPlayers = team.players.map((p) => {
          if (p.id === playerId) {
            return { ...p, isVerified };
          }
          return p;
        });
        return { ...team, players: updatedPlayers };
      }
      return team;
    });
    updateTeamsAndPersist(updated);

    if (selectedTeam?.id === teamId) {
      const updatedPlayers = selectedTeam.players.map((p) => (p.id === playerId ? { ...p, isVerified } : p));
      setSelectedTeam({ ...selectedTeam, players: updatedPlayers });
    }
  };

  // Group Drawing updates
  const handleUpdateTeamGroup = (teamId: string, groupName: string | undefined) => {
    const updated = teams.map((t) => (t.id === teamId ? { ...t, assignedGroup: groupName } : t));
    updateTeamsAndPersist(updated);
  };

  const handleSaveAllGroups = (assignments: { teamId: string; groupName: string }[]) => {
    const map = new Map(assignments.map((a) => [a.teamId, a.groupName]));
    const updated = teams.map((t) => ({
      ...t,
      assignedGroup: map.get(t.id) || undefined,
    }));
    updateTeamsAndPersist(updated);
    showToast('Hasil pengundian grup turnamen berhasil diperbarui!');
  };

  // Match Schedule CRUD & updates
  const handleSaveMatch = (savedMatch: Match) => {
    const existingIndex = matches.findIndex((m) => m.id === savedMatch.id);
    let updated: Match[];
    if (existingIndex >= 0) {
      updated = [...matches];
      updated[existingIndex] = savedMatch;
      showToast(`Jadwal laga #${savedMatch.matchNumber} berhasil diperbarui.`);
    } else {
      updated = [...matches, savedMatch];
      showToast(`Laga #${savedMatch.matchNumber} berhasil ditambahkan ke jadwal turnamen.`);
    }
    updateMatchesAndPersist(updated);
    saveMatchApi(savedMatch);
  };

  const handleDeleteMatch = (matchId: string) => {
    const target = matches.find((m) => m.id === matchId);
    const updated = matches.filter((m) => m.id !== matchId);
    updateMatchesAndPersist(updated);
    showToast(`Pertandingan #${target ? target.matchNumber : ''} telah dihapus dari jadwal.`);
  };

  // Finance updates
  const handleUpdatePayment = (teamId: string, paymentStatus: Team['paymentStatus'], amount: number) => {
    let savedTargetTeam: Team | undefined;
    const updated = teams.map((t) => {
      if (t.id === teamId) {
        const isPaid = paymentStatus === 'paid';
        const teamWithCreds = isPaid ? ensureTeamCredentials(t) : t;
        const result: Team = {
          ...teamWithCreds,
          paymentStatus,
          paidAmount: amount,
          paymentDate: amount > 0 ? (t.paymentDate || new Date().toISOString().slice(0, 10)) : undefined,
          receiptNumber: t.receiptNumber || `KWT-LP/2026/REG-${t.code}`,
          credentialsIssuedAt: isPaid ? (t.credentialsIssuedAt || new Date().toISOString()) : t.credentialsIssuedAt,
        };
        savedTargetTeam = result;
        return result;
      }
      return t;
    });
    updateTeamsAndPersist(updated);
    if (savedTargetTeam) {
      saveTeamApi(savedTargetTeam);
    }
    showToast(
      paymentStatus === 'paid'
        ? 'Pembayaran LUNAS! Kode akses login resmi tim telah aktif dan diterbitkan.'
        : 'Catatan pembayaran berhasil diperbarui.'
    );
  };

  // Reset to initial or empty data
  const handleResetData = (mode: 'initial' | 'empty' = 'initial') => {
    if (mode === 'empty') {
      const emptyTeams: Team[] = [];
      const emptyMatches: Match[] = [];
      setTeams(emptyTeams);
      setMatches(emptyMatches);
      saveTournamentData(config, emptyTeams, emptyMatches);
      showToast('Seluruh data tim dan jadwal berhasil dikosongkan.');
    } else {
      const res = resetToInitialData();
      setConfig(res.config);
      setTeams(res.teams);
      setMatches(res.matches);
      showToast('Data turnamen telah di-reset kembali ke data bawaan awal.');
    }
  };

  const handleImportBackup = (imported: { config: TournamentConfig; teams: Team[]; matches?: Match[] }) => {
    setConfig(imported.config);
    setTeams(imported.teams);
    if (imported.matches && Array.isArray(imported.matches)) {
      setMatches(imported.matches);
      saveTournamentData(imported.config, imported.teams, imported.matches);
    } else {
      saveTournamentData(imported.config, imported.teams, matches);
    }
    showToast('Data cadangan berhasil diimpor!');
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('ligapora_admin_user');
    } catch (e) {
      console.error(e);
    }
    setCurrentAdmin(null);
    showToast('Sesi administrator berhasil diakhiri.');
  };

  const handleLoginAsTeamPortal = (team: Team) => {
    const teamUser: AdminUser = {
      id: `team-${team.id}`,
      name: `Admin (Inspeksi ${team.name})`,
      email: `${team.code.toLowerCase()}@peserta.kingdc.id`,
      role: 'team_viewer',
      roleLabel: `Admin Inspeksi • ${team.name}`,
      teamId: team.id,
      teamName: team.name,
      teamCode: team.code,
      originalAdminRole: currentAdmin?.role || 'super_admin',
      originalAdminName: currentAdmin?.name || 'Administrator',
    };
    setCurrentAdmin(teamUser);
    try {
      localStorage.setItem('ligapora_admin_user', JSON.stringify(teamUser));
    } catch (e) {
      console.error(e);
    }
    setActiveTab('schedule');
    showToast(`Beralih ke Portal Tim: ${team.name} (Mode Administrator)`);
  };

  // Navigation metadata for Variation 5
  const navItems: { id: NavTab; label: string; adminOnly?: boolean; badge?: string }[] = [
    { id: 'overview', label: 'Ringkasan', adminOnly: true },
    { id: 'registration', label: 'Pendaftaran Tim', badge: isTeamViewer ? 'PORTAL' : undefined },
    { id: 'teams', label: 'Direktori Tim', adminOnly: true },
    { id: 'screening', label: 'Screening & Keabsahan', adminOnly: true },
    { id: 'drawing', label: 'Drawing Grup', adminOnly: true },
    { id: 'schedule', label: 'Jadwal Pertandingan' },
    { id: 'match_summary', label: 'Match Summary', adminOnly: true },
    { id: 'finance', label: 'Keuangan & Kuitansi', adminOnly: true },
    { id: 'documents', label: 'Database Dokumen', adminOnly: true, badge: 'SUPABASE' },
  ];

  const accessibleNavItems = navItems.filter((item) => !(isTeamViewer && item.adminOnly));

  // If no admin is authenticated, display the Admin Login screen
  if (!currentAdmin) {
    return (
      <AdminLogin
        config={config}
        teams={teams}
        onLoginSuccess={(admin) => {
          setCurrentAdmin(admin);
          try {
            localStorage.setItem('ligapora_admin_user', JSON.stringify(admin));
          } catch (e) {
            console.error(e);
          }
          if (admin.role === 'team_viewer') {
            setActiveTab('registration');
          } else {
            setActiveTab('overview');
          }
          showToast(`Selamat datang, ${admin.name} (${admin.roleLabel})!`);
        }}
      />
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#f8fafc] text-black flex flex-col lg:grid lg:grid-cols-[240px_1fr] font-sans selection:bg-[#ff4d00] selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-black text-white border border-slate-700 px-4 py-3 rounded shadow-2xl text-xs font-mono-tech flex items-center gap-2 animate-bounce no-print">
          <span className="w-2 h-2 rounded-full bg-[#ff4d00]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Variation 23: Sidebar Navigation with pure black text */}
      <aside className="hidden lg:flex flex-col h-full bg-white border-r border-slate-200 p-4 select-none shrink-0 z-20 no-print">
        <div className="font-syne font-extrabold text-[1.5rem] tracking-[-0.04em] text-black mb-8 flex items-center gap-2.5">
          <div className="w-6 h-6 bg-[#ff4d00] rounded-xs flex items-center justify-center p-0.5 shrink-0">
            <img src="/kingdc_logo.png" alt="KingDC" className="w-full h-full object-contain" />
          </div>
          <span className="text-black font-black">KingDC</span>
        </div>

        <div className="font-mono-tech text-[10px] uppercase tracking-[0.15em] text-black font-bold mb-3 px-2">
          Main Console
        </div>

        <nav className="space-y-0.5 flex-1 overflow-y-auto pr-1">
          {accessibleNavItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full text-left px-3 py-2.5 text-[12px] rounded-xs transition-colors flex items-center justify-between cursor-pointer ${
                  isActive
                    ? 'text-black bg-slate-100 font-bold border-l-2 border-black'
                    : 'text-black font-medium hover:text-black hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span className="truncate text-black">{item.label}</span>
                  {item.badge && (
                    <span className="px-1 py-0.2 rounded-2xs bg-emerald-100 text-emerald-800 border border-emerald-300 text-[8px] font-mono-tech font-bold uppercase shrink-0">
                      {item.badge}
                    </span>
                  )}
                </div>
                {item.id === 'screening' && pendingScreeningCount > 0 ? (
                  <span className="badge-pending text-[9px] px-1.5 py-0.5 text-black">
                    {pendingScreeningCount}
                  </span>
                ) : (
                  isActive && <span className="text-base leading-none text-black font-black">•</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 border border-black bg-slate-100 text-black flex items-center justify-center font-mono-tech text-xs font-bold rounded-xs shrink-0">
                {currentAdmin?.name ? currentAdmin.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-black text-black tracking-wider uppercase truncate">
                  ACTIVE SESSION
                </div>
                <div className="text-[10px] text-black font-mono-tech font-semibold truncate">
                  {isTeamViewer ? currentAdmin?.name : (currentAdmin?.roleLabel || 'Administrator')}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {!isTeamViewer && (
                <>
                  <button
                    onClick={() => setIsChangePasswordModalOpen(true)}
                    title="Ganti Kata Sandi Administrator"
                    className="p-1.5 text-black hover:text-[#ff4d00] hover:bg-slate-100 rounded transition-colors cursor-pointer"
                  >
                    <Key className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setIsSettingsModalOpen(true)}
                    title="Pengaturan Turnamen"
                    className="p-1.5 text-black hover:bg-slate-100 rounded transition-colors cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
              <button
                onClick={handleLogout}
                title="Keluar Sesi"
                className="p-1.5 text-black hover:text-[#ff4d00] hover:bg-slate-100 rounded transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Variation 5: Mobile Drawer for small screens */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] bg-[#070707] border-r border-white/10 flex flex-col h-full z-10">
            {/* Mobile Drawer */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded bg-white border border-slate-200 p-0.5 flex items-center justify-center shrink-0">
                  <img src="/kingdc_logo.png" alt="KingDC" className="w-full h-full object-contain" />
                </div>
                <span className="font-syne font-extrabold text-xl tracking-tight text-black">KingDC</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 text-black hover:bg-slate-100 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="p-4 space-y-1 flex-1 overflow-y-auto bg-white">
              <span className="font-mono-tech text-[10px] uppercase tracking-widest text-black font-bold px-3 py-2 block">
                Navigation
              </span>
              {accessibleNavItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-xs font-mono-tech transition-all flex items-center justify-between rounded-xs cursor-pointer ${
                      isActive
                        ? 'text-black bg-slate-100 border-l-2 border-black font-bold'
                        : 'text-black font-medium hover:bg-slate-50 border-l-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-black">{item.label}</span>
                      {item.badge && (
                        <span className="px-1 py-0.2 rounded-2xs bg-emerald-100 text-emerald-800 border border-emerald-300 text-[8px] font-mono-tech font-bold uppercase shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    {item.id === 'screening' && pendingScreeningCount > 0 ? (
                      <span className="bg-amber-100 text-black border border-amber-300 text-[10px] px-1.5 py-0.5 rounded font-mono-tech font-bold">
                        {pendingScreeningCount}
                      </span>
                    ) : (
                      isActive && <span className="text-black font-black">•</span>
                    )}
                  </button>
                );
              })}
            </nav>
            <div className="p-4 border-t border-slate-200 bg-white space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-mono-tech text-black font-bold truncate">
                  {currentAdmin?.name}
                </div>
                <button
                  onClick={handleLogout}
                  className="text-xs font-mono-tech text-black font-bold hover:underline cursor-pointer"
                >
                  Keluar
                </button>
              </div>
              {!isTeamViewer && (
                <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsChangePasswordModalOpen(true);
                    }}
                    className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-black text-[11px] font-mono-tech font-bold rounded flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Key className="w-3.5 h-3.5 text-[#ff4d00]" />
                    <span>Ganti Kata Sandi</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsSettingsModalOpen(true);
                    }}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-black rounded cursor-pointer"
                    title="Pengaturan Turnamen"
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Variation 23: Main Workspace with black font */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-v23-grid text-black min-w-0">
        {/* Workspace Header */}
        <header className="px-6 sm:px-8 py-4 border-b border-slate-200 flex justify-between items-center bg-white shrink-0 no-print">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-1.5 text-black hover:bg-slate-100 bg-slate-50 border border-slate-200 rounded cursor-pointer"
              title="Menu Navigasi"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="font-mono-tech text-[11px] uppercase tracking-[0.1em] text-black font-bold">
              Project: {config.name} {config.edition}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-mono-tech text-[11px] uppercase tracking-[0.1em] text-black font-bold">
                System: {isDbConnected ? 'Stable' : 'Active'}
              </span>
            </div>
            <span className="text-slate-300 text-[10px] hidden sm:inline">•</span>
            <div className="font-mono-tech text-[10px] text-black font-bold uppercase tracking-widest hidden sm:block">
              v4.3_LATEST
            </div>
          </div>
        </header>

        {/* Workspace Content Scroll Area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 space-y-8 text-black">
        <Suspense
          fallback={
            <div className="py-24 text-center font-mono-tech text-[11px] uppercase tracking-widest text-slate-500">
              Memuat modul...
            </div>
          }
        >
        {!isTeamViewer && activeTab === 'overview' && (
          <DashboardOverview
            config={config}
            teams={teams}
            setActiveTab={setActiveTab}
            isTeamViewer={isTeamViewer}
            onSelectTeam={(team: Team) => {
              setSelectedTeam(team);
              setIsDetailModalOpen(true);
            }}
            onOpenRegisterModal={() => {
              if (isTeamViewer) return;
              setEditingTeam(null);
              setIsRegisterModalOpen(true);
            }}
          />
        )}

        {activeTab === 'registration' && (
          <TeamRegistrationPortalView
            config={config}
            teams={teams}
            currentAdmin={currentAdmin}
            isTeamViewer={isTeamViewer}
            onSaveTeam={handleSaveTeam}
            onOpenReceipt={(team) => {
              setReceiptTeam(team);
              setIsReceiptModalOpen(true);
            }}
            onOpenNewRegistrationModal={() => {
              setEditingTeam(null);
              setIsRegisterModalOpen(true);
            }}
            showToast={showToast}
          />
        )}

        {!isTeamViewer && activeTab === 'teams' && (
          <TeamList
            teams={teams}
            config={config}
            matches={matches}
            isReadOnly={isTeamViewer}
            onLoginAsTeamPortal={handleLoginAsTeamPortal}
            onSelectTeam={(team) => {
              setSelectedTeam(team);
              setIsDetailModalOpen(true);
            }}
            onOpenMatchSummary={(team) => {
              setSelectedTeam(team);
              setIsDetailModalOpen(true);
            }}
            onEditTeam={(team) => {
              if (isTeamViewer) return;
              setEditingTeam(team);
              setIsRegisterModalOpen(true);
            }}
            onDeleteTeam={handleDeleteTeam}
            onClearAllTeams={handleClearAllTeams}
            onOpenRegisterModal={() => {
              if (isTeamViewer) return;
              setEditingTeam(null);
              setIsRegisterModalOpen(true);
            }}
            onOpenReceipt={(team) => {
              setReceiptTeam(team);
              setIsReceiptModalOpen(true);
            }}
            onOpenIdCards={(team) => {
              setIdCardsTeam(team);
              setIsIdCardsModalOpen(true);
            }}
            onOpenMatchSheet={(team) => {
              setMatchSheetTeam(team);
              setIsMatchSheetModalOpen(true);
            }}
          />
        )}

        {!isTeamViewer && activeTab === 'screening' && (
          <ScreeningPanel
            teams={teams}
            config={config}
            onUpdateTeamStatus={handleUpdateTeamStatus}
            onUpdatePlayerVerification={handleUpdatePlayerVerification}
            onSelectTeam={(team) => {
              setSelectedTeam(team);
              setIsDetailModalOpen(true);
            }}
          />
        )}

        {!isTeamViewer && activeTab === 'drawing' && (
          <GroupDrawing
            teams={teams}
            config={config}
            onUpdateTeamGroup={handleUpdateTeamGroup}
            onSaveAllGroups={handleSaveAllGroups}
            onNavigateToSchedule={() => setActiveTab('schedule')}
          />
        )}

        {activeTab === 'schedule' && (
          <MatchScheduleView
            matches={matches}
            teams={teams}
            config={config}
            isReadOnly={isTeamViewer}
            onSaveMatch={handleSaveMatch}
            onDeleteMatch={handleDeleteMatch}
            onOpenMatchSheet={(team) => {
              setMatchSheetTeam(team);
              setIsMatchSheetModalOpen(true);
            }}
          />
        )}

        {!isTeamViewer && activeTab === 'match_summary' && (
          <MatchSummaryView
            matches={matches}
            teams={teams}
            config={config}
            isReadOnly={isTeamViewer}
            onSaveMatch={handleSaveMatch}
            onOpenMatchSheet={(team) => {
              setMatchSheetTeam(team);
              setIsMatchSheetModalOpen(true);
            }}
          />
        )}

        {!isTeamViewer && activeTab === 'finance' && (
          <FinanceView
            teams={teams}
            config={config}
            onOpenReceipt={(team) => {
              setReceiptTeam(team);
              setIsReceiptModalOpen(true);
            }}
            onUpdatePayment={handleUpdatePayment}
          />
        )}

        {!isTeamViewer && activeTab === 'documents' && (
          <DocumentStorageView
            config={config}
            teams={teams}
            documents={documents}
            onUpdateDocuments={(docs) => setDocuments(docs)}
            isTeamViewer={isTeamViewer}
            userTeamId={currentAdmin?.teamId}
            showToast={showToast}
          />
        )}
        </Suspense>
        </div>

        {/* Variation 23: Footer with black text */}
        <footer className="px-6 sm:px-8 py-3 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-2 font-mono-tech text-[10px] text-black font-semibold bg-white shrink-0 no-print">
          <div>NETWORK: OPTIMAL [14MS] // ENCRYPTION: AES-256</div>
          <div>© KINGDC ADMINISTRATION SYSTEM 2026 // {config.name.toUpperCase()}</div>
        </footer>
      </main>

      {/* MODALS (dimuat saat pertama dibuka) */}
      <Suspense fallback={null}>
      {/* 1. Register & Edit Modal */}
      {!isTeamViewer && isRegisterModalOpen && (
        <TeamRegistrationModal
          isOpen={isRegisterModalOpen}
          onClose={() => {
            setIsRegisterModalOpen(false);
            setEditingTeam(null);
          }}
          onSave={handleSaveTeam}
          initialTeam={editingTeam}
          config={config}
        />
      )}

      {/* 2. Team Detail Dossier Modal */}
      {isDetailModalOpen && (
      <TeamDetailModal
        team={selectedTeam}
        config={config}
        matches={matches}
        allTeams={teams}
        isOpen={isDetailModalOpen}
        isReadOnly={isTeamViewer}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedTeam(null);
        }}
        onEditTeam={(team) => {
          if (isTeamViewer) return;
          setIsDetailModalOpen(false);
          setEditingTeam(team);
          setIsRegisterModalOpen(true);
        }}
        onOpenReceipt={(team) => {
          setReceiptTeam(team);
          setIsReceiptModalOpen(true);
        }}
        onOpenIdCards={(team) => {
          setIdCardsTeam(team);
          setIsIdCardsModalOpen(true);
        }}
        onOpenMatchSheet={(team) => {
          setMatchSheetTeam(team);
          setIsMatchSheetModalOpen(true);
        }}
        onUpdateStatus={handleUpdateTeamStatus}
      />
      )}

      {/* 3. Official Payment Receipt Print Modal */}
      {isReceiptModalOpen && (
      <ReceiptPrintModal
        team={receiptTeam}
        config={config}
        isOpen={isReceiptModalOpen}
        onClose={() => {
          setIsReceiptModalOpen(false);
          setReceiptTeam(null);
        }}
      />
      )}

      {/* 4. Accreditation ID Card Lanyard Pass Print Modal */}
      {isIdCardsModalOpen && (
      <IdCardPrintModal
        team={idCardsTeam}
        config={config}
        isOpen={isIdCardsModalOpen}
        onClose={() => {
          setIsIdCardsModalOpen(false);
          setIdCardsTeam(null);
        }}
      />
      )}

      {/* 5. Daftar Susunan Pemain (DSP) Match Sheet Print Modal */}
      {isMatchSheetModalOpen && (
      <MatchSheetPrintModal
        team={matchSheetTeam}
        config={config}
        isOpen={isMatchSheetModalOpen}
        onClose={() => {
          setIsMatchSheetModalOpen(false);
          setMatchSheetTeam(null);
        }}
      />
      )}

      {/* 6. Tournament Regulations & Settings Modal */}
      {isSettingsModalOpen && (
      <TournamentSettingsModal
        config={config}
        teams={teams}
        matches={matches}
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onSaveConfig={updateConfigAndPersist}
        onResetData={handleResetData}
        onImportBackup={handleImportBackup}
        onOpenChangePassword={() => setIsChangePasswordModalOpen(true)}
        currentAdmin={currentAdmin}
      />
      )}

      {/* 7. Change Password Modal */}
      {isChangePasswordModalOpen && (
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        currentAdmin={currentAdmin}
        onPasswordChanged={(msg) => showToast(msg)}
      />
      )}
      </Suspense>
    </div>
  );
}
