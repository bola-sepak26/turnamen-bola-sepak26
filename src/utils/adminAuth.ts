import { AdminUser } from '../types/tournament.ts';

export interface AdminCredential {
  user: AdminUser;
  defaultPassword: string;
  description: string;
  icon: string;
}

export const PRESET_ADMINS: AdminCredential[] = [
  {
    user: {
      id: 'adm-01',
      name: 'Portaz Da Cruz',
      email: 'admin@kingdc.id',
      role: 'super_admin',
      roleLabel: 'Ketua Panpel (Akses Penuh)',
    },
    defaultPassword: 'admin123',
    description: 'Akses penuh seluruh modul regulasi, persetujuan tim, undian grup, dan keuangan.',
    icon: '👑',
  },
  {
    user: {
      id: 'adm-02',
      name: 'Marno Janga',
      email: 'screening@kingdc.id',
      role: 'screening',
      roleLabel: 'Komisi Keabsahan & Screening',
    },
    defaultPassword: 'screening123',
    description: 'Fokus verifikasi berkas pemain, NIK, akta lahir, dan audit nomor punggung.',
    icon: '📋',
  },
  {
    user: {
      id: 'adm-03',
      name: 'Alda Wasa',
      email: 'bendahara@kingdc.id',
      role: 'finance',
      roleLabel: 'Bendahara Panitia Pelaksana',
    },
    defaultPassword: 'keuangan123',
    description: 'Penerbitan kuitansi resmi, buku kas registrasi tim, dan rekonsiliasi DP.',
    icon: '💰',
  },
];

const ADMIN_PASSWORDS_STORAGE_KEY = 'kingdc_admin_passwords';

export function getCustomPasswords(): Record<string, string> {
  try {
    const raw = localStorage.getItem(ADMIN_PASSWORDS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getAdminPassword(email: string): string {
  const normEmail = email.trim().toLowerCase();
  const custom = getCustomPasswords();
  if (custom[normEmail]) {
    return custom[normEmail];
  }
  const preset = PRESET_ADMINS.find((p) => p.user.email.toLowerCase() === normEmail);
  return preset ? preset.defaultPassword : 'admin123';
}

export function updateAdminPassword(email: string, newPassword: string): void {
  const normEmail = email.trim().toLowerCase();
  const custom = getCustomPasswords();
  custom[normEmail] = newPassword;
  localStorage.setItem(ADMIN_PASSWORDS_STORAGE_KEY, JSON.stringify(custom));

  // Sync with backend API asynchronously
  fetch('/api/admin/change-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: normEmail, newPassword }),
  }).catch((err) => {
    console.warn('Backend sync warning for password update:', err);
  });
}

export function verifyAdminCredentials(
  email: string,
  passwordAttempt: string
): { success: boolean; user?: AdminUser; error?: string } {
  const normEmail = email.trim().toLowerCase();
  const currentPassword = getAdminPassword(normEmail);

  const preset = PRESET_ADMINS.find((p) => p.user.email.toLowerCase() === normEmail);
  if (preset) {
    if (currentPassword === passwordAttempt) {
      return { success: true, user: preset.user };
    }
    return { success: false, error: 'Kata sandi tidak sesuai untuk akun ini.' };
  }

  // Allow custom admin email if entered
  if (normEmail && passwordAttempt.length >= 4) {
    const custom = getCustomPasswords();
    if (custom[normEmail] && custom[normEmail] !== passwordAttempt) {
      return { success: false, error: 'Kata sandi tidak sesuai untuk akun ini.' };
    }
    return {
      success: true,
      user: {
        id: `adm-${normEmail.replace(/[^a-zA-Z0-9]/g, '')}`,
        name: normEmail.split('@')[0].toUpperCase(),
        email: normEmail,
        role: 'super_admin',
        roleLabel: 'Administrator Panpel',
      },
    };
  }

  return { success: false, error: 'Email atau kata sandi tidak valid. Minimal 4 karakter.' };
}
