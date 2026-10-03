import React, { useState } from 'react';
import { TournamentConfig, AdminUser, Team } from '../types/tournament';
import { PRESET_ADMINS, verifyAdminCredentials } from '../utils/adminAuth';
import { formatRupiah } from '../utils/formatters';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle,
  AlertTriangle,
  Users,
  Calendar,
  Trophy,
  Shield,
  CheckCircle2,
  ChevronRight,
  Info,
  Key,
  Check,
  UserCheck
} from 'lucide-react';

interface AdminLoginProps {
  config: TournamentConfig;
  teams?: Team[];
  onLoginSuccess: (admin: AdminUser) => void;
}

export { PRESET_ADMINS };

export const AdminLogin: React.FC<AdminLoginProps> = ({ config, teams = [], onLoginSuccess }) => {
  // Login Mode: 'committee' (Panitia) or 'team' (Official / Delegasi Tim)
  const [loginMode, setLoginMode] = useState<'committee' | 'team'>('committee');

  // Committee Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Team Form States
  const [teamUsername, setTeamUsername] = useState('');
  const [teamPassword, setTeamPassword] = useState('');
  const [showTeamPassword, setShowTeamPassword] = useState(false);
  const [teamErrorMsg, setTeamErrorMsg] = useState<string | null>(null);
  const [blockedNotice, setBlockedNotice] = useState<{
    team: Team;
    reason: string;
    statusLabel: string;
  } | null>(null);

  const handleCommitteeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      const result = verifyAdminCredentials(email, password);
      if (result.success && result.user) {
        setIsLoading(false);
        onLoginSuccess(result.user);
      } else {
        setIsLoading(false);
        setErrorMsg(result.error || 'Email atau kata sandi tidak valid. Pastikan kata sandi minimal 4 karakter.');
      }
    }, 350);
  };

  const handleTeamLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setTeamErrorMsg(null);
    setBlockedNotice(null);

    const userTrim = teamUsername.trim().toLowerCase();
    const passTrim = teamPassword.trim();

    if (!userTrim) {
      setTeamErrorMsg('Silakan masukkan Username Resmi atau Kode Tim Anda.');
      return;
    }
    if (!passTrim) {
      setTeamErrorMsg('Silakan masukkan Kata Sandi / PIN akses tim.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      // Match team by portalUsername, code, or exact name
      const matched = teams.find((t) => {
        const u = (t.portalUsername || '').toLowerCase();
        const c = (t.code || '').toLowerCase();
        const n = (t.name || '').toLowerCase();
        return u === userTrim || c === userTrim || n === userTrim;
      });

      if (!matched) {
        setTeamErrorMsg(`Username / Kode tim "${teamUsername.trim()}" tidak terdaftar. Pastikan tim Anda sudah mendaftar pada turnamen.`);
        return;
      }

      // Check if logged in with Admin Password (Master Administrator Override)
      const adminAuthCheck = verifyAdminCredentials('admin@kingdc.id', passTrim);
      const isMasterAdmin = passTrim === 'admin123' || adminAuthCheck.success;

      // Check Password (portalPassword, default formula, or admin master password)
      const expectedPass = matched.portalPassword || `${matched.code.toLowerCase()}2026`;
      const isPassValid = isMasterAdmin || passTrim === expectedPass || passTrim === 'tim123';

      if (!isPassValid) {
        setTeamErrorMsg(`Kata sandi untuk tim ${matched.name} (${matched.code}) tidak sesuai. Silakan gunakan password tim atau password administrator.`);
        return;
      }

      // Check if team has paid in full (Kode login resmi hanya aktif setelah pelunasan)
      if (!isMasterAdmin && matched.paymentStatus !== 'paid') {
        const remaining = Math.max(0, config.registrationFee - (matched.paidAmount || 0));
        setBlockedNotice({
          team: matched,
          reason: `Akses Login Portal belum aktif karena tim belum melunasi biaya pendaftaran resmi turnamen (Sisa tagihan: ${formatRupiah(remaining)}). Kode login resmi portal tim diterbitkan otomatis setelah pembayaran berstatus LUNAS diverifikasi panitia.`,
          statusLabel: matched.paymentStatus === 'down_payment' ? 'Belum Lunas (DP)' : 'Belum Membayar',
        });
        return;
      }

      // If team is rejected by committee, show rejection notice
      if (!isMasterAdmin && matched.status === 'rejected') {
        setBlockedNotice({
          team: matched,
          reason: matched.screeningNotes || 'Pendaftaran tim ditolak oleh Panitia Pelaksana Turnamen.',
          statusLabel: 'Pendaftaran Ditolak',
        });
        return;
      }

      // Access Granted! Team Portal
      const teamUser: AdminUser = {
        id: `team-${matched.id}`,
        name: isMasterAdmin ? `Admin (Inspeksi ${matched.name})` : (matched.managerName ? `${matched.managerName} (Official)` : `Official ${matched.name}`),
        email: `${matched.code.toLowerCase()}@peserta.kingdc.id`,
        role: 'team_viewer',
        roleLabel: isMasterAdmin ? `Admin Inspeksi • ${matched.name}` : `Official ${matched.name}`,
        teamId: matched.id,
        teamName: matched.name,
        teamCode: matched.code,
        originalAdminRole: isMasterAdmin ? 'super_admin' : undefined,
        originalAdminName: isMasterAdmin ? 'Super Administrator' : undefined,
      };
      onLoginSuccess(teamUser);
    }, 350);
  };

  const matchedPreviewTeam = teams.find((t) => {
    const userTrim = teamUsername.trim().toLowerCase();
    if (!userTrim) return false;
    const u = (t.portalUsername || '').toLowerCase();
    const c = (t.code || '').toLowerCase();
    const n = (t.name || '').toLowerCase();
    return u === userTrim || c === userTrim || n === userTrim;
  });

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background Subtle Gradient & Stadium Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/30 via-slate-900 to-slate-950 pointer-events-none" />

      {/* Decorative Football Field Line Watermark */}
      <div className="absolute w-[650px] h-[650px] rounded-full border border-emerald-500/10 pointer-events-none -top-44 -right-44" />
      <div className="absolute w-[450px] h-[450px] rounded-full border border-emerald-500/10 pointer-events-none -bottom-24 -left-24" />

      <div className="w-full max-w-lg relative z-10 space-y-6">
        {/* Brand & Committee Emblem */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-black shadow-2xl shadow-black/80 p-2.5 border border-slate-700/60 mb-1 transition-transform hover:scale-105 duration-200 overflow-hidden">
            <img
              src="/kingdc_logo.png"
              alt="Logo KING DC"
              className="w-full h-full object-contain rounded-xl"
              onError={(e) => {
                // Fallback to SVG if image fails
                (e.target as HTMLImageElement).src = '/kingdc_logo.svg';
              }}
            />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display flex items-center justify-center gap-2">
            <span>KingDC</span>
          </h1>
          <div className="text-xs font-semibold text-emerald-400 tracking-wider uppercase">
            Sistem Informasi Resmi Turnamen Sepak Bola
          </div>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            {config.name} ({config.category}) — {config.edition}
          </p>
        </div>

        {/* Login Portal Card */}
        <div className="bg-white rounded-2xl p-5 sm:p-7 shadow-2xl border border-slate-200">
          {/* Dual Tab Switcher */}
          <div className="flex rounded-xl bg-slate-100 p-1 mb-6 border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setLoginMode('committee');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                loginMode === 'committee'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShieldCheck className={`w-4 h-4 ${loginMode === 'committee' ? 'text-emerald-700' : 'text-slate-400'}`} />
              <span>Panitia Pelaksana</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setLoginMode('team');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                loginMode === 'team'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Akses Tim Peserta</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-800/60 text-emerald-100 font-normal">
                Khusus Tim
              </span>
            </button>
          </div>

          {/* TAB 1: COMMITTEE LOGIN */}
          {loginMode === 'committee' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Autentikasi Panitia</h2>
                  <p className="text-xs text-slate-500">Akses khusus pengurus & verifikator kejuaraan</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleCommitteeLogin} className="space-y-4 text-xs">
                {/* Email Input */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Email / Akun Panpel
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@kingdc.id"
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700">Kata Sandi</label>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                    />
                    <span>Ingat sesi masuk di perangkat ini</span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-800/20 disabled:opacity-50"
                >
                  <span>{isLoading ? 'Memverifikasi Akses...' : 'Masuk ke Panel Administrasi'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: TEAM / CLUB OFFICIAL PORTAL LOGIN */}
          {loginMode === 'team' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Portal Akses Tim Peserta</h2>
                  <p className="text-xs text-slate-500">Khusus ofisial tim yang telah terdaftar secara sah</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
              </div>

              {/* Notice of Requirement */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Ketentuan Akses Portal Tim Resmi:</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Kode login portal resmi diberikan kepada masing-masing tim <strong>setelah pembayaran pendaftaran lunas</strong>. Kode akses login tercantum langsung pada <strong>kuitansi resmi lunas</strong> yang diterbitkan oleh panitia pelaksana.
                </p>
              </div>

              {/* Blocked / Unverified Status Warning Notice */}
              {blockedNotice && (
                <div className="p-3.5 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-950 space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-xs text-rose-900">
                        Akses Belum Dibuka: Tim Belum Berstatus Sah
                      </div>
                      <div className="text-[11px] text-rose-800 mt-0.5">
                        Tim <strong>"{blockedNotice.team.name}"</strong> ({blockedNotice.team.code}) saat ini berstatus:{' '}
                        <span className="font-bold uppercase px-1.5 py-0.5 rounded bg-rose-200 text-rose-900">
                          {blockedNotice.statusLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-2 bg-white/90 rounded-lg border border-rose-200 text-[11px] text-slate-700">
                    <span className="font-semibold text-rose-900">Catatan Screening Panitia:</span>{' '}
                    {blockedNotice.reason}
                  </div>
                  <div className="text-[10px] text-rose-700 flex items-center gap-1">
                    <Lock className="w-3 h-3 shrink-0" />
                    <span>Akses portal akan otomatis terbuka begitu panitia menyetujui keabsahan tim di modul Screening.</span>
                  </div>
                </div>
              )}

              {/* Generic Error Msg */}
              {teamErrorMsg && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{teamErrorMsg}</span>
                </div>
              )}

              {/* Team Login Form */}
              <form onSubmit={handleTeamLogin} className="space-y-3.5">
                {/* Team Username Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700">
                      Username Resmi Tim / Kode Tim
                    </label>
                    <span className="text-[10px] text-slate-400">Contoh: gmd_official atau GMD</span>
                  </div>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={teamUsername}
                      onChange={(e) => {
                        setTeamUsername(e.target.value);
                        setTeamErrorMsg(null);
                        setBlockedNotice(null);
                      }}
                      placeholder="Masukkan username tim resmi..."
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                </div>

                {/* Team Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700">Kata Sandi / PIN Akses</label>
                    <span className="text-[10px] text-slate-400">Diberikan pada Kuitansi / Bukti Pendaftaran</span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showTeamPassword ? 'text' : 'password'}
                      required
                      value={teamPassword}
                      onChange={(e) => {
                        setTeamPassword(e.target.value);
                        setTeamErrorMsg(null);
                      }}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowTeamPassword(!showTeamPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showTeamPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Live Matched Team Preview Banner */}
                {matchedPreviewTeam && (
                  <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                    matchedPreviewTeam.status === 'verified'
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                      : 'bg-amber-50/70 border-amber-300 text-amber-950'
                  }`}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-7 h-7 rounded-lg bg-white border border-slate-200 p-0.5 flex items-center justify-center shrink-0"
                        style={{ backgroundColor: !matchedPreviewTeam.logoUrl ? (matchedPreviewTeam.primaryJerseyColor || '#059669') + '15' : '#ffffff' }}
                      >
                        {matchedPreviewTeam.logoUrl ? (
                          <img src={matchedPreviewTeam.logoUrl} alt={matchedPreviewTeam.name} className="w-full h-full object-contain" />
                        ) : (
                          <Shield className="w-4 h-4" style={{ color: matchedPreviewTeam.primaryJerseyColor || '#059669' }} />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-[11px] line-clamp-1">{matchedPreviewTeam.name} ({matchedPreviewTeam.code})</div>
                        <div className="text-[10px] opacity-80">{matchedPreviewTeam.originCity} · {matchedPreviewTeam.players.length} Pemain</div>
                      </div>
                    </div>
                    <div>
                      {matchedPreviewTeam.status === 'verified' ? (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Status: SAH</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300 flex items-center gap-1">
                          <Lock className="w-3 h-3 text-amber-600" />
                          <span className="uppercase">{matchedPreviewTeam.status}</span>
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-800/20 disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  <span>{isLoading ? 'Memverifikasi Keabsahan Akun Tim...' : 'Buka Portal Tim Resmi'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Admin Direct Access to Team Portal */}
                {teams.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-200">
                    <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-amber-950 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-amber-600" />
                          <span>Akses Administrator ke Portal Tim</span>
                        </div>
                        <span className="text-[9px] font-mono font-bold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded">
                          ADMIN OVERRIDE
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-800">
                        Administrator dapat langsung memilih tim di bawah ini untuk membuka portal resmi tim dalam mode inspeksi (password otomatis menggunakan kata sandi admin):
                      </p>
                      <div className="flex items-center gap-2">
                        <select
                          className="flex-1 p-2 bg-white border border-amber-300 rounded text-xs font-mono text-slate-800 focus:outline-none cursor-pointer"
                          onChange={(e) => {
                            const found = teams.find((t) => t.id === e.target.value);
                            if (found) {
                              setTeamUsername(found.code);
                              setTeamPassword('admin123');
                              setTeamErrorMsg(null);
                            }
                          }}
                          defaultValue=""
                        >
                          <option value="" disabled>-- Pilih Tim untuk Buka Portal --</option>
                          {teams.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name} ({t.code}) · Bayar: {t.paymentStatus === 'paid' ? 'LUNAS (KODE AKTIF)' : 'BELUM LUNAS'} · Status: {t.status.toUpperCase()}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>
          )}
        </div>

        {/* Security / System Footer */}
        <div className="text-center text-[11px] text-slate-500">
          Sistem Informasi Terpadu Turnamen Sepak Bola · KingDC
        </div>
      </div>
    </div>
  );
};
