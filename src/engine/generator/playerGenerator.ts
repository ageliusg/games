// ==========================================
// Procedural Player Generator
// Mathematically grounded player creation
// ==========================================

import {
  Player,
  Position,
  HiddenVariables
} from '../../types';
import { PRNG } from '../math/prng';
import { DistributionEngine } from '../math/gaussian';
import { NameGenerator } from './nameGenerator';
import { AttributeModel } from './attributes';

export class PlayerGenerator {
  /**
   * Generates a single player with statistical distribution scaled to tier
   */
  public static generatePlayer(
    prng: PRNG,
    tier: 1 | 2,
    position: Position,
    id: string,
    forcedAge?: number,
    targetCaMean?: number
  ): Player {
    const dist = new DistributionEngine(prng);

    // 1. Age generation (17 - 35) with bell curve centered around 25.5
    const age = forcedAge ?? dist.sampleGaussianInt(25.5, 3.8, 17, 35);

    // 2. CA generation according to Tier distribution
    // Tier 1: mu = 145, sigma = 18, clipped [90, 200]
    // Tier 2: mu = 115, sigma = 15, clipped [70, 155]
    const caMean = targetCaMean ?? (tier === 1 ? 145 : 115);
    const caSigma = tier === 1 ? 18 : 15;
    const minCa = tier === 1 ? 90 : 70;
    const maxCa = tier === 1 ? 200 : 155;

    let ca = dist.sampleGaussianInt(caMean, caSigma, minCa, maxCa);

    // Age adjustment on CA: teenagers are typically developing
    if (age <= 19) {
      ca = Math.max(minCa, Math.round(ca * 0.82));
    } else if (age <= 22) {
      ca = Math.max(minCa, Math.round(ca * 0.92));
    } else if (age >= 33) {
      ca = Math.max(minCa, Math.round(ca * (1.0 - (age - 32) * 0.04)));
    }

    // 3. PA generation (PA >= CA, capped at 200)
    // Young players have significant potential upside
    let paGrowthPotential = 0;
    if (age <= 20) {
      paGrowthPotential = dist.sampleGaussianInt(25, 12, 10, 55);
    } else if (age <= 23) {
      paGrowthPotential = dist.sampleGaussianInt(14, 8, 4, 30);
    } else if (age <= 27) {
      paGrowthPotential = dist.sampleGaussianInt(5, 4, 0, 12);
    } else {
      paGrowthPotential = dist.sampleGaussianInt(1, 2, 0, 5);
    }

    const pa = Math.min(200, ca + paGrowthPotential);

    // 4. Hidden Variables (1 - 20)
    const hidden: HiddenVariables = {
      currentAbility: ca,
      potentialAbility: pa,
      consistency: dist.sampleGaussianInt(12, 3.2, 1, 20),
      dirtiness: dist.sampleGaussianInt(9, 4.0, 1, 20),
      injuryProneness: dist.sampleGaussianInt(10, 3.8, 1, 20),
      ambition: dist.sampleGaussianInt(12, 3.5, 1, 20),
      professionalism: dist.sampleGaussianInt(12.5, 3.6, 1, 20),
      loyalty: dist.sampleGaussianInt(11.5, 3.5, 1, 20),
      pressure: dist.sampleGaussianInt(12, 3.4, 1, 20),
      temperament: dist.sampleGaussianInt(12, 3.8, 1, 20)
    };

    // 5. Attributes Matrix
    const attributes = AttributeModel.generateAttributes(
      ca,
      position,
      dist,
      hidden.consistency
    );

    // 6. Personality Archetype
    const personality = AttributeModel.derivePersonality(
      hidden,
      attributes.mental.determination,
      attributes.mental.teamwork,
      attributes.mental.decisions
    );

    // 7. Identity & Preferred Foot
    const { name, nationality } = NameGenerator.generatePlayerName(prng);
    const footRoll = prng.next();
    const preferredFoot = footRoll < 0.68 ? 'Right' : (footRoll < 0.90 ? 'Left' : 'Both');

    // Secondary Positions
    const secondaryPositions: Position[] = [];
    if (position === 'LB') secondaryPositions.push('CB', 'LM');
    else if (position === 'RB') secondaryPositions.push('CB', 'RM');
    else if (position === 'CB') secondaryPositions.push('DM');
    else if (position === 'DM') secondaryPositions.push('CM', 'CB');
    else if (position === 'CM') secondaryPositions.push('DM', 'AM');
    else if (position === 'AM') secondaryPositions.push('CM', 'LW', 'RW');
    else if (position === 'LW') secondaryPositions.push('LM', 'RW', 'ST');
    else if (position === 'RW') secondaryPositions.push('RM', 'LW', 'ST');
    else if (position === 'ST') secondaryPositions.push('AM');

    // 8. Valuation and Wage Modeling
    // Exponential curve for wages based on CA and Tier
    // CA 90: ~£2,500/wk; CA 130: ~£25,000/wk; CA 160: ~£110,000/wk; CA 190: ~£320,000/wk
    const wageExponent = Math.pow((ca - 60) / 130, 2.8);
    const baseWage = 2000 + wageExponent * (tier === 1 ? 320000 : 80000);
    const wageWeekly = Math.round(baseWage / 500) * 500;

    // Market Value factors CA, PA, and youth premium
    const ageMultiplier = age < 24 ? 1.45 : (age < 29 ? 1.15 : Math.max(0.2, 1.0 - (age - 29) * 0.15));
    const valueExponent = Math.pow((ca - 60) / 130, 3.1);
    const rawValue = (500000 + valueExponent * 115000000) * ageMultiplier;
    const marketValue = Math.round(rawValue / 50000) * 50000;

    const contractYears = prng.nextInt(1, 5);

    return {
      id,
      name,
      age,
      nationality,
      position,
      secondaryPositions,
      preferredFoot,
      attributes,
      hidden,
      personality,
      wageWeekly,
      marketValue,
      contractYears,
      condition: 100,
      morale: prng.nextInt(75, 95)
    };
  }
}
