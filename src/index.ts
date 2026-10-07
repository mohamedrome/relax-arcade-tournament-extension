export const extensionManifest = {
  id: 'com.relaxarcade.tournament.extension',
  name: 'Tournament Extension',
  version: '1.0.28',
  compatibleVersion: '1.0.28',
  description: 'Tournament module compatible with Relax Arcade 1.0.28, including single elimination, double elimination and league rankings.',
  entry: './dist/src/index.js',
  capabilities: ['tournament', 'leaderboard', 'database', 'ui-overlay'],
  permissions: ['database', 'ui'],
  modules: ['simple-elimination', 'double-elimination', 'league']
};
