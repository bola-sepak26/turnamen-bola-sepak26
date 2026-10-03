import { Team, TournamentConfig } from '../types/tournament';

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateIndo(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
}

export function calculateAge(birthDateStr: string, referenceDateStr?: string): number {
  if (!birthDateStr) return 0;
  const birthDate = new Date(birthDateStr);
  const refDate = referenceDateStr ? new Date(referenceDateStr) : new Date();
  
  let age = refDate.getFullYear() - birthDate.getFullYear();
  const m = refDate.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && refDate.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export interface TeamValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  overagePlayersCount: number;
  duplicateNumbers: number[];
}

export function validateTeamEligibility(team: Team, config: TournamentConfig): TeamValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let overagePlayersCount = 0;
  const duplicateNumbers: number[] = [];

  // Check player count
  if (team.players.length < config.minPlayersPerTeam) {
    errors.push(`Jumlah pemain (${team.players.length}) kurang dari batas minimum (${config.minPlayersPerTeam} pemain)`);
  }
  if (team.players.length > config.maxPlayersPerTeam) {
    errors.push(`Jumlah pemain (${team.players.length}) melebihi batas kuota maksimal (${config.maxPlayersPerTeam} pemain)`);
  }

  // Check duplicate jersey numbers
  const numberSeen = new Set<number>();
  for (const player of team.players) {
    if (numberSeen.has(player.number)) {
      duplicateNumbers.push(player.number);
    } else {
      numberSeen.add(player.number);
    }
  }
  if (duplicateNumbers.length > 0) {
    errors.push(`Nomor punggung ganda terdeteksi: #${duplicateNumbers.join(', #')}`);
  }

  // Check age constraints
  for (const player of team.players) {
    const age = calculateAge(player.birthDate, config.tournamentStartDate);
    if (config.maxAgeLimit < 90 && age > config.maxAgeLimit) {
      overagePlayersCount++;
    }
  }
  if (overagePlayersCount > 0) {
    errors.push(`${overagePlayersCount} pemain melebihi batas usia kategori ${config.category} (Maks ${config.maxAgeLimit} tahun)`);
  }

  // Check official 5 composition requirements (1 Pelatih Kepala, 2 Asisten Pelatih, 1 Medis, 1 Manajer)
  const managerCount = team.officials.filter(o => o.role === 'Manajer' && o.name.trim()).length;
  const headCoachCount = team.officials.filter(o => o.role === 'Pelatih Kepala' && o.name.trim()).length;
  const assistantCount = team.officials.filter(o => o.role === 'Asisten Pelatih' && o.name.trim()).length;
  const medicCount = team.officials.filter(o => o.role === 'Medis/Fisioterapis' && o.name.trim()).length;

  if (managerCount === 0 && !team.managerName?.trim()) {
    errors.push('Official tim wajib memiliki 1 Manajer Tim');
  }
  if (headCoachCount === 0 && !team.headCoachName?.trim()) {
    errors.push('Official tim wajib memiliki 1 Pelatih Kepala');
  }
  if (assistantCount < 2) {
    warnings.push(`Official tim membutuhkan 2 Asisten Pelatih (saat ini terdaftar: ${assistantCount})`);
  }
  if (medicCount === 0) {
    warnings.push('Official tim membutuhkan 1 Tenaga Medis / Fisioterapis');
  }

  // Check goalkeeper presence
  const gkCount = team.players.filter(p => p.position === 'GK').length;
  if (gkCount === 0) {
    errors.push('Tim belum mendaftarkan Penjaga Gawang (GK)');
  } else if (gkCount < 2) {
    warnings.push('Disarankan mendaftarkan minimal 2 Penjaga Gawang (GK) untuk cadangan');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    overagePlayersCount,
    duplicateNumbers,
  };
}

export function generateReceiptNumber(teamCode: string): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `KWT-LP/${year}/${teamCode.toUpperCase()}-${rand}`;
}
