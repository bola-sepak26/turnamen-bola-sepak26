import { TournamentConfig, Team, Match, TournamentDocument } from '../types/tournament.ts';
import type { TournamentNewsItem } from '../data/tournamentNewsData.ts';

export interface TournamentDataResponse {
  config: TournamentConfig;
  teams: Team[];
  matches: Match[];
  news?: TournamentNewsItem[];
  documents?: TournamentDocument[];
  source?: string;
}

export async function fetchTournamentData(): Promise<TournamentDataResponse | null> {
  try {
    const res = await fetch('/api/tournament/data');
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('Could not load data from database API, falling back to local storage:', err);
    return null;
  }
}

export async function saveTeamApi(team: Team): Promise<Team | null> {
  try {
    const res = await fetch('/api/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(team),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Failed to sync team to database API:', err);
    return null;
  }
}

export async function deleteTeamApi(teamId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/teams/${encodeURIComponent(teamId)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.warn('Failed to delete team via database API:', err);
    return false;
  }
}

export async function deleteAllTeamsApi(): Promise<boolean> {
  try {
    const res = await fetch('/api/teams', {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.warn('Failed to empty teams via database API:', err);
    return false;
  }
}

export async function saveMatchApi(match: Match): Promise<Match | null> {
  try {
    const res = await fetch('/api/matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(match),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Failed to sync match to database API:', err);
    return null;
  }
}

export async function saveConfigApi(config: TournamentConfig): Promise<TournamentConfig | null> {
  try {
    const res = await fetch('/api/tournament/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Failed to sync tournament config to database API:', err);
    return null;
  }
}

export async function fetchNewsApi(): Promise<TournamentNewsItem[]> {
  try {
    const res = await fetch('/api/news');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Failed to fetch news from database API:', err);
    return [];
  }
}

export async function saveNewsApi(item: TournamentNewsItem): Promise<TournamentNewsItem | null> {
  try {
    const res = await fetch('/api/news', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Failed to save news to database API:', err);
    return null;
  }
}

export async function deleteNewsApi(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/news/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.warn('Failed to delete news via database API:', err);
    return false;
  }
}

export async function deleteAllNewsApi(): Promise<boolean> {
  try {
    const res = await fetch('/api/news', {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.warn('Failed to delete all news via database API:', err);
    return false;
  }
}

export async function fetchDocumentsApi(): Promise<TournamentDocument[]> {
  try {
    const res = await fetch('/api/documents');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Failed to fetch documents from database API:', err);
    return [];
  }
}

export async function saveDocumentApi(doc: TournamentDocument): Promise<TournamentDocument | null> {
  try {
    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doc),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Failed to save document to database API:', err);
    return null;
  }
}

export async function deleteDocumentApi(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/documents/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.warn('Failed to delete document via database API:', err);
    return false;
  }
}

export async function deleteAllDocumentsApi(): Promise<boolean> {
  try {
    const res = await fetch('/api/documents', {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.warn('Failed to delete all documents via database API:', err);
    return false;
  }
}

export async function uploadToSupabaseStorageApi(params: {
  base64Data: string;
  fileName: string;
  contentType: string;
  bucketName?: string;
}): Promise<{ url: string; path?: string; error?: string; success?: boolean } | null> {
  try {
    const res = await fetch('/api/storage/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { url: '', error: errData.error || `HTTP ${res.status}` };
    }
    return await res.json();
  } catch (err: any) {
    console.warn('Upload to Supabase Storage failed:', err);
    return { url: '', error: err.message };
  }
}

export async function checkSupabaseStatusApi(): Promise<{
  connected: boolean;
  url: string;
  bucket: string;
  message: string;
}> {
  try {
    const res = await fetch('/api/storage/status');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err: any) {
    return {
      connected: false,
      url: '',
      bucket: 'tournament-documents',
      message: err.message || 'Offline',
    };
  }
}



