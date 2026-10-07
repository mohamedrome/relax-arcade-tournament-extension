export type TournamentFormat = 'single-elimination' | 'double-elimination' | 'league';
export type TournamentStatus = 'draft' | 'active' | 'finished';
export type MatchStatus = 'pending' | 'finished';
export type MatchStage = 'winner-bracket' | 'loser-bracket' | 'final' | 'league';

export interface Player {
  id: string;
  name: string;
  avatar?: string;
}

export interface TournamentRules {
  winPoints: number;
  lossPoints: number;
  allowDraws: boolean;
}

export interface TournamentConfig {
  name: string;
  format: TournamentFormat;
  players: Player[];
  rules: TournamentRules;
}

export interface Match {
  id: string;
  tournamentId: string;
  roundIndex: number;
  stage: MatchStage;
  playerOneId?: string;
  playerTwoId?: string;
  winnerId?: string;
  status: MatchStatus;
}

export interface MatchResult {
  id: string;
  matchId: string;
  winnerId?: string;
  scoreOne: number;
  scoreTwo: number;
  notes?: string;
}

export interface TournamentRecord {
  id: string;
  name: string;
  format: TournamentFormat;
  status: TournamentStatus;
  config?: string;
  createdAt?: string;
}

export interface LeagueStanding {
  tournamentId: string;
  playerId: string;
  points: number;
  wins: number;
  losses: number;
  matchesPlayed: number;
}

export interface ExtensionContext {
  environment: 'development' | 'production';
  appName: string;
  version: string;
  databasePath: string;
  uiEnabled?: boolean;
}
