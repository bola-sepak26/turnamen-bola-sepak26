import { Team, TournamentConfig, Match } from '../types/tournament';
import { INITIAL_TEAMS, INITIAL_TOURNAMENT_CONFIG, INITIAL_MATCHES } from '../data/initialTournamentData';
import { INITIAL_TOURNAMENT_NEWS, TournamentNewsItem } from '../data/tournamentNewsData';
import { ensureTeamCredentials } from './credentials';

const CONFIG_STORAGE_KEY = 'ligapora_tournament_config';
const TEAMS_STORAGE_KEY = 'ligapora_registered_teams';
const MATCHES_STORAGE_KEY = 'ligapora_tournament_matches';
const NEWS_STORAGE_KEY = 'ligapora_tournament_news';

export function loadTournamentConfig(): TournamentConfig {
  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to load tournament config from storage:', err);
  }
  return INITIAL_TOURNAMENT_CONFIG;
}

export function saveTournamentConfig(config: TournamentConfig): void {
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save tournament config:', err);
  }
}

export function loadTeams(): Team[] {
  try {
    const raw = localStorage.getItem(TEAMS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map(ensureTeamCredentials);
      }
    }
  } catch (err) {
    console.error('Failed to load teams from storage:', err);
  }
  return [];
}

export function saveTeams(teams: Team[]): void {
  try {
    localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(teams));
  } catch (err) {
    console.error('Failed to save teams:', err);
  }
}

export function loadMatches(): Match[] {
  try {
    const raw = localStorage.getItem(MATCHES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load matches from storage:', err);
  }
  return INITIAL_MATCHES;
}

export function saveMatches(matches: Match[]): void {
  try {
    localStorage.setItem(MATCHES_STORAGE_KEY, JSON.stringify(matches));
  } catch (err) {
    console.error('Failed to save matches:', err);
  }
}

export function loadTournamentNews(): TournamentNewsItem[] {
  try {
    const raw = localStorage.getItem(NEWS_STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load tournament news from storage:', err);
  }
  return [];
}

export function saveTournamentNews(news: TournamentNewsItem[]): void {
  try {
    localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(news));
  } catch (err) {
    console.error('Failed to save tournament news:', err);
  }
}

export function resetToDefaultData(): { config: TournamentConfig; teams: Team[]; matches: Match[] } {
  try {
    localStorage.removeItem(CONFIG_STORAGE_KEY);
    localStorage.removeItem(TEAMS_STORAGE_KEY);
    localStorage.removeItem(MATCHES_STORAGE_KEY);
  } catch (err) {
    console.error('Reset error:', err);
  }
  return {
    config: INITIAL_TOURNAMENT_CONFIG,
    teams: INITIAL_TEAMS,
    matches: INITIAL_MATCHES,
  };
}

export function resetToInitialData(): { config: TournamentConfig; teams: Team[]; matches: Match[] } {
  return resetToDefaultData();
}

export function loadTournamentData(): { config: TournamentConfig; teams: Team[]; matches: Match[] } {
  return {
    config: loadTournamentConfig(),
    teams: loadTeams(),
    matches: loadMatches(),
  };
}

export function saveTournamentData(config: TournamentConfig, teams: Team[], matches?: Match[]): void {
  saveTournamentConfig(config);
  saveTeams(teams);
  if (matches) {
    saveMatches(matches);
  }
}


export function exportTournamentBackup(config: TournamentConfig, teams: Team[], matches?: Match[]): void {
  const data = {
    app: 'KingDC Tournament Administration System',
    version: '1.0',
    exportTimestamp: new Date().toISOString(),
    config,
    teams,
    matches: matches || loadMatches(),
  };
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `kingdc-turnamen-${config.category.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

