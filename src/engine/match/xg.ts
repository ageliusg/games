// ==========================================
// Expected Goals (xG) Mathematical Engine
// Spatial Geometry & Stochastic Duel Resolution
// ==========================================

import { Player, ShotType, ShotOutcome, PitchZone } from '../../types';
import { PRNG } from '../math/prng';
import { PitchGeometry, Point2D } from '../math/vector';

export interface XgEvaluationResult {
  xG: number;
  shotPoint: Point2D;
  distanceMeters: number;
  angleRadians: number;
  outcome: ShotOutcome;
}

export class ExpectedGoalsEngine {
  /**
   * Calculates xG for a shot using spatial geometry and player attributes
   */
  public static evaluateShot(
    prng: PRNG,
    shooter: Player,
    goalkeeper: Player,
    defendersInRange: Player[],
    shotType: ShotType,
    zone: PitchZone,
    _isHomeTeam: boolean,
    effectiveAttMultiplier: number = 1.0,
    effectiveDefMultiplier: number = 1.0
  ): XgEvaluationResult {
    // 1. Generate realistic shot coordinates based on zone & shot type
    const shotPoint = this.generateShotLocation(prng, zone, shotType);

    // 2. Spatial geometry metrics
    const distanceMeters = PitchGeometry.distanceInMeters(shotPoint, { x: 100, y: 50 });
    const angleRadians = PitchGeometry.goalAngle(shotPoint);

    // 3. Base geometric probability: angle subtended by goal vs distance decay
    // Higher angle = larger target visible; distance decay exp(-k * d)
    const normalizedAngle = angleRadians / Math.PI; // [0, 1]
    const distanceDecay = Math.exp(-0.078 * distanceMeters);
    const geometricBase = Math.min(0.85, normalizedAngle * 1.8 * distanceDecay);

    // 4. Shooter Skill Factor: Finishing (45%), Technique (35%), Composure (20%)
    const shooterFinishing = shooter.attributes.technical.finishing * effectiveAttMultiplier;
    const shooterTechnique = shooter.attributes.technical.technique * effectiveAttMultiplier;
    const shooterComposure = shooter.attributes.mental.composure * effectiveAttMultiplier;
    const shooterSkillRaw = (shooterFinishing * 0.45 + shooterTechnique * 0.35 + shooterComposure * 0.20);
    // Baseline is 11.0 on 1-20 scale; scaling factor [0.65 to 1.45]
    const shooterSkillFactor = Math.pow(shooterSkillRaw / 11.5, 0.85);

    // 5. Defensive Pressure Factor: nearby defenders' positioning & bravery
    let pressureFactor = 1.0;
    if (defendersInRange.length > 0) {
      const avgDefScore = defendersInRange.reduce((acc, def) => {
        const pos = def.attributes.mental.positioning * effectiveDefMultiplier;
        const brav = def.attributes.mental.bravery * effectiveDefMultiplier;
        const tack = def.attributes.technical.tackling * effectiveDefMultiplier;
        return acc + (pos * 0.4 + brav * 0.3 + tack * 0.3);
      }, 0) / defendersInRange.length;

      // Higher defensive pressure reduces shot quality
      pressureFactor = Math.max(0.45, 1.0 - (avgDefScore / 20.0) * 0.42);
    }

    // 6. Goalkeeper Factor: Reflexes, One-on-Ones, Positioning
    const gkReflexes = goalkeeper.attributes.goalkeeping.reflexes * effectiveDefMultiplier;
    const gkOneOnOnes = goalkeeper.attributes.goalkeeping.oneOnOnes * effectiveDefMultiplier;
    const gkPositioning = goalkeeper.attributes.mental.positioning * effectiveDefMultiplier;
    const gkSkillRaw = (gkReflexes * 0.42 + gkOneOnOnes * 0.33 + gkPositioning * 0.25);
    const gkResistance = Math.max(0.70, Math.min(1.35, Math.pow(gkSkillRaw / 11.5, 0.75)));

    // 7. Shot Type Modifiers
    let shotTypeModifier = 1.0;
    switch (shotType) {
      case 'counter_1v1':
        shotTypeModifier = 1.55; // 1-on-1 breakaway clear cut chance
        break;
      case 'header':
        // Heading skill vs aerial reach of GK
        const headingSkill = shooter.attributes.technical.heading * effectiveAttMultiplier;
        const gkReach = goalkeeper.attributes.goalkeeping.aerialReach * effectiveDefMultiplier;
        shotTypeModifier = 0.55 * (headingSkill / Math.max(8, gkReach));
        break;
      case 'long_shot':
        shotTypeModifier = 0.70;
        break;
      case 'penalty':
        // Standard expected value of penalty in professional football is ~0.76 - 0.79
        shotTypeModifier = 1.0;
        break;
      case 'open_play':
      default:
        shotTypeModifier = 1.0;
    }

    // 8. Compute final Expected Goals value
    let rawXg: number;
    if (shotType === 'penalty') {
      const compDiff = (shooterComposure - gkReflexes) / 20;
      rawXg = 0.78 + compDiff * 0.08;
    } else {
      rawXg = (geometricBase * shooterSkillFactor * pressureFactor * shotTypeModifier) / gkResistance;
    }

    // Clamp xG to realistic mathematical bounds [0.015, 0.94]
    const xG = Math.max(0.015, Math.min(0.94, Math.round(rawXg * 1000) / 1000));

    // 9. Stochastic Resolution using PRNG
    const roll = prng.next();
    let outcome: ShotOutcome;

    if (roll < xG) {
      outcome = 'goal';
    } else {
      // Missed shot: evaluate if saved, blocked, or off target
      const missRoll = prng.next();
      const onTargetProb = Math.min(0.85, 0.45 + (shooterTechnique / 20) * 0.35);

      if (missRoll < onTargetProb) {
        // On target -> saved by GK or blocked by defender
        const blockProb = (defendersInRange.length > 0) ? 0.32 : 0.08;
        outcome = prng.next() < blockProb ? 'blocked' : 'saved';
      } else {
        outcome = 'off_target';
      }
    }

    return {
      xG,
      shotPoint,
      distanceMeters: Math.round(distanceMeters * 10) / 10,
      angleRadians: Math.round(angleRadians * 100) / 100,
      outcome
    };
  }

  /**
   * Generates plausible spatial coordinate on 0-100 pitch
   */
  private static generateShotLocation(
    prng: PRNG,
    zone: PitchZone,
    shotType: ShotType
  ): Point2D {
    if (shotType === 'penalty') {
      return { x: 88.5, y: 50 }; // penalty spot
    }

    let xMin = 84;
    let xMax = 98;
    let yMin = 34;
    let yMax = 66;

    if (shotType === 'counter_1v1') {
      xMin = 88;
      xMax = 96;
      yMin = 42;
      yMax = 58;
    } else if (zone === 'attacking_halfspace') {
      xMin = 74;
      xMax = 86;
      yMin = prng.nextBool() ? 22 : 62;
      yMax = yMin + 16;
    } else if (zone === 'wide_flanks') {
      xMin = 78;
      xMax = 92;
      yMin = prng.nextBool() ? 10 : 75;
      yMax = yMin + 15;
    } else if (shotType === 'long_shot' || zone === 'midfield') {
      xMin = 68;
      xMax = 82;
      yMin = 32;
      yMax = 68;
    }

    return {
      x: Math.round(prng.nextFloat(xMin, xMax) * 10) / 10,
      y: Math.round(prng.nextFloat(yMin, yMax) * 10) / 10
    };
  }
}
