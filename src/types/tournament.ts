export type PlayerPosition = 'GK' | 'DF' | 'MF' | 'FW';

export type NavTab = 'overview' | 'registration' | 'teams' | 'screening' | 'drawing' | 'schedule' | 'match_summary' | 'finance' | 'documents';

export type DocumentCategory = 
  | 'ktp_kia' 
  | 'akta_ijazah' 
  | 'bpjs' 
  | 'payment_receipt' 
  | 'dsp' 
  | 'sk_tim' 
  | 'other';

export type DocumentVerificationStatus = 'verified' | 'pending' | 'rejected';

export interface TournamentDocument {
  id: string;
  teamId?: string;
  teamName?: string;
  playerId?: string;
  playerName?: string;
  title: string;
  category: DocumentCategory;
  fileUrl: string;
  fileType?: string;
  fileSizeKb?: number;
  storageProvider: 'supabase' | 'cloud_sql' | 'local';
  verificationStatus: DocumentVerificationStatus;
  uploadedBy: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type UserRole = 'super_admin' | 'screening' | 'finance' | 'team_viewer';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  avatarUrl?: string;
  teamId?: string;
  teamName?: string;
  teamCode?: string;
  originalAdminRole?: UserRole;
  originalAdminName?: string;
}

export type TeamStatus = 'pending' | 'verified' | 'action_required' | 'rejected';

export type PaymentStatus = 'unpaid' | 'down_payment' | 'paid';

export type OfficialRole = 'Manajer' | 'Pelatih Kepala' | 'Asisten Pelatih' | 'Medis/Fisioterapis' | 'Kitman';

export interface Player {
  id: string;
  number: number;
  name: string;
  position: PlayerPosition;
  birthDate: string; // YYYY-MM-DD
  nik?: string; // Optional legacy ID
  nisn?: string; // Nomor Induk Siswa Nasional
  photoUrl?: string;
  ktpPhotoUrl?: string; // Foto KTP / Kartu Identitas Anak (KIA)
  bpjsPhotoUrl?: string; // Foto Kartu Kepesertaan BPJS Ketenagakerjaan
  isCaptain?: boolean;
  isVerified?: boolean;
  documentNote?: string;
  heightCm?: number;
  weightKg?: number;
}

export interface OfficialStaff {
  id: string;
  name: string;
  role: OfficialRole;
  phone: string;
  photoUrl?: string;
}

export interface Team {
  id: string;
  name: string;
  code: string; // 3-4 letters e.g. "GMD", "PER"
  originCity: string;
  originProvince: string;
  establishedYear: number;
  logoUrl?: string;
  primaryJerseyColor: string; // Hex or color name
  secondaryJerseyColor: string;
  managerName: string;
  managerPhone: string;
  headCoachName: string;
  players: Player[];
  officials: OfficialStaff[];
  registrationDate: string;
  status: TeamStatus;
  paymentStatus: PaymentStatus;
  paidAmount: number; // in IDR
  paymentDate?: string;
  receiptNumber?: string;
  assignedGroup?: string; // e.g. "Grup A"
  screeningNotes?: string;
  stadiumHome?: string;
  teamBpjsDocumentUrl?: string; // Dokumen/Sertifikat Kolektif BPJS Ketenagakerjaan Tim
  portalUsername?: string;
  portalPassword?: string;
  credentialsIssuedAt?: string;
}

export interface TournamentConfig {
  id: string;
  name: string;
  tagline: string;
  edition: string;
  category: string; // e.g. "U-17 Putra", "Umum / Open"
  maxAgeLimit: number; // e.g. 17 or 99
  minAgeLimit: number; // e.g. 15 or 12
  maxTeams: number; // e.g. 16
  minPlayersPerTeam: number; // e.g. 14
  maxPlayersPerTeam: number; // e.g. 23
  registrationFee: number; // e.g. 3500000 (IDR)
  registrationDeadline: string;
  tournamentStartDate: string;
  tournamentEndDate: string;
  stadiumVenue: string;
  city: string;
  organizer: string;
  contactPerson: string;
  contactPhone: string;
}

export interface DrawingGroup {
  name: string;
  teams: Team[];
}

export type MatchStatus = 'upcoming' | 'live' | 'completed' | 'postponed';

export type MatchStage =
  | 'Grup A'
  | 'Grup B'
  | 'Grup C'
  | 'Grup D'
  | 'Grup E'
  | 'Grup F'
  | 'Perempat Final'
  | 'Semifinal'
  | 'Perebutan Juara 3'
  | 'Final';

export interface GoalEvent {
  id: string;
  minute: number;
  teamId: string;
  playerId?: string;
  playerName: string;
  playerNumber?: number;
  isPenalty?: boolean;
  isOwnGoal?: boolean;
  assistPlayerName?: string;
}

export interface CardEvent {
  id: string;
  minute: number;
  teamId: string;
  playerId?: string;
  playerName: string;
  playerNumber?: number;
  type: 'yellow' | 'red';
  reason?: string;
}

export interface MatchStats {
  homePossession?: number; // percentage e.g. 54
  awayPossession?: number; // percentage e.g. 46
  homeShots?: number;
  awayShots?: number;
  homeShotsOnTarget?: number;
  awayShotsOnTarget?: number;
  homeCorners?: number;
  awayCorners?: number;
  homeFouls?: number;
  awayFouls?: number;
  homeOffsides?: number;
  awayOffsides?: number;
}

export interface Match {
  id: string;
  matchNumber: number; // e.g. 1, 2, 3...
  stage: MatchStage | string;
  matchday?: number; // e.g. 1, 2, 3
  homeTeamId: string;
  awayTeamId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM e.g. "08:30"
  venue: string; // e.g. "Lapangan Utama Stadion Ampera", "Lapangan Ampera Golewa"
  referee?: string; // Nama Wasit Utama
  assistantReferee1?: string;
  assistantReferee2?: string;
  fourthOfficial?: string;
  status: MatchStatus;
  homeScore?: number;
  awayScore?: number;
  homePenaltyScore?: number;
  awayPenaltyScore?: number;
  notes?: string;
  // Match Summary Extensions
  halfTimeScore?: {
    home: number;
    away: number;
  };
  goals?: GoalEvent[];
  cards?: CardEvent[];
  matchStats?: MatchStats;
  manOfTheMatch?: string; // Player name / Man of the Match
  summaryNotes?: string; // Ringkasan teknis wasit / panitia pelaksana
}
