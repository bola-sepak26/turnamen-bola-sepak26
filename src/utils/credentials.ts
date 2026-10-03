import { Team } from '../types/tournament.ts';

export function getDefaultTeamUsername(team: { code: string; name?: string }): string {
  const cleanCode = (team.code || 'TIM').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${cleanCode}_official`;
}

export function getDefaultTeamPassword(team: { code: string }): string {
  const cleanCode = (team.code || 'TIM').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${cleanCode}2026`;
}

export function ensureTeamCredentials(team: Team): Team {
  const username = team.portalUsername || getDefaultTeamUsername(team);
  const password = team.portalPassword || getDefaultTeamPassword(team);
  const credentialsIssuedAt = team.credentialsIssuedAt || (team.paymentStatus === 'paid' ? (team.paymentDate || team.registrationDate || new Date().toISOString()) : undefined);

  return {
    ...team,
    portalUsername: username,
    portalPassword: password,
    credentialsIssuedAt,
  };
}
