import { randomUUID } from 'node:crypto';
import type { Match, MatchResult, Player, TournamentConfig, TournamentFormat } from '../types.js';

export class TournamentEngine {
  public static createSimpleEliminationBracket(players: Player[]): Match[] {
    const normalized = [...players];
    const matches: Match[] = [];
    const roundSize = this.nextPowerOfTwo(normalized.length);

    for (let i = 0; i < roundSize / 2; i += 1) {
      matches.push({
        id: randomUUID(),
        tournamentId: '',
        roundIndex: 1,
        stage: 'winner-bracket',
        playerOneId: normalized[i * 2]?.id,
        playerTwoId: normalized[i * 2 + 1]?.id,
        status: 'pending'
      });
    }

    return matches;
  }

  public static createDoubleEliminationBracket(players: Player[]): Match[] {
    const matches: Match[] = [];
    const size = this.nextPowerOfTwo(players.length);

    for (let i = 0; i < size / 2; i += 1) {
      matches.push({
        id: randomUUID(),
        tournamentId: '',
        roundIndex: 1,
        stage: 'winner-bracket',
        playerOneId: players[i * 2]?.id,
        playerTwoId: players[i * 2 + 1]?.id,
        status: 'pending'
      });

      matches.push({
        id: randomUUID(),
        tournamentId: '',
        roundIndex: 1,
        stage: 'loser-bracket',
        playerOneId: players[i * 2]?.id,
        playerTwoId: players[i * 2 + 1]?.id,
        status: 'pending'
      });
    }

    return matches;
  }

  public static createLeagueTable(players: Player[]): Array<{ playerId: string; points: number; wins: number; losses: number; matchesPlayed: number }> {
    return players.map((player) => ({
      playerId: player.id,
      points: 0,
      wins: 0,
      losses: 0,
      matchesPlayed: 0
    }));
  }

  public static applyLeagueResult(
    standings: Array<{ playerId: string; points: number; wins: number; losses: number; matchesPlayed: number }>,
    winnerId: string,
    loserId: string,
    rules: TournamentConfig['rules']
  ) {
    const winner = standings.find((s) => s.playerId === winnerId);
    const loser = standings.find((s) => s.playerId === loserId);

    if (!winner || !loser) return standings;

    winner.points += rules.winPoints;
    winner.wins += 1;
    winner.matchesPlayed += 1;

    loser.points += rules.lossPoints;
    loser.losses += 1;
    loser.matchesPlayed += 1;

    return standings;
  }

  public static buildMatchResult(
    winnerId: string | undefined,
    scoreOne: number,
    scoreTwo: number,
    matchId: string,
    notes?: string
  ): MatchResult {
    return {
      id: randomUUID(),
      matchId,
      winnerId,
      scoreOne,
      scoreTwo,
      notes
    };
  }

  public static getFormatFromMode(mode: TournamentFormat): string {
    switch (mode) {
      case 'single-elimination':
        return 'Single elimination';
      case 'double-elimination':
        return 'Double elimination';
      case 'league':
        return 'League / ranking';
      default:
        return 'Unspecified';
    }
  }

  private static nextPowerOfTwo(value: number): number {
    let size = 1;
    while (size < value) size <<= 1;
    return size;
  }
}
