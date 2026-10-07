import type { TournamentRecord, Player, Match, LeagueStanding } from '../types.js';

export class GameScreenIntegration {
  private readonly host: { showOverlay: (content: string) => void };

  constructor(host: { showOverlay: (content: string) => void }) {
    this.host = host;
  }

  public renderTournamentDashboard(tournament: TournamentRecord, players: Player[], matches: Match[], standings: LeagueStanding[]) {
    const html = `
      <div class="tournament-overlay">
        <h2>${tournament.name}</h2>
        <p>Format: ${tournament.format}</p>
        <p>Status: ${tournament.status}</p>
        <div class="players">
          ${players.map((player) => `<span>${player.name}</span>`).join(' ')}
        </div>
        <div class="matches">
          ${matches.map((match) => `<div>Round ${match.roundIndex} - ${match.stage}: ${match.playerOneId ?? 'TBD'} vs ${match.playerTwoId ?? 'TBD'}</div>`).join('')}
        </div>
        <div class="standings">
          ${standings.map((standing, index) => `<div>#${index + 1} - Player ${standing.playerId}: ${standing.points} pts</div>`).join('')}
        </div>
      </div>
    `;

    this.host.showOverlay(html);
  }
}
