// ==========================================
// Procedural Club & Squad Generator
// Pareto Economic Disparity & Roster Construction
// ==========================================

import { Club, ClubFinances, Player, Position } from '../../types';
import { PRNG } from '../math/prng';
import { DistributionEngine } from '../math/gaussian';
import { NameGenerator } from './nameGenerator';
import { PlayerGenerator } from './playerGenerator';

export class ClubGenerator {
  // Standard 25-man squad positional quotas
  private static readonly SQUAD_POSITION_TEMPLATE: Position[] = [
    'GK', 'GK', 'GK',
    'CB', 'CB', 'CB', 'CB', 'CB',
    'LB', 'LB',
    'RB', 'RB',
    'DM', 'DM', 'DM',
    'CM', 'CM', 'CM', 'CM',
    'LW', 'RW',
    'AM', 'AM',
    'ST', 'ST'
  ];

  /**
   * Generates a club with Pareto-distributed finances and a full 25-man squad
   */
  public static generateClub(
    prng: PRNG,
    tier: 1 | 2,
    clubIndex: number,
    totalClubs: number = 20
  ): Club {
    const dist = new DistributionEngine(prng);
    const clubId = `club-${tier}-${clubIndex + 1}`;

    const info = NameGenerator.generateClubInfo(prng, tier, clubIndex);

    // Rank from 0 (highest powerhouse) to 19 (relegation candidate)
    // We sort/assign economic scale based on Pareto power law
    // Pareto alpha: ~1.6 generates authentic football financial concentration
    const paretoMultiplier = dist.samplePareto(1.65, 1.0, 7.5);
    // Normalize into rank strength [0.15 to 1.0]
    const relativePower = Math.min(1.0, Math.max(0.12, (totalClubs - clubIndex) / totalClubs * 0.7 + (paretoMultiplier - 1.0) * 0.12));

    // Reputation: 1 - 10000
    // Tier 1: 5200 to 9750
    // Tier 2: 2400 to 5500
    const reputationMin = tier === 1 ? 5200 : 2400;
    const reputationMax = tier === 1 ? 9750 : 5500;
    const reputation = Math.round(
      reputationMin + relativePower * (reputationMax - reputationMin) + prng.nextInt(-150, 150)
    );

    // Stadium Capacity: Power-law correlation with reputation
    // Tier 1: 22,000 to 82,000
    // Tier 2: 12,000 to 38,000
    const stadiumBase = tier === 1 ? 22000 : 12000;
    const stadiumSpan = tier === 1 ? 60000 : 26000;
    const stadiumCapacity = Math.round((stadiumBase + Math.pow(relativePower, 1.4) * stadiumSpan) / 500) * 500;

    // Weekly Wage Budget:
    // Tier 1: £650k to £4.5M per week
    // Tier 2: £180k to £950k per week
    const wageBudgetBase = tier === 1 ? 750000 : 180000;
    const wageBudgetSpan = tier === 1 ? 3800000 : 780000;
    const wageBudgetWeekly = Math.round(
      (wageBudgetBase + Math.pow(relativePower, 1.8) * wageBudgetSpan) / 10000
    ) * 10000;

    // Transfer Budget:
    // Tier 1: £12M to £160M
    // Tier 2: £1.5M to £22M
    const transferBase = tier === 1 ? 12000000 : 1500000;
    const transferSpan = tier === 1 ? 150000000 : 22000000;
    const transferBudget = Math.round(
      (transferBase + Math.pow(relativePower, 2.0) * transferSpan) / 250000
    ) * 250000;

    const balance = Math.round(transferBudget * 1.6 + wageBudgetWeekly * 12);
    const ticketPriceAverage = tier === 1 ? Math.round(38 + relativePower * 42) : Math.round(20 + relativePower * 18);

    // Target squad CA mean correlates with club reputation
    // Tier 1: powerhouse clubs ~160 CA, mid-table ~145, bottom ~130
    // Tier 2: powerhouse ~130 CA, mid-table ~115, bottom ~100
    const targetCaMean = tier === 1
      ? 128 + relativePower * 34
      : 98 + relativePower * 30;

    // Generate 25 squad members
    const players: Player[] = [];
    let currentWageBillWeekly = 0;

    for (let i = 0; i < this.SQUAD_POSITION_TEMPLATE.length; i++) {
      const pos = this.SQUAD_POSITION_TEMPLATE[i];
      const playerId = `${clubId}-p${i + 1}`;
      
      // Starters get slightly higher CA than deep reserves
      const isStarter = i < 11;
      const slotCaMean = isStarter ? targetCaMean + 4 : targetCaMean - 5;
      
      const player = PlayerGenerator.generatePlayer(
        prng,
        tier,
        pos,
        playerId,
        undefined,
        slotCaMean
      );

      players.push(player);
      currentWageBillWeekly += player.wageWeekly;
    }

    const finances: ClubFinances = {
      wageBudgetWeekly,
      currentWageBillWeekly,
      transferBudget,
      balance,
      stadiumCapacity,
      ticketPriceAverage
    };

    return {
      id: clubId,
      name: info.name,
      shortName: info.shortName,
      code: info.code,
      tier,
      reputation,
      stadiumName: info.stadiumName,
      finances,
      primaryColor: info.primaryColor,
      secondaryColor: info.secondaryColor,
      players,
      activeTacticId: 'preset-433-dm-wide'
    };
  }
}
