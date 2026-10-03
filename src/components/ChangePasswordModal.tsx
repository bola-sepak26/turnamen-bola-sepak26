import React, { useState } from 'react';
import { AdminUser } from '../types/tournament.ts';
import { getAdminPassword, updateAdminPassword } from '../utils/adminAuth.ts';
import { 
  X, 
  Key, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAdmin: AdminUser | null;
  onPasswordChanged?: (msg: string) => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  currentAdmin,
  onPasswordChanged,
}) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !currentAdmin) return null;

  const resetForm = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validation
    if (!oldPassword.trim()) {
      setErrorMsg('Silakan masukkan kata sandi saat ini.');
      return;
    }

    const currentActualPassword = getAdminPassword(currentAdmin.email);
    if (oldPassword !== currentActualPassword) {
      setErrorMsg('Kata sandi saat ini salah. Pastikan Anda memasukkan kata sandi yang benar.');
      return;
    }

    if (newPassword.length < 4) {
      setErrorMsg('Kata sandi baru harus minimal 4 karakter.');
      return;
    }

    if (newPassword === oldPassword) {
      setErrorMsg('Kata sandi baru tidak boleh sama dengan kata sandi lama.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi baru tidak cocok. Periksa kembali.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      updateAdminPassword(currentAdmin.email, newPassword);
      setIsSubmitting(false);
      const successText = `Kata sandi akun "${currentAdmin.name}" berhasil diperbarui!`;
      setSuccessMsg(successText);
      if (onPasswordChanged) {
        onPasswordChanged(successText);
      }

      setTimeout(() => {
        handleClose();
      }, 1500);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xs max-w-md w-full shadow-2xl border-2 border-black overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-black text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xs bg-[#ff4d00] flex items-center justify-center text-white shrink-0">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-syne font-extrabold text-sm uppercase tracking-tight text-white">
                Ganti Kata Sandi Admin
              </h2>
              <div className="text-[10px] font-mono-tech text-white/70">
                Pembaruan Kredensial Keamanan Akun
              </div>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card Info */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 border border-black bg-white text-black flex items-center justify-center font-mono-tech text-sm font-black rounded-xs shrink-0">
              {currentAdmin.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-black truncate">{currentAdmin.name}</div>
              <div className="text-[11px] font-mono-tech text-slate-600 truncate">{currentAdmin.email}</div>
            </div>
          </div>
          <span className="text-[10px] font-mono-tech font-bold uppercase px-2 py-0.5 bg-white border border-slate-300 text-black rounded-xs shrink-0">
            {currentAdmin.roleLabel || 'Administrator'}
          </span>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-900 rounded-xs flex items-start gap-2 text-xs">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="leading-tight font-medium">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-900 rounded-xs flex items-center gap-2 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Old Password */}
          <div>
            <label className="block font-mono-tech text-[10px] uppercase tracking-wider font-bold text-black mb-1.5">
              Kata Sandi Saat Ini <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showOldPassword ? 'text' : 'password'}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Masukkan kata sandi saat ini"
                required
                className="w-full pl-3 pr-10 py-2.5 bg-white border border-slate-300 rounded-xs text-black font-mono-tech text-xs placeholder:text-slate-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black cursor-pointer"
                title={showOldPassword ? 'Sembunyikan' : 'Tampilkan'}
              >
                {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block font-mono-tech text-[10px] uppercase tracking-wider font-bold text-black mb-1.5">
              Kata Sandi Baru <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 4 karakter"
                required
                minLength={4}
                className="w-full pl-3 pr-10 py-2.5 bg-white border border-slate-300 rounded-xs text-black font-mono-tech text-xs placeholder:text-slate-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black cursor-pointer"
                title={showNewPassword ? 'Sembunyikan' : 'Tampilkan'}
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {newPassword && (
              <div className="mt-1 text-[10px] font-mono-tech flex items-center justify-between text-slate-500">
                <span>Panjang: {newPassword.length} karakter</span>
                <span className={newPassword.length >= 6 ? 'text-emerald-600 font-bold' : 'text-amber-600'}>
                  {newPassword.length >= 6 ? 'Kekuatan: Baik' : 'Kekuatan: Cukup'}
                </span>
              </div>
            )}
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block font-mono-tech text-[10px] uppercase tracking-wider font-bold text-black mb-1.5">
              Ulangi Kata Sandi Baru <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ketik ulang kata sandi baru"
                required
                className="w-full pl-3 pr-10 py-2.5 bg-white border border-slate-300 rounded-xs text-black font-mono-tech text-xs placeholder:text-slate-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black cursor-pointer"
                title={showConfirmPassword ? 'Sembunyikan' : 'Tampilkan'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword && (
              <div className="mt-1 text-[10px] font-mono-tech">
                {confirmPassword === newPassword ? (
                  <span className="text-emerald-600 flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-3 h-3" /> Kata sandi cocok
                  </span>
                ) : (
                  <span className="text-red-500 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" /> Konfirmasi tidak cocok
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-slate-300 text-black hover:bg-slate-100 rounded-xs font-mono-tech text-xs font-bold transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !!successMsg}
              className="px-5 py-2 bg-black hover:bg-[#ff4d00] text-white rounded-xs font-mono-tech text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Simpan Kata Sandi</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
