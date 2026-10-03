-- ============================================================
-- KingDC - Skema database Supabase (PostgreSQL)
-- Jalankan SEKALI di: Supabase Dashboard > SQL Editor > New query > Run
-- Aman dijalankan ulang (memakai IF NOT EXISTS).
-- ============================================================

create table if not exists public.tournament_configs (
  id text primary key,
  name text not null,
  tagline text not null default '',
  edition text not null,
  category text not null,
  max_age_limit integer not null,
  min_age_limit integer not null,
  max_teams integer not null,
  min_players_per_team integer not null,
  max_players_per_team integer not null,
  registration_fee integer not null,
  registration_deadline text not null,
  tournament_start_date text not null,
  tournament_end_date text not null,
  stadium_venue text not null,
  city text not null,
  organizer text not null,
  contact_person text not null,
  contact_phone text not null,
  updated_at timestamp default now()
);

create table if not exists public.teams (
  id text primary key,
  name text not null,
  code text not null,
  origin_city text not null,
  origin_province text not null,
  established_year integer not null,
  logo_url text,
  primary_jersey_color text not null,
  secondary_jersey_color text not null,
  stadium_home text,
  manager_name text not null,
  manager_phone text not null,
  head_coach_name text not null,
  registration_date text not null,
  status text not null,
  payment_status text not null,
  paid_amount integer not null,
  payment_date text,
  receipt_number text,
  assigned_group text,
  screening_notes text,
  team_bpjs_document_url text,
  portal_username text,
  portal_password text,
  credentials_issued_at text,
  officials_json text not null default '[]',
  players_json text not null default '[]',
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create table if not exists public.matches (
  id text primary key,
  match_number integer not null,
  stage text not null,
  matchday integer not null,
  home_team_id text not null,
  away_team_id text not null,
  date text not null,
  time text not null,
  venue text not null,
  referee text,
  status text not null,
  home_score integer,
  away_score integer,
  home_penalty_score integer,
  away_penalty_score integer,
  half_time_home_score integer,
  half_time_away_score integer,
  man_of_the_match text,
  summary_notes text,
  notes text,
  goals_json text not null default '[]',
  cards_json text not null default '[]',
  match_stats_json text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create table if not exists public.tournament_news (
  id text primary key,
  title text not null,
  category text not null,
  date text not null,
  author text not null,
  summary text not null,
  content text,
  image_url text not null,
  tag text,
  read_time text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create table if not exists public.tournament_documents (
  id text primary key,
  team_id text,
  team_name text,
  player_id text,
  player_name text,
  title text not null,
  category text not null,
  file_url text not null,
  file_type text,
  file_size_kb integer,
  storage_provider text not null default 'supabase',
  verification_status text not null default 'verified',
  uploaded_by text not null default 'Panitia / Admin',
  notes text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Indeks untuk mempercepat kueri & pengurutan
create index if not exists idx_teams_name        on public.teams (name);
create index if not exists idx_matches_number    on public.matches (match_number);
create index if not exists idx_matches_home      on public.matches (home_team_id);
create index if not exists idx_matches_away      on public.matches (away_team_id);
create index if not exists idx_news_created      on public.tournament_news (created_at desc);
create index if not exists idx_docs_team         on public.tournament_documents (team_id);
create index if not exists idx_docs_created      on public.tournament_documents (created_at desc);

-- KEAMANAN: aktifkan Row Level Security tanpa policy.
-- Supabase otomatis membuka tabel lewat REST API memakai anon key (publik).
-- Dengan RLS aktif dan tanpa policy, anon key TIDAK bisa membaca/menulis tabel ini.
-- Server aplikasi memakai koneksi Postgres langsung (DATABASE_URL) sehingga tetap berfungsi.
alter table public.tournament_configs   enable row level security;
alter table public.teams                enable row level security;
alter table public.matches              enable row level security;
alter table public.tournament_news      enable row level security;
alter table public.tournament_documents enable row level security;
