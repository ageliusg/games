// ==========================================
// Attribute Matrix & Positional Weighting
// ==========================================

import {
  Position,
  PlayerAttributes,
  HiddenVariables,
  PersonalityType
} from '../../types';
import { DistributionEngine } from '../math/gaussian';

export type AttributeKey =
  | 'finishing' | 'passing' | 'tackling' | 'technique' | 'firstTouch'
  | 'crossing' | 'dribbling' | 'heading'
  | 'decisions' | 'vision' | 'composure' | 'anticipation' | 'positioning'
  | 'workRate' | 'determination' | 'bravery' | 'teamwork'
  | 'pace' | 'acceleration' | 'stamina' | 'strength' | 'agility'
  | 'balance' | 'naturalFitness'
  | 'reflexes' | 'handling' | 'oneOnOnes' | 'aerialReach' | 'kicking';

export class AttributeModel {
  // Positional weighting matrix: attribute key -> relative importance weight (0.2 to 2.2)
  public static readonly POSITIONAL_WEIGHTS: Record<Position, Partial<Record<AttributeKey, number>>> = {
    GK: {
      reflexes: 2.2, handling: 2.0, oneOnOnes: 1.8, aerialReach: 1.8, kicking: 1.4,
      positioning: 1.8, decisions: 1.6, anticipation: 1.5, composure: 1.4, bravery: 1.5,
      agility: 1.6, balance: 1.2, strength: 1.2, passing: 0.8, naturalFitness: 1.0,
      tackling: 0.2, finishing: 0.1, crossing: 0.1, dribbling: 0.2, heading: 0.2
    },
    CB: {
      tackling: 2.1, heading: 2.0, positioning: 2.0, bravery: 1.8, strength: 1.9,
      decisions: 1.7, anticipation: 1.6, composure: 1.4, passing: 1.1, pace: 1.3,
      acceleration: 1.2, stamina: 1.3, workRate: 1.4, teamwork: 1.5,
      finishing: 0.2, crossing: 0.3, dribbling: 0.4, technique: 0.8, firstTouch: 0.9,
      reflexes: 0.1, handling: 0.1, oneOnOnes: 0.1, aerialReach: 0.1, kicking: 0.1
    },
    LB: {
      tackling: 1.7, crossing: 1.7, pace: 1.8, acceleration: 1.7, stamina: 1.9,
      positioning: 1.6, workRate: 1.7, decisions: 1.5, passing: 1.4, dribbling: 1.3,
      technique: 1.3, anticipation: 1.4, teamwork: 1.4, strength: 1.2, heading: 1.0,
      finishing: 0.4, bravery: 1.3, firstTouch: 1.3,
      reflexes: 0.1, handling: 0.1, oneOnOnes: 0.1, aerialReach: 0.1, kicking: 0.1
    },
    RB: {
      tackling: 1.7, crossing: 1.7, pace: 1.8, acceleration: 1.7, stamina: 1.9,
      positioning: 1.6, workRate: 1.7, decisions: 1.5, passing: 1.4, dribbling: 1.3,
      technique: 1.3, anticipation: 1.4, teamwork: 1.4, strength: 1.2, heading: 1.0,
      finishing: 0.4, bravery: 1.3, firstTouch: 1.3,
      reflexes: 0.1, handling: 0.1, oneOnOnes: 0.1, aerialReach: 0.1, kicking: 0.1
    },
    DM: {
      tackling: 2.0, positioning: 1.9, decisions: 1.8, anticipation: 1.7, passing: 1.6,
      workRate: 1.8, stamina: 1.8, strength: 1.7, composure: 1.5, teamwork: 1.7,
      bravery: 1.6, firstTouch: 1.4, technique: 1.3, heading: 1.3, pace: 1.2,
      finishing: 0.5, crossing: 0.6, dribbling: 0.9,
      reflexes: 0.1, handling: 0.1, oneOnOnes: 0.1, aerialReach: 0.1, kicking: 0.1
    },
    CM: {
      passing: 2.0, decisions: 1.9, vision: 1.9, technique: 1.8, firstTouch: 1.8,
      composure: 1.7, workRate: 1.7, stamina: 1.7, anticipation: 1.6, positioning: 1.5,
      tackling: 1.3, dribbling: 1.4, teamwork: 1.7, pace: 1.2, acceleration: 1.2,
      finishing: 1.0, crossing: 1.1, strength: 1.2, bravery: 1.3,
      reflexes: 0.1, handling: 0.1, oneOnOnes: 0.1, aerialReach: 0.1, kicking: 0.1
    },
    LM: {
      crossing: 1.9, dribbling: 1.8, pace: 1.8, acceleration: 1.8, technique: 1.7,
      passing: 1.5, firstTouch: 1.6, stamina: 1.6, workRate: 1.5, vision: 1.4,
      decisions: 1.4, composure: 1.3, finishing: 1.1, agility: 1.6, balance: 1.4,
      tackling: 0.7, positioning: 0.8, heading: 0.6,
      reflexes: 0.1, handling: 0.1, oneOnOnes: 0.1, aerialReach: 0.1, kicking: 0.1
    },
    RM: {
      crossing: 1.9, dribbling: 1.8, pace: 1.8, acceleration: 1.8, technique: 1.7,
      passing: 1.5, firstTouch: 1.6, stamina: 1.6, workRate: 1.5, vision: 1.4,
      decisions: 1.4, composure: 1.3, finishing: 1.1, agility: 1.6, balance: 1.4,
      tackling: 0.7, positioning: 0.8, heading: 0.6,
      reflexes: 0.1, handling: 0.1, oneOnOnes: 0.1, aerialReach: 0.1, kicking: 0.1
    },
    AM: {
      vision: 2.1, technique: 2.0, passing: 2.0, decisions: 1.9, composure: 1.8,
      firstTouch: 1.9, dribbling: 1.8, anticipation: 1.7, finishing: 1.5, agility: 1.6,
      acceleration: 1.5, pace: 1.3, stamina: 1.3, workRate: 1.3, teamwork: 1.5,
      tackling: 0.5, positioning: 0.7, strength: 1.0, heading: 0.6,
      reflexes: 0.1, handling: 0.1, oneOnOnes: 0.1, aerialReach: 0.1, kicking: 0.1
    },
    LW: {
      dribbling: 2.0, pace: 2.0, acceleration: 2.0, technique: 1.8, agility: 1.8,
      finishing: 1.6, firstTouch: 1.7, crossing: 1.5, composure: 1.5, decisions: 1.4,
      vision: 1.4, anticipation: 1.5, balance: 1.5, stamina: 1.4,
      tackling: 0.4, positioning: 0.6, heading: 0.7, strength: 1.0,
      reflexes: 0.1, handling: 0.1, oneOnOnes: 0.1, aerialReach: 0.1, kicking: 0.1
    },
    RW: {
      dribbling: 2.0, pace: 2.0, acceleration: 2.0, technique: 1.8, agility: 1.8,
      finishing: 1.6, firstTouch: 1.7, crossing: 1.5, composure: 1.5, decisions: 1.4,
      vision: 1.4, anticipation: 1.5, balance: 1.5, stamina: 1.4,
      tackling: 0.4, positioning: 0.6, heading: 0.7, strength: 1.0,
      reflexes: 0.1, handling: 0.1, oneOnOnes: 0.1, aerialReach: 0.1, kicking: 0.1
    },
    ST: {
      finishing: 2.2, composure: 2.0, anticipation: 1.9, firstTouch: 1.8, heading: 1.7,
      decisions: 1.6, technique: 1.6, strength: 1.6, acceleration: 1.6, pace: 1.5,
      dribbling: 1.4, balance: 1.4, workRate: 1.3, bravery: 1.4, passing: 1.0,
      tackling: 0.3, positioning: 1.2, crossing: 0.5,
      reflexes: 0.1, handling: 0.1, oneOnOnes: 0.1, aerialReach: 0.1, kicking: 0.1
    }
  };

  /**
   * Generates a full attribute matrix for a player based on their CA, position, and seed
   */
  public static generateAttributes(
    ca: number, // 1 - 200
    position: Position,
    dist: DistributionEngine,
    consistency: number
  ): PlayerAttributes {
    // Normal base attribute level corresponding to CA on 1-20 scale
    // CA 100 -> ~10, CA 150 -> ~15, CA 200 -> ~20
    const baseAttr = (ca / 200) * 19 + 1; // 1.09 to 20.0
    const weights = this.POSITIONAL_WEIGHTS[position];

    // Compute standard attributes
    const sampleAttr = (key: AttributeKey, defaultWeight: number = 1.0): number => {
      const w = weights[key] ?? defaultWeight;
      // Attributes scale with CA modulated by positional weight and a small Gaussian deviation
      // Higher consistency reduces individual attribute variance
      const noiseSigma = Math.max(0.7, 2.2 - (consistency / 20) * 1.0);
      const targetMean = baseAttr * Math.pow(w, 0.45);
      const val = dist.sampleGaussian(targetMean, noiseSigma);
      return Math.max(1, Math.min(20, Math.round(val)));
    };

    // Goalkeeping specific rule
    const isGK = position === 'GK';

    return {
      technical: {
        finishing: isGK ? 1 : sampleAttr('finishing', 0.6),
        passing: sampleAttr('passing', 1.0),
        tackling: isGK ? 1 : sampleAttr('tackling', 0.8),
        technique: sampleAttr('technique', 1.0),
        firstTouch: sampleAttr('firstTouch', 1.0),
        crossing: isGK ? 1 : sampleAttr('crossing', 0.6),
        dribbling: isGK ? 1 : sampleAttr('dribbling', 0.7),
        heading: isGK ? 1 : sampleAttr('heading', 0.7)
      },
      mental: {
        decisions: sampleAttr('decisions', 1.2),
        vision: isGK ? sampleAttr('vision', 0.6) : sampleAttr('vision', 1.0),
        composure: sampleAttr('composure', 1.1),
        anticipation: sampleAttr('anticipation', 1.1),
        positioning: sampleAttr('positioning', 1.2),
        workRate: sampleAttr('workRate', 1.0),
        determination: dist.sampleGaussianInt(12, 3.5, 1, 20),
        bravery: sampleAttr('bravery', 1.0),
        teamwork: sampleAttr('teamwork', 1.1)
      },
      physical: {
        pace: isGK ? Math.min(13, sampleAttr('pace', 0.8)) : sampleAttr('pace', 1.1),
        acceleration: isGK ? Math.min(13, sampleAttr('acceleration', 0.8)) : sampleAttr('acceleration', 1.1),
        stamina: sampleAttr('stamina', 1.1),
        strength: sampleAttr('strength', 1.0),
        agility: sampleAttr('agility', 1.1),
        balance: sampleAttr('balance', 1.0),
        naturalFitness: dist.sampleGaussianInt(13, 3.0, 1, 20)
      },
      goalkeeping: {
        reflexes: isGK ? sampleAttr('reflexes', 2.0) : 1,
        handling: isGK ? sampleAttr('handling', 2.0) : 1,
        oneOnOnes: isGK ? sampleAttr('oneOnOnes', 1.8) : 1,
        aerialReach: isGK ? sampleAttr('aerialReach', 1.8) : 1,
        kicking: isGK ? sampleAttr('kicking', 1.4) : Math.min(10, sampleAttr('kicking', 0.4))
      }
    };
  }

  /**
   * Derives a descriptive personality archetype from mental and hidden traits
   */
  public static derivePersonality(
    hidden: HiddenVariables,
    determination: number,
    teamwork: number,
    decisions: number
  ): PersonalityType {
    const { professionalism, ambition, loyalty, pressure, temperament } = hidden;

    if (professionalism >= 18 && temperament >= 12) return 'Model Professional';
    if (pressure >= 17 && determination >= 15) return 'Iron Willed';
    if (determination >= 18 && ambition >= 14) return 'Driven';
    if (determination >= 15 && professionalism >= 15) return 'Resolute';
    if (determination >= 15 && teamwork >= 15 && decisions >= 14) return 'Leader';
    if (determination >= 17) return 'Determined';
    if (professionalism >= 15) return 'Professional';
    if (ambition >= 16 && loyalty <= 6) return 'Mercenary';
    if (ambition >= 15 && loyalty <= 9) return 'Ambitious';
    if (pressure >= 14 && temperament >= 14) return 'Spirited';
    if (professionalism >= 13) return 'Fairly Professional';
    return 'Balanced';
  }
}
