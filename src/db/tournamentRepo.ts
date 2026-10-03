import { db } from './index.ts';
import { teams, matches, tournamentConfigs, tournamentNews, tournamentDocuments } from './schema.ts';
import { eq, asc, desc } from 'drizzle-orm';
import type {
  Team,
  Match,
  TournamentConfig,
  OfficialStaff,
  Player,
  MatchStage,
  MatchStatus,
  GoalEvent,
  CardEvent,
  MatchStats,
  TournamentDocument,
  DocumentCategory,
  DocumentVerificationStatus,
} from '../types/tournament.ts';
import type { TournamentNewsItem } from '../data/tournamentNewsData.ts';

// Map Drizzle row to Team
function mapRowToTeam(row: typeof teams.$inferSelect): Team {
  let officials: OfficialStaff[] = [];
  let players: Player[] = [];
  try {
    officials = JSON.parse(row.officialsJson || '[]');
  } catch {
    officials = [];
  }
  try {
    players = JSON.parse(row.playersJson || '[]');
  } catch {
    players = [];
  }

  return {
    id: row.id,
    name: row.name,
    code: row.code,
    originCity: row.originCity,
    originProvince: row.originProvince,
    establishedYear: row.establishedYear,
    logoUrl: row.logoUrl || undefined,
    primaryJerseyColor: row.primaryJerseyColor,
    secondaryJerseyColor: row.secondaryJerseyColor,
    stadiumHome: row.stadiumHome || undefined,
    managerName: row.managerName,
    managerPhone: row.managerPhone,
    headCoachName: row.headCoachName,
    registrationDate: row.registrationDate,
    status: row.status as Team['status'],
    paymentStatus: row.paymentStatus as Team['paymentStatus'],
    paidAmount: Number(row.paidAmount || 0),
    paymentDate: row.paymentDate || undefined,
    receiptNumber: row.receiptNumber || undefined,
    assignedGroup: row.assignedGroup || undefined,
    screeningNotes: row.screeningNotes || undefined,
    teamBpjsDocumentUrl: row.teamBpjsDocumentUrl || undefined,
    portalUsername: row.portalUsername || undefined,
    portalPassword: row.portalPassword || undefined,
    credentialsIssuedAt: row.credentialsIssuedAt || undefined,
    officials,
    players,
  };
}

// Map Drizzle row to Match
function mapRowToMatch(row: typeof matches.$inferSelect): Match {
  let goals: GoalEvent[] = [];
  let cards: CardEvent[] = [];
  let matchStats: MatchStats | undefined = undefined;
  try {
    goals = JSON.parse(row.goalsJson || '[]');
  } catch {
    goals = [];
  }
  try {
    cards = JSON.parse(row.cardsJson || '[]');
  } catch {
    cards = [];
  }
  try {
    if (row.matchStatsJson) {
      matchStats = JSON.parse(row.matchStatsJson);
    }
  } catch {
    matchStats = undefined;
  }

  return {
    id: row.id,
    matchNumber: Number(row.matchNumber),
    stage: row.stage as MatchStage,
    matchday: Number(row.matchday || 1),
    homeTeamId: row.homeTeamId,
    awayTeamId: row.awayTeamId,
    date: row.date,
    time: row.time,
    venue: row.venue,
    referee: row.referee || undefined,
    status: row.status as MatchStatus,
    homeScore: row.homeScore !== null && row.homeScore !== undefined ? Number(row.homeScore) : undefined,
    awayScore: row.awayScore !== null && row.awayScore !== undefined ? Number(row.awayScore) : undefined,
    homePenaltyScore: row.homePenaltyScore !== null && row.homePenaltyScore !== undefined ? Number(row.homePenaltyScore) : undefined,
    awayPenaltyScore: row.awayPenaltyScore !== null && row.awayPenaltyScore !== undefined ? Number(row.awayPenaltyScore) : undefined,
    halfTimeScore:
      row.halfTimeHomeScore !== null && row.halfTimeHomeScore !== undefined &&
      row.halfTimeAwayScore !== null && row.halfTimeAwayScore !== undefined
        ? { home: Number(row.halfTimeHomeScore), away: Number(row.halfTimeAwayScore) }
        : undefined,
    manOfTheMatch: row.manOfTheMatch || undefined,
    summaryNotes: row.summaryNotes || undefined,
    notes: row.notes || undefined,
    goals,
    cards,
    matchStats,
  };
}

// Map Drizzle row to TournamentNewsItem
function mapRowToNews(row: typeof tournamentNews.$inferSelect): TournamentNewsItem {
  return {
    id: row.id,
    title: row.title,
    category: row.category as TournamentNewsItem['category'],
    date: row.date,
    author: row.author,
    summary: row.summary,
    content: row.content || undefined,
    imageUrl: row.imageUrl,
    tag: row.tag || undefined,
    readTime: row.readTime || undefined,
  };
}

// Map Drizzle row to TournamentDocument
function mapRowToDocument(row: typeof tournamentDocuments.$inferSelect): TournamentDocument {
  return {
    id: row.id,
    teamId: row.teamId || undefined,
    teamName: row.teamName || undefined,
    playerId: row.playerId || undefined,
    playerName: row.playerName || undefined,
    title: row.title,
    category: row.category as DocumentCategory,
    fileUrl: row.fileUrl,
    fileType: row.fileType || undefined,
    fileSizeKb: row.fileSizeKb ? Number(row.fileSizeKb) : undefined,
    storageProvider: (row.storageProvider || 'supabase') as 'supabase' | 'cloud_sql' | 'local',
    verificationStatus: (row.verificationStatus || 'verified') as DocumentVerificationStatus,
    uploadedBy: row.uploadedBy,
    notes: row.notes || undefined,
    createdAt: row.createdAt ? row.createdAt.toISOString() : undefined,
    updatedAt: row.updatedAt ? row.updatedAt.toISOString() : undefined,
  };
}

// 1. Teams API with Cloud SQL Drizzle ORM
export async function getAllTeams(): Promise<Team[]> {
  try {
    const rows = await db.select().from(teams).orderBy(asc(teams.name));
    return rows.map(mapRowToTeam);
  } catch (error) {
    console.error('Error fetching teams from Cloud SQL database:', error);
    throw new Error('Gagal mengambil data tim dari database Cloud SQL', { cause: error });
  }
}

export async function upsertTeam(team: Team): Promise<Team> {
  try {
    const values = {
      id: team.id,
      name: team.name,
      code: team.code,
      originCity: team.originCity,
      originProvince: team.originProvince || '',
      establishedYear: team.establishedYear || 2020,
      logoUrl: team.logoUrl || null,
      primaryJerseyColor: team.primaryJerseyColor || '#000000',
      secondaryJerseyColor: team.secondaryJerseyColor || '#FFFFFF',
      stadiumHome: team.stadiumHome || null,
      managerName: team.managerName,
      managerPhone: team.managerPhone,
      headCoachName: team.headCoachName,
      registrationDate: team.registrationDate || new Date().toISOString().slice(0, 10),
      status: team.status,
      paymentStatus: team.paymentStatus,
      paidAmount: team.paidAmount || 0,
      paymentDate: team.paymentDate || null,
      receiptNumber: team.receiptNumber || null,
      assignedGroup: team.assignedGroup || null,
      screeningNotes: team.screeningNotes || null,
      teamBpjsDocumentUrl: team.teamBpjsDocumentUrl || null,
      portalUsername: team.portalUsername || null,
      portalPassword: team.portalPassword || null,
      credentialsIssuedAt: team.credentialsIssuedAt || null,
      officialsJson: JSON.stringify(team.officials || []),
      playersJson: JSON.stringify(team.players || []),
      updatedAt: new Date(),
    };

    await db
      .insert(teams)
      .values(values)
      .onConflictDoUpdate({
        target: teams.id,
        set: {
          name: values.name,
          code: values.code,
          originCity: values.originCity,
          originProvince: values.originProvince,
          establishedYear: values.establishedYear,
          logoUrl: values.logoUrl,
          primaryJerseyColor: values.primaryJerseyColor,
          secondaryJerseyColor: values.secondaryJerseyColor,
          stadiumHome: values.stadiumHome,
          managerName: values.managerName,
          managerPhone: values.managerPhone,
          headCoachName: values.headCoachName,
          registrationDate: values.registrationDate,
          status: values.status,
          paymentStatus: values.paymentStatus,
          paidAmount: values.paidAmount,
          paymentDate: values.paymentDate,
          receiptNumber: values.receiptNumber,
          assignedGroup: values.assignedGroup,
          screeningNotes: values.screeningNotes,
          teamBpjsDocumentUrl: values.teamBpjsDocumentUrl,
          portalUsername: values.portalUsername,
          portalPassword: values.portalPassword,
          credentialsIssuedAt: values.credentialsIssuedAt,
          officialsJson: values.officialsJson,
          playersJson: values.playersJson,
          updatedAt: new Date(),
        },
      });

    return team;
  } catch (error) {
    console.error('Error upserting team to Cloud SQL database:', error);
    throw new Error('Gagal menyimpan tim ke database Cloud SQL', { cause: error });
  }
}

export async function deleteTeamById(teamId: string): Promise<void> {
  try {
    await db.delete(teams).where(eq(teams.id, teamId));
  } catch (error) {
    console.error('Error deleting team from Cloud SQL database:', error);
    throw new Error('Gagal menghapus tim dari database Cloud SQL', { cause: error });
  }
}

export async function deleteAllTeams(): Promise<void> {
  try {
    await db.delete(teams);
  } catch (error) {
    console.error('Error deleting all teams from Cloud SQL database:', error);
    throw new Error('Gagal mengosongkan tim dari database Cloud SQL', { cause: error });
  }
}

export async function deleteAllMatches(): Promise<void> {
  try {
    await db.delete(matches);
  } catch (error) {
    console.error('Error deleting all matches from Cloud SQL database:', error);
    throw new Error('Gagal mengosongkan jadwal laga dari database Cloud SQL', { cause: error });
  }
}

// 2. Matches API with Cloud SQL Drizzle ORM
export async function getAllMatches(): Promise<Match[]> {
  try {
    const rows = await db.select().from(matches).orderBy(asc(matches.matchNumber));
    return rows.map(mapRowToMatch);
  } catch (error) {
    console.error('Error fetching matches from Cloud SQL database:', error);
    throw new Error('Gagal mengambil data pertandingan dari database Cloud SQL', { cause: error });
  }
}

export async function upsertMatch(match: Match): Promise<Match> {
  try {
    const values = {
      id: match.id,
      matchNumber: match.matchNumber,
      stage: match.stage,
      matchday: match.matchday || 1,
      homeTeamId: match.homeTeamId,
      awayTeamId: match.awayTeamId,
      date: match.date,
      time: match.time,
      venue: match.venue,
      referee: match.referee || null,
      status: match.status,
      homeScore: match.homeScore ?? null,
      awayScore: match.awayScore ?? null,
      homePenaltyScore: match.homePenaltyScore ?? null,
      awayPenaltyScore: match.awayPenaltyScore ?? null,
      halfTimeHomeScore: match.halfTimeScore?.home ?? null,
      halfTimeAwayScore: match.halfTimeScore?.away ?? null,
      manOfTheMatch: match.manOfTheMatch || null,
      summaryNotes: match.summaryNotes || null,
      notes: match.notes || null,
      goalsJson: JSON.stringify(match.goals || []),
      cardsJson: JSON.stringify(match.cards || []),
      matchStatsJson: match.matchStats ? JSON.stringify(match.matchStats) : null,
      updatedAt: new Date(),
    };

    await db
      .insert(matches)
      .values(values)
      .onConflictDoUpdate({
        target: matches.id,
        set: {
          matchNumber: values.matchNumber,
          stage: values.stage,
          matchday: values.matchday,
          homeTeamId: values.homeTeamId,
          awayTeamId: values.awayTeamId,
          date: values.date,
          time: values.time,
          venue: values.venue,
          referee: values.referee,
          status: values.status,
          homeScore: values.homeScore,
          awayScore: values.awayScore,
          homePenaltyScore: values.homePenaltyScore,
          awayPenaltyScore: values.awayPenaltyScore,
          halfTimeHomeScore: values.halfTimeHomeScore,
          halfTimeAwayScore: values.halfTimeAwayScore,
          manOfTheMatch: values.manOfTheMatch,
          summaryNotes: values.summaryNotes,
          notes: values.notes,
          goalsJson: values.goalsJson,
          cardsJson: values.cardsJson,
          matchStatsJson: values.matchStatsJson,
          updatedAt: new Date(),
        },
      });

    return match;
  } catch (error) {
    console.error('Error upserting match to Cloud SQL database:', error);
    throw new Error('Gagal menyimpan pertandingan ke database Cloud SQL', { cause: error });
  }
}

// 3. Tournament Config with Cloud SQL Drizzle ORM
export async function getTournamentConfig(): Promise<TournamentConfig | null> {
  try {
    const rows = await db
      .select()
      .from(tournamentConfigs)
      .where(eq(tournamentConfigs.id, 'default'))
      .limit(1);

    if (rows.length === 0) return null;
    const row = rows[0];

    return {
      id: row.id,
      name: row.name,
      tagline: row.tagline,
      edition: row.edition,
      category: row.category,
      maxAgeLimit: row.maxAgeLimit,
      minAgeLimit: row.minAgeLimit,
      maxTeams: row.maxTeams,
      minPlayersPerTeam: row.minPlayersPerTeam,
      maxPlayersPerTeam: row.maxPlayersPerTeam,
      registrationFee: row.registrationFee,
      registrationDeadline: row.registrationDeadline,
      tournamentStartDate: row.tournamentStartDate,
      tournamentEndDate: row.tournamentEndDate,
      stadiumVenue: row.stadiumVenue,
      city: row.city,
      organizer: row.organizer,
      contactPerson: row.contactPerson,
      contactPhone: row.contactPhone,
    };
  } catch (error) {
    console.error('Error fetching tournament config from Cloud SQL database:', error);
    throw new Error('Gagal mengambil pengaturan turnamen dari database Cloud SQL', { cause: error });
  }
}

export async function saveTournamentConfig(config: TournamentConfig): Promise<TournamentConfig> {
  try {
    const values = {
      id: 'default',
      name: config.name,
      tagline: config.tagline || '',
      edition: config.edition,
      category: config.category,
      maxAgeLimit: config.maxAgeLimit,
      minAgeLimit: config.minAgeLimit,
      maxTeams: config.maxTeams,
      minPlayersPerTeam: config.minPlayersPerTeam,
      maxPlayersPerTeam: config.maxPlayersPerTeam,
      registrationFee: config.registrationFee,
      registrationDeadline: config.registrationDeadline,
      tournamentStartDate: config.tournamentStartDate,
      tournamentEndDate: config.tournamentEndDate,
      stadiumVenue: config.stadiumVenue,
      city: config.city,
      organizer: config.organizer,
      contactPerson: config.contactPerson,
      contactPhone: config.contactPhone,
      updatedAt: new Date(),
    };

    await db
      .insert(tournamentConfigs)
      .values(values)
      .onConflictDoUpdate({
        target: tournamentConfigs.id,
        set: values,
      });

    return config;
  } catch (error) {
    console.error('Error saving tournament config to Cloud SQL database:', error);
    throw new Error('Gagal menyimpan pengaturan turnamen ke database Cloud SQL', { cause: error });
  }
}

// 4. Tournament News & Gallery API with Cloud SQL Drizzle ORM
export async function getAllNews(): Promise<TournamentNewsItem[]> {
  try {
    const rows = await db.select().from(tournamentNews).orderBy(desc(tournamentNews.createdAt));
    return rows.map(mapRowToNews);
  } catch (error) {
    console.error('Error fetching tournament news from Cloud SQL database:', error);
    throw new Error('Gagal mengambil berita dari database Cloud SQL', { cause: error });
  }
}

export async function upsertNewsItem(item: TournamentNewsItem): Promise<TournamentNewsItem> {
  try {
    const values = {
      id: item.id,
      title: item.title,
      category: item.category,
      date: item.date,
      author: item.author,
      summary: item.summary,
      content: item.content || null,
      imageUrl: item.imageUrl,
      tag: item.tag || null,
      readTime: item.readTime || null,
      updatedAt: new Date(),
    };

    await db
      .insert(tournamentNews)
      .values(values)
      .onConflictDoUpdate({
        target: tournamentNews.id,
        set: values,
      });

    return item;
  } catch (error) {
    console.error('Error upserting news item to Cloud SQL database:', error);
    throw new Error('Gagal menyimpan berita ke database Cloud SQL', { cause: error });
  }
}

export async function deleteNewsItem(id: string): Promise<void> {
  try {
    await db.delete(tournamentNews).where(eq(tournamentNews.id, id));
  } catch (error) {
    console.error('Error deleting news item from Cloud SQL database:', error);
    throw new Error('Gagal menghapus berita dari database Cloud SQL', { cause: error });
  }
}

export async function deleteAllNews(): Promise<void> {
  try {
    await db.delete(tournamentNews);
  } catch (error) {
    console.error('Error deleting all news from Cloud SQL database:', error);
    throw new Error('Gagal mengosongkan berita dari database Cloud SQL', { cause: error });
  }
}

// 5. Tournament Documents & Supabase Storage repository
export async function getAllDocuments(): Promise<TournamentDocument[]> {
  try {
    const rows = await db.select().from(tournamentDocuments).orderBy(desc(tournamentDocuments.createdAt));
    return rows.map(mapRowToDocument);
  } catch (error) {
    console.error('Error fetching documents from Cloud SQL database:', error);
    throw new Error('Gagal mengambil dokumen dari database Cloud SQL', { cause: error });
  }
}

export async function upsertDocument(doc: TournamentDocument): Promise<TournamentDocument> {
  try {
    const values = {
      id: doc.id,
      teamId: doc.teamId || null,
      teamName: doc.teamName || null,
      playerId: doc.playerId || null,
      playerName: doc.playerName || null,
      title: doc.title,
      category: doc.category,
      fileUrl: doc.fileUrl,
      fileType: doc.fileType || null,
      fileSizeKb: doc.fileSizeKb || null,
      storageProvider: doc.storageProvider || 'supabase',
      verificationStatus: doc.verificationStatus || 'verified',
      uploadedBy: doc.uploadedBy || 'Panitia / Admin',
      notes: doc.notes || null,
      updatedAt: new Date(),
    };

    await db
      .insert(tournamentDocuments)
      .values(values)
      .onConflictDoUpdate({
        target: tournamentDocuments.id,
        set: values,
      });

    return doc;
  } catch (error) {
    console.error('Error upserting document to Cloud SQL database:', error);
    throw new Error('Gagal menyimpan dokumen ke database Cloud SQL', { cause: error });
  }
}

export async function deleteDocumentById(id: string): Promise<void> {
  try {
    await db.delete(tournamentDocuments).where(eq(tournamentDocuments.id, id));
  } catch (error) {
    console.error('Error deleting document from Cloud SQL database:', error);
    throw new Error('Gagal menghapus dokumen dari database Cloud SQL', { cause: error });
  }
}

export async function deleteAllDocuments(): Promise<void> {
  try {
    await db.delete(tournamentDocuments);
  } catch (error) {
    console.error('Error emptying documents from Cloud SQL database:', error);
    throw new Error('Gagal mengosongkan seluruh dokumen dari database Cloud SQL', { cause: error });
  }
}

// 6. Seed initial data if tables are empty
export async function seedIfEmpty(
  defaultConfig?: TournamentConfig,
  defaultTeams?: Team[],
  defaultMatches?: Match[]
) {
  try {
    const existingTeams = await db.select().from(teams).limit(1);
    if (existingTeams.length === 0) {
      console.log('Cloud SQL Database empty, ready for tournament operations.');
      if (defaultConfig) {
        await saveTournamentConfig(defaultConfig);
      }
      if (defaultTeams && defaultTeams.length > 0) {
        for (const t of defaultTeams) {
          await upsertTeam(t);
        }
      }
      if (defaultMatches && defaultMatches.length > 0) {
        for (const m of defaultMatches) {
          await upsertMatch(m);
        }
      }
    }
  } catch (error) {
    console.error('Error checking or seeding Cloud SQL database:', error);
  }
}
