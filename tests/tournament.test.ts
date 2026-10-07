import { randomUUID } from 'node:crypto';
import { defaultConfig } from './config.js';
import { DatabaseService } from './database/DatabaseService.js';
import { RelaxArcadeAdapter } from './host/RelaxArcadeAdapter.js';
import { TournamentEngine } from './tournament/TournamentEngine.js';
import { GameScreenIntegration } from './ui/GameScreenIntegration.js';
import type { ExtensionContext, Match, Player, TournamentConfig, TournamentRecord } from './types.js';

export class RelaxArcadeTournamentExtension {
  private readonly context: ExtensionContext;
  private readonly database: DatabaseService;
  private readonly adapter: RelaxArcadeAdapter;
  private readonly ui: GameScreenIntegration;

  constructor(context: Partial<ExtensionContext> = {}) {
    this.context = {
      ...defaultConfig,
      ...context,
      environment: context.environment ?? 'development',
      appName: context.appName ?? defaultConfig.appName,
      version: context.version ?? defaultConfig.version,
      databasePath: context.databasePath ?? defaultConfig.databasePath,
      uiEnabled: context.uiEnabled ?? defaultConfig.uiEnabled
    };

    this.database = new DatabaseService(this.context.databasePath);
    this.adapter = new RelaxArcadeAdapter(this.context);
    this.ui = new GameScreenIntegration({ showOverlay: (content) => this.adapter.showOverlay(content) });
  }

  public async start(): Promise<void> {
    await this.database.init();
    console.log(`[${this.context.appName}] Tournament extension started (${this.context.version})`);
  }

  public async createTournament(config: TournamentConfig): Promise<TournamentRecord> {
    const record = await this.database.createTournament(config);

    const players = config.players;
    let matches: Match[] = [];

    if (config.format === 'single-elimination') {
      matches = TournamentEngine.createSimpleEliminationBracket(players).map((match) => ({
        ...match,
        tournamentId: record.id
      }));
    }

    if (config.format === 'double-elimination') {
      matches = TournamentEngine.createDoubleEliminationBracket(players).map((match) => ({
        ...match,
        tournamentId: record.id
      }));
    }

    if (config.format === 'league') {
      matches = [];
      for (const player of players) {
        await this.database.createPlayer(player);
      }
    }

    for (const match of matches) {
      match.id = match.id || randomUUID();
      await this.database.saveMatch(match);
    }

    return record;
  }

  public async registerPlayer(player: Player): Promise<Player> {
    return this.database.createPlayer(player);
  }

  public async saveMatchResult(matchId: string, winnerId: string, scoreOne: number, scoreTwo: number, notes?: string): Promise<void> {
    const result = TournamentEngine.buildMatchResult(winnerId, scoreOne, scoreTwo, matchId, notes);
    await this.database.saveMatchResult(result);
  }

  public async renderTournamentScreen(tournament: TournamentRecord): Promise<void> {
    const players = await this.database.getAllPlayers();
    const matches = await this.database.getTournamentMatches(tournament.id);
    const standings = await this.database.getLeagueStandings(tournament.id);
    this.ui.renderTournamentDashboard(tournament, players, matches, standings);
  }

  public async shutdown(): Promise<void> {
    this.database.close();
  }
}

export { TournamentEngine };
export { DatabaseService };
export { GameScreenIntegration };
export { RelaxArcadeAdapter };

const extension = new RelaxArcadeTournamentExtension();

void extension.start();

export default extension;
