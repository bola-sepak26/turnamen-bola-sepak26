export interface TournamentNewsItem {
  id: string;
  title: string;
  category: 'Berita' | 'Pengumuman' | 'Galeri' | 'Match Highlight';
  date: string;
  author: string;
  summary: string;
  content?: string;
  imageUrl: string;
  tag?: string;
  readTime?: string;
}

export const INITIAL_TOURNAMENT_NEWS: TournamentNewsItem[] = [];
