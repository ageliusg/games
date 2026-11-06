// ==========================================
// Procedural League Universe Generator
// Generates balanced 20-club competitive tiers
// ==========================================

import { League } from '../../types';
import { PRNG } from '../math/prng';
import { ClubGenerator } from './clubGenerator';

export class LeagueGenerator {
  /**
   * Generates a 20-club league for a specified tier
   */
  public static generateLeague(
    seed: string = 'football-universe-v1',
    tier: 1 | 2 = 1,
    season: number = 2026
  ): League {
    const prng = new PRNG(`${seed}_tier_${tier}_season_${season}`);

    const leagueName = tier === 1 ? 'Premier Division' : 'Championship Division';
    const leagueId = `league-tier-${tier}`;

    const clubs = [];
    for (let i = 0; i < 20; i++) {
      const clubPrng = prng.fork(`club_${i}`);
      const club = ClubGenerator.generateClub(clubPrng, tier, i, 20);
      clubs.push(club);
    }

    // Sort clubs descending by reputation initially
    clubs.sort((a, b) => b.reputation - a.reputation);

    return {
      id: leagueId,
      name: leagueName,
      tier,
      season,
      clubs
    };
  }
}
