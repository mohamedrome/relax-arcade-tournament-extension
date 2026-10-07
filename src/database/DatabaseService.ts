export const defaultConfig = {
  environment: 'development',
  appName: 'Relax Arcade',
  version: '1.0.28',
  databasePath: './data/relax_arcade_tournament.db',
  uiEnabled: true,
  enableLeagueMode: true,
  enableDoubleElimination: true,
  defaultRules: {
    winPoints: 3,
    lossPoints: 0,
    allowDraws: false
  }
} as const;
