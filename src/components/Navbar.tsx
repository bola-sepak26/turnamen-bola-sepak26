import React from 'react';
import { Plus, Settings, LogOut, User } from 'lucide-react';
import { AdminUser } from '../types/tournament';

export type ActiveTab = 'overview' | 'registration' | 'teams' | 'screening' | 'drawing' | 'schedule' | 'match_summary' | 'finance' | 'documents';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenRegisterModal: () => void;
  onOpenSettingsModal: () => void;
  pendingScreeningCount: number;
  currentAdmin?: AdminUser | null;
  onLogout?: () => void;
  isDbConnected?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenRegisterModal,
  onOpenSettingsModal,
  pendingScreeningCount,
  currentAdmin,
  onLogout,
  isDbConnected = true,
}) => {
  const isTeamViewer = currentAdmin?.role === 'team_viewer';

  return (
    <header className="sticky top-0 z-30 bg-[#000000] border-b border-white/10 text-white select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveTab(isTeamViewer ? 'schedule' : 'overview')}
              className="text-left group cursor-pointer focus:outline-none flex items-center gap-2.5"
            >
              <div className="w-8 h-8 rounded bg-black border border-white/20 p-1 flex items-center justify-center shrink-0 shadow-xs group-hover:border-[#ff4d00] transition-colors overflow-hidden">
                <img
                  src="/kingdc_logo.png"
                  alt="KING DC"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/kingdc_logo.svg';
                  }}
                />
              </div>
              <span className="text-xl font-extrabold tracking-tighter text-white group-hover:text-[#ff4d00] transition-colors font-syne uppercase">
                KingDC
              </span>
            </button>
            <span className={`hidden sm:inline-flex items-center gap-1 text-[10px] font-mono-tech uppercase tracking-widest px-2 py-0.5 rounded-xs ${
              isTeamViewer 
                ? 'bg-white/10 text-emerald-400 border border-emerald-500/30' 
                : 'bg-white/10 text-white/60 border border-white/10'
            }`}>
              {isTeamViewer ? 'Portal Tim Peserta' : 'Command Center v4.3'}
            </span>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-5 text-xs font-mono-tech tracking-wider text-white/60">
            {isTeamViewer ? (
              // Team Portal Links: Pendaftaran Tim, Jadwal & Hasil, Match Summary, Profil Seluruh Tim, and Ringkasan
              <>
                <button
                  onClick={() => setActiveTab('registration')}
                  className={`transition-colors relative py-1.5 px-2 hover:text-white cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'registration' ? 'text-[#ff4d00] font-bold border-b-2 border-[#ff4d00]' : ''
                  }`}
                >
                  <span>PENDAFTARAN TIM</span>
                  <span className="px-1 py-0.2 rounded-2xs bg-[#ff4d00] text-black text-[9px] font-bold">PORTAL</span>
                </button>
                <button
                  onClick={() => setActiveTab('schedule')}
                  className={`transition-colors relative py-1.5 px-2 hover:text-white cursor-pointer ${
                    activeTab === 'schedule' ? 'text-[#ff4d00] font-bold border-b-2 border-[#ff4d00]' : ''
                  }`}
                >
                  JADWAL & HASIL
                </button>
                <button
                  onClick={() => setActiveTab('match_summary')}
                  className={`transition-colors relative py-1.5 px-2 hover:text-white cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'match_summary' ? 'text-[#ff4d00] font-bold border-b-2 border-[#ff4d00]' : ''
                  }`}
                >
                  <span>MATCH SUMMARY</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d00] inline-block" />
                </button>
                <button
                  onClick={() => setActiveTab('teams')}
                  className={`transition-colors relative py-1.5 px-2 hover:text-white cursor-pointer ${
                    activeTab === 'teams' ? 'text-[#ff4d00] font-bold border-b-2 border-[#ff4d00]' : ''
                  }`}
                >
                  DIREKTORI TIM
                </button>
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`transition-colors relative py-1.5 px-2 hover:text-white cursor-pointer ${
                    activeTab === 'overview' ? 'text-[#ff4d00] font-bold border-b-2 border-[#ff4d00]' : ''
                  }`}
                >
                  RINGKASAN
                </button>
              </>
            ) : (
              // Committee / Admin Links
              <>
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`transition-colors relative py-1.5 px-2 hover:text-white cursor-pointer ${
                    activeTab === 'overview' ? 'text-[#ff4d00] font-bold border-b-2 border-[#ff4d00]' : ''
                  }`}
                >
                  RINGKASAN
                </button>
                <button
                  onClick={() => setActiveTab('teams')}
                  className={`transition-colors relative py-1.5 px-2 hover:text-white cursor-pointer ${
                    activeTab === 'teams' ? 'text-[#ff4d00] font-bold border-b-2 border-[#ff4d00]' : ''
                  }`}
                >
                  DIREKTORI TIM
                </button>
                <button
                  onClick={() => setActiveTab('screening')}
                  className={`transition-colors relative py-1.5 px-2 hover:text-white cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'screening' ? 'text-[#ff4d00] font-bold border-b-2 border-[#ff4d00]' : ''
                  }`}
                >
                  <span>SCREENING</span>
                  {pendingScreeningCount > 0 && (
                    <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[9px] font-bold text-black bg-[#ff4d00] rounded-xs tabular-nums">
                      {pendingScreeningCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('drawing')}
                  className={`transition-colors relative py-1.5 px-2 hover:text-white cursor-pointer ${
                    activeTab === 'drawing' ? 'text-[#ff4d00] font-bold border-b-2 border-[#ff4d00]' : ''
                  }`}
                >
                  DRAWING
                </button>
                <button
                  onClick={() => setActiveTab('schedule')}
                  className={`transition-colors relative py-1.5 px-2 hover:text-white cursor-pointer ${
                    activeTab === 'schedule' ? 'text-[#ff4d00] font-bold border-b-2 border-[#ff4d00]' : ''
                  }`}
                >
                  JADWAL
                </button>
                <button
                  onClick={() => setActiveTab('match_summary')}
                  className={`transition-colors relative py-1.5 px-2 hover:text-white cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'match_summary' ? 'text-[#ff4d00] font-bold border-b-2 border-[#ff4d00]' : ''
                  }`}
                >
                  <span>SUMMARY</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d00] inline-block" />
                </button>
                <button
                  onClick={() => setActiveTab('finance')}
                  className={`transition-colors relative py-1.5 px-2 hover:text-white cursor-pointer ${
                    activeTab === 'finance' ? 'text-[#ff4d00] font-bold border-b-2 border-[#ff4d00]' : ''
                  }`}
                >
                  KEUANGAN
                </button>
                <button
                  onClick={() => setActiveTab('documents')}
                  className={`transition-colors relative py-1.5 px-2 hover:text-white cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'documents' ? 'text-[#ff4d00] font-bold border-b-2 border-[#ff4d00]' : ''
                  }`}
                >
                  <span>DOKUMEN</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40 font-mono-tech font-bold">
                    DB
                  </span>
                </button>
              </>
            )}
          </nav>

          {/* Zone 3: Header Actions & User Profile */}
          <div className="flex items-center gap-2">
            {!isTeamViewer && (
              <>
                <button
                  onClick={onOpenSettingsModal}
                  title="Pengaturan Turnamen"
                  className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer"
                >
                  <Settings className="w-4 h-4" />
                </button>

                <button
                  onClick={onOpenRegisterModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono-tech font-bold uppercase tracking-wider text-white bg-[#ff4d00] hover:bg-[#ff651a] rounded transition-colors whitespace-nowrap shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">REGISTER TIM</span>
                </button>
              </>
            )}

            {/* User Profile & Logout */}
            {currentAdmin && (
              <div className="flex items-center pl-2 ml-1 border-l border-white/10 gap-2 font-mono-tech">
                <div className="hidden lg:block text-right">
                  <div className="text-xs font-bold text-white leading-tight">
                    {currentAdmin.name}
                  </div>
                  <div className="text-[10px] text-[#ff4d00] uppercase tracking-wider">
                    {currentAdmin.roleLabel}
                  </div>
                </div>

                <div 
                  className="w-8 h-8 rounded border border-[#ff4d00] font-bold text-xs flex items-center justify-center text-[#ff4d00] bg-black"
                  title={`${currentAdmin.name} (${currentAdmin.roleLabel})`}
                >
                  {currentAdmin.name.charAt(0)}
                </div>

                {onLogout && (
                  <button
                    onClick={onLogout}
                    title={isTeamViewer ? "Keluar dari Sesi Tim" : "Keluar dari Akun Admin"}
                    className="p-1.5 text-white/40 hover:text-[#ff4d00] hover:bg-white/10 rounded transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around border-t border-white/10 py-2 text-[10px] font-mono-tech uppercase tracking-wider">
          {isTeamViewer ? (
            <>
              <button
                onClick={() => setActiveTab('registration')}
                className={`py-1 px-2 ${activeTab === 'registration' ? 'text-[#ff4d00] font-bold' : 'text-white/60'}`}
              >
                Pendaftaran
              </button>
              <button
                onClick={() => setActiveTab('schedule')}
                className={`py-1 px-2 ${activeTab === 'schedule' ? 'text-[#ff4d00] font-bold' : 'text-white/60'}`}
              >
                Jadwal
              </button>
              <button
                onClick={() => setActiveTab('match_summary')}
                className={`py-1 px-2 ${activeTab === 'match_summary' ? 'text-[#ff4d00] font-bold' : 'text-white/60'}`}
              >
                Summary
              </button>
              <button
                onClick={() => setActiveTab('teams')}
                className={`py-1 px-2 ${activeTab === 'teams' ? 'text-[#ff4d00] font-bold' : 'text-white/60'}`}
              >
                Tim
              </button>
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-1 px-2 ${activeTab === 'overview' ? 'text-[#ff4d00] font-bold' : 'text-white/60'}`}
              >
                Ringkasan
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-1 px-2 ${activeTab === 'overview' ? 'text-[#ff4d00] font-bold' : 'text-white/60'}`}
              >
                Ringkasan
              </button>
              <button
                onClick={() => setActiveTab('teams')}
                className={`py-1 px-2 ${activeTab === 'teams' ? 'text-[#ff4d00] font-bold' : 'text-white/60'}`}
              >
                Tim
              </button>
              <button
                onClick={() => setActiveTab('screening')}
                className={`py-1 px-2 flex items-center gap-1 ${activeTab === 'screening' ? 'text-[#ff4d00] font-bold' : 'text-white/60'}`}
              >
                Screening
                {pendingScreeningCount > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d00] inline-block" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('drawing')}
                className={`py-1 px-2 ${activeTab === 'drawing' ? 'text-[#ff4d00] font-bold' : 'text-white/60'}`}
              >
                Drawing
              </button>
              <button
                onClick={() => setActiveTab('schedule')}
                className={`py-1 px-2 ${activeTab === 'schedule' ? 'text-[#ff4d00] font-bold' : 'text-white/60'}`}
              >
                Jadwal
              </button>
              <button
                onClick={() => setActiveTab('match_summary')}
                className={`py-1 px-2 ${activeTab === 'match_summary' ? 'text-[#ff4d00] font-bold' : 'text-white/60'}`}
              >
                Summary
              </button>
              <button
                onClick={() => setActiveTab('finance')}
                className={`py-1 px-2 ${activeTab === 'finance' ? 'text-[#ff4d00] font-bold' : 'text-white/60'}`}
              >
                Keuangan
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`py-1 px-2 ${activeTab === 'documents' ? 'text-[#ff4d00] font-bold' : 'text-white/60'}`}
              >
                Dokumen
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

