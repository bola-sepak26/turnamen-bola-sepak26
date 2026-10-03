import { pgTable, text, integer, timestamp } from 'drizzle-orm/pg-core';

// Tournament Config table
export const tournamentConfigs = pgTable('tournament_configs', {
  id: text('id').primaryKey(), // 'default'
  name: text('name').notNull(),
  tagline: text('tagline').notNull(),
  edition: text('edition').notNull(),
  category: text('category').notNull(),
  maxAgeLimit: integer('max_age_limit').notNull(),
  minAgeLimit: integer('min_age_limit').notNull(),
  maxTeams: integer('max_teams').notNull(),
  minPlayersPerTeam: integer('min_players_per_team').notNull(),
  maxPlayersPerTeam: integer('max_players_per_team').notNull(),
  registrationFee: integer('registration_fee').notNull(),
  registrationDeadline: text('registration_deadline').notNull(),
  tournamentStartDate: text('tournament_start_date').notNull(),
  tournamentEndDate: text('tournament_end_date').notNull(),
  stadiumVenue: text('stadium_venue').notNull(),
  city: text('city').notNull(),
  organizer: text('organizer').notNull(),
  contactPerson: text('contact_person').notNull(),
  contactPhone: text('contact_phone').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Teams table
export const teams = pgTable('teams', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code').notNull(),
  originCity: text('origin_city').notNull(),
  originProvince: text('origin_province').notNull(),
  establishedYear: integer('established_year').notNull(),
  logoUrl: text('logo_url'),
  primaryJerseyColor: text('primary_jersey_color').notNull(),
  secondaryJerseyColor: text('secondary_jersey_color').notNull(),
  stadiumHome: text('stadium_home'),
  managerName: text('manager_name').notNull(),
  managerPhone: text('manager_phone').notNull(),
  headCoachName: text('head_coach_name').notNull(),
  registrationDate: text('registration_date').notNull(),
  status: text('status').notNull(),
  paymentStatus: text('payment_status').notNull(),
  paidAmount: integer('paid_amount').notNull(),
  paymentDate: text('payment_date'),
  receiptNumber: text('receipt_number'),
  assignedGroup: text('assigned_group'),
  screeningNotes: text('screening_notes'),
  teamBpjsDocumentUrl: text('team_bpjs_document_url'),
  portalUsername: text('portal_username'),
  portalPassword: text('portal_password'),
  credentialsIssuedAt: text('credentials_issued_at'),
  officialsJson: text('officials_json').notNull().default('[]'),
  playersJson: text('players_json').notNull().default('[]'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Matches table
export const matches = pgTable('matches', {
  id: text('id').primaryKey(),
  matchNumber: integer('match_number').notNull(),
  stage: text('stage').notNull(),
  matchday: integer('matchday').notNull(),
  homeTeamId: text('home_team_id').notNull(),
  awayTeamId: text('away_team_id').notNull(),
  date: text('date').notNull(),
  time: text('time').notNull(),
  venue: text('venue').notNull(),
  referee: text('referee'),
  status: text('status').notNull(),
  homeScore: integer('home_score'),
  awayScore: integer('away_score'),
  homePenaltyScore: integer('home_penalty_score'),
  awayPenaltyScore: integer('away_penalty_score'),
  halfTimeHomeScore: integer('half_time_home_score'),
  halfTimeAwayScore: integer('half_time_away_score'),
  manOfTheMatch: text('man_of_the_match'),
  summaryNotes: text('summary_notes'),
  notes: text('notes'),
  goalsJson: text('goals_json').notNull().default('[]'),
  cardsJson: text('cards_json').notNull().default('[]'),
  matchStatsJson: text('match_stats_json'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tournament News & Gallery table
export const tournamentNews = pgTable('tournament_news', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  date: text('date').notNull(),
  author: text('author').notNull(),
  summary: text('summary').notNull(),
  content: text('content'),
  imageUrl: text('image_url').notNull(),
  tag: text('tag'),
  readTime: text('read_time'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tournament Documents & Supabase Storage repository table
export const tournamentDocuments = pgTable('tournament_documents', {
  id: text('id').primaryKey(),
  teamId: text('team_id'),
  teamName: text('team_name'),
  playerId: text('player_id'),
  playerName: text('player_name'),
  title: text('title').notNull(),
  category: text('category').notNull(), // 'ktp_kia' | 'akta_ijazah' | 'bpjs' | 'payment_receipt' | 'dsp' | 'sk_tim' | 'other'
  fileUrl: text('file_url').notNull(),
  fileType: text('file_type'),
  fileSizeKb: integer('file_size_kb'),
  storageProvider: text('storage_provider').notNull().default('supabase'),
  verificationStatus: text('verification_status').notNull().default('verified'), // 'verified' | 'pending' | 'rejected'
  uploadedBy: text('uploaded_by').notNull().default('Panitia / Admin'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

