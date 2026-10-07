import sqlite3 from 'sqlite3';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type { LeagueStanding, Match, MatchResult, Player, TournamentConfig, TournamentRecord } from '../types.js';

export class DatabaseService {
  private db: sqlite3.Database;

  constructor(databasePath: string) {
    const directory = path.dirname(databasePath);
    fs.mkdirSync(directory, { recursive: true });
    this.db = new sqlite3.Database(databasePath);
  }

  public async init(): Promise<void> {
    const schema = fs.readFileSync(path.resolve('data/schema.sql'), 'utf8');
    await this.run(schema);
  }

  public async createPlayer(player: Player): Promise<Player> {
    const id = player.id || randomUUID();
    await this.run(
      'INSERT INTO players (id, name, avatar) VALUES (?, ?, ?)',
      [id, player.name, player.avatar ?? null]
    );
    return { ...player, id };
  }

  public async createTournament(config: TournamentConfig): Promise<TournamentRecord> {
    const tournamentId = randomUUID();
    await this.run(
      'INSERT INTO tournaments (id, name, format, status, config) VALUES (?, ?, ?, ?, ?)',
      [tournamentId, config.name, config.format, 'draft', JSON.stringify(config)]
    );

    for (const player of config.players) {
      await this.run(
        'INSERT INTO tournament_players (tournament_id, player_id, seeded_rank, score, wins, losses, matches_played) VALUES (?, ?, ?, 0, 0, 0, 0)',
        [tournamentId, player.id, 0]
      );
    }

    return {
      id: tournamentId,
      name: config.name,
      format: config.format,
      status: 'draft',
      config: JSON.stringify(config)
    };
  }

  public async saveMatch(match: Match): Promise<void> {
    await this.run(
      `INSERT INTO matches (id, tournament_id, round_index, stage, player_one_id, player_two_id, winner_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         round_index = excluded.round_index,
         stage = excluded.stage,
         player_one_id = excluded.player_one_id,
         player_two_id = excluded.player_two_id,
         winner_id = excluded.winner_id,
         status = excluded.status`,
      [
        match.id,
        match.tournamentId,
        match.roundIndex,
        match.stage,
        match.playerOneId ?? null,
        match.playerTwoId ?? null,
        match.winnerId ?? null,
        match.status
      ]
    );
  }

  public async saveMatchResult(result: MatchResult): Promise<void> {
    await this.run(
      `INSERT INTO match_results (id, match_id, winner_id, score_one, score_two, notes)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         winner_id = excluded.winner_id,
         score_one = excluded.score_one,
         score_two = excluded.score_two,
         notes = excluded.notes`,
      [
        result.id,
        result.matchId,
        result.winnerId ?? null,
        result.scoreOne,
        result.scoreTwo,
        result.notes ?? null
      ]
    );
  }

  public async updateLeagueStanding(standing: LeagueStanding): Promise<void> {
    await this.run(
      `INSERT INTO league_standings (tournament_id, player_id, points, wins, losses, matches_played)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(tournament_id, player_id) DO UPDATE SET
         points = excluded.points,
         wins = excluded.wins,
         losses = excluded.losses,
         matches_played = excluded.matches_played`,
      [
        standing.tournamentId,
        standing.playerId,
        standing.points,
        standing.wins,
        standing.losses,
        standing.matchesPlayed
      ]
    );
  }

  public async getTournamentById(id: string): Promise<TournamentRecord | null> {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM tournaments WHERE id = ?', [id], (error, row) => {
        if (error) return reject(error);
        resolve(row ? (row as TournamentRecord) : null);
      });
    });
  }

  public async getAllPlayers(): Promise<Player[]> {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM players', [], (error, rows) => {
        if (error) return reject(error);
        resolve(rows as Player[]);
      });
    });
  }

  public async getTournamentMatches(tournamentId: string): Promise<Match[]> {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM matches WHERE tournament_id = ?', [tournamentId], (error, rows) => {
        if (error) return reject(error);
        resolve(rows as Match[]);
      });
    });
  }

  public async getLeagueStandings(tournamentId: string): Promise<LeagueStanding[]> {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM league_standings WHERE tournament_id = ?', [tournamentId], (error, rows) => {
        if (error) return reject(error);
        resolve(rows as LeagueStanding[]);
      });
    });
  }

  public close(): void {
    this.db.close();
  }

  private run(sql: string, params: unknown[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function errorCallback(error) {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }
}
