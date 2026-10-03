import { Team, TournamentConfig, Match } from '../types/tournament.ts';

export const INITIAL_TOURNAMENT_CONFIG: TournamentConfig = {
  id: 'trn-handayani-cup-2026',
  name: 'Handayani Cup 2026',
  tagline: '',
  edition: 'Edisi Ke-VIII',
  category: 'Bebas',
  maxAgeLimit: 17,
  minAgeLimit: 15,
  maxTeams: 16,
  minPlayersPerTeam: 14,
  maxPlayersPerTeam: 23,
  registrationFee: 3500000,
  registrationDeadline: '2026-10-15',
  tournamentStartDate: '2026-10-25',
  tournamentEndDate: '2026-11-08',
  stadiumVenue: 'Stadion Ampera & Ampera Mataloko',
  city: 'Jakarta Pusat',
  organizer: 'Panitia Pelaksana Turnamen Handayani Cup',
  contactPerson: 'Portaz DC(Admin)',
  contactPhone: '+62 81237970080',
};

export const initialConfig = INITIAL_TOURNAMENT_CONFIG;

// Entire default team database is cleared and empty - ready for real registrations
export const INITIAL_TEAMS: Team[] = [];
export const initialTeams: Team[] = [];

// Default matches are cleared and empty
export const INITIAL_MATCHES: Match[] = [];
export const initialMatches: Match[] = [];
