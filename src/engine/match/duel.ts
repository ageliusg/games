// ==========================================
// Tactical Duel & Spatial Resolution Engine
// Probabilistic duels for ball progression
// ==========================================

import {
  Player,
  PitchZone,
  MatchEventType,
  Tactic,
  RoleDuty
} from '../../types';
import { PRNG } from '../math/prng';
import { FatigueModel } from './fatigue';

export interface DuelOutcome {
  eventType: MatchEventType;
  success: boolean;
  nextZone: PitchZone;
  possessionRetained: boolean;
  isFoul: boolean;
  card?: 'yellow_card' | 'red_card';
  isOffside?: boolean;
  isCorner?: boolean;
  primaryPlayer: Player;
  secondaryPlayer?: Player;
  commentaryTemplate: string;
}

export class DuelEngine {
  /**
   * Resolves midfield possession contest between two teams
   */
  public static resolveMidfieldContest(
    prng: PRNG,
    homeMidfielders: { player: Player; duty: RoleDuty }[],
    awayMidfielders: { player: Player; duty: RoleDuty }[],
    homeTactic: Tactic,
    awayTactic: Tactic,
    homeConditions: Map<string, number>,
    awayConditions: Map<string, number>
  ): 'home' | 'away' {
    const calcMidfieldScore = (
      mids: { player: Player; duty: RoleDuty }[],
      tactic: Tactic,
      conditions: Map<string, number>
    ): number => {
      if (mids.length === 0) return 10.0;
      let total = 0;
      for (const { player } of mids) {
        const cond = conditions.get(player.id) ?? 100;
        const mult = FatigueModel.getEffectiveMultiplier(cond);
        const { passing, technique } = player.attributes.technical;
        const { vision, decisions, workRate } = player.attributes.mental;
        const score = (passing * 0.25 + vision * 0.25 + decisions * 0.2 + workRate * 0.15 + technique * 0.15) * mult;
        total += score;
      }

      // Tactical tempo modifier on midfield control
      let tempoMod = 1.0;
      if (tactic.inPossession.tempo === 'High') tempoMod = 1.08;
      if (tactic.inPossession.tempo === 'Low') tempoMod = 1.04; // patience
      if (tactic.inPossession.directness === 'Short') tempoMod *= 1.1; // tiki-taka retention
      if (tactic.inPossession.directness === 'Route One') tempoMod *= 0.85; // bypass midfield

      // Pressing intensity impact
      if (tactic.outOfPossession.pressingIntensity === 'Frequent' || tactic.outOfPossession.pressingIntensity === 'Extreme') {
        tempoMod *= 1.06;
      }

      return total * tempoMod;
    };

    const homeScore = calcMidfieldScore(homeMidfielders, homeTactic, homeConditions);
    const awayScore = calcMidfieldScore(awayMidfielders, awayTactic, awayConditions);

    const total = homeScore + awayScore;
    const homeProb = total > 0 ? homeScore / total : 0.5;

    // Small home turf boost (52.5% neutral baseline)
    const adjustedHomeProb = Math.min(0.85, Math.max(0.15, homeProb * 1.03));
    return prng.next() < adjustedHomeProb ? 'home' : 'away';
  }

  /**
   * Resolves ball progression duel within a specific spatial zone
   */
  public static resolveZoneProgression(
    prng: PRNG,
    currentZone: PitchZone,
    attacker: Player,
    defender: Player,
    attCondition: number,
    defCondition: number,
    tactic: Tactic,
    defTactic: Tactic
  ): DuelOutcome {
    const attMult = FatigueModel.getEffectiveMultiplier(attCondition);
    const defMult = FatigueModel.getEffectiveMultiplier(defCondition);

    // Offside trap check when moving into penalty box or attacking halfspace
    if (defTactic.outOfPossession.offsideTrap && (currentZone === 'attacking_halfspace' || currentZone === 'penalty_box')) {
      const offsideRisk = defTactic.outOfPossession.defensiveLine === 'Much Higher Line' ? 0.14 : 0.08;
      const attAnticipation = attacker.attributes.mental.anticipation * attMult;
      const defPositioning = defender.attributes.mental.positioning * defMult;
      
      const offsideProb = Math.max(0.02, offsideRisk * (defPositioning / Math.max(6, attAnticipation)));
      if (prng.next() < offsideProb) {
        return {
          eventType: 'offside',
          success: false,
          nextZone: 'defensive_third',
          possessionRetained: false,
          isFoul: false,
          isOffside: true,
          primaryPlayer: attacker,
          secondaryPlayer: defender,
          commentaryTemplate: '{att} flagged for offside as {def} steps up the defensive trap.'
        };
      }
    }

    // Determine Attacker Action: Pass (60%), Dribble (30%), Cross (10% if wide)
    const isWide = currentZone === 'wide_flanks';
    const actionRoll = prng.next();

    if (isWide && actionRoll < 0.45) {
      // Crossing Duel into Penalty Box
      return this.resolveCrossingDuel(prng, attacker, defender, attMult, defMult);
    } else if (actionRoll < 0.32) {
      // 1v1 Dribble Duel
      return this.resolveDribbleDuel(prng, currentZone, attacker, defender, attMult, defMult, defTactic);
    } else {
      // Passing / Distribution Duel
      return this.resolvePassDuel(prng, currentZone, attacker, defender, attMult, defMult, tactic, defTactic);
    }
  }

  private static resolveCrossingDuel(
    prng: PRNG,
    attacker: Player,
    defender: Player,
    attMult: number,
    defMult: number
  ): DuelOutcome {
    const crossingSkill = (attacker.attributes.technical.crossing * 0.6 + attacker.attributes.technical.technique * 0.4) * attMult;
    const defClearance = (defender.attributes.mental.positioning * 0.5 + defender.attributes.technical.heading * 0.3 + defender.attributes.physical.strength * 0.2) * defMult;

    const crossSuccessProb = Math.min(0.75, Math.max(0.2, (crossingSkill / (crossingSkill + defClearance)) * 0.9));
    const success = prng.next() < crossSuccessProb;

    if (success) {
      return {
        eventType: 'pass',
        success: true,
        nextZone: 'penalty_box',
        possessionRetained: true,
        isFoul: false,
        primaryPlayer: attacker,
        secondaryPlayer: defender,
        commentaryTemplate: '{att} delivers a dangerous cross from the flank into the crowded box!'
      };
    } else {
      // Defender intercepts / clears or deflects out for a corner
      const isCorner = prng.next() < 0.35;
      return {
        eventType: isCorner ? 'corner' : 'interception',
        success: false,
        nextZone: isCorner ? 'penalty_box' : 'defensive_third',
        possessionRetained: isCorner,
        isFoul: false,
        isCorner,
        primaryPlayer: defender,
        secondaryPlayer: attacker,
        commentaryTemplate: isCorner
          ? '{def} deflects {att}\'s cross out behind the byline for a corner kick.'
          : '{def} rises tall to clear the whipped delivery from {att}.'
      };
    }
  }

  private static resolveDribbleDuel(
    prng: PRNG,
    currentZone: PitchZone,
    attacker: Player,
    defender: Player,
    attMult: number,
    defMult: number,
    defTactic: Tactic
  ): DuelOutcome {
    const attDribblePower = (
      attacker.attributes.technical.dribbling * 0.35 +
      attacker.attributes.physical.agility * 0.25 +
      attacker.attributes.physical.pace * 0.25 +
      attacker.attributes.physical.balance * 0.15
    ) * attMult;

    const defTacklePower = (
      defender.attributes.technical.tackling * 0.4 +
      defender.attributes.mental.anticipation * 0.25 +
      defender.attributes.physical.strength * 0.2 +
      defender.attributes.mental.decisions * 0.15
    ) * defMult;

    const winProb = attDribblePower / (attDribblePower + defTacklePower);
    const success = prng.next() < winProb;

    if (success) {
      const nextZone = this.getNextAdvancedZone(currentZone);
      return {
        eventType: 'dribble',
        success: true,
        nextZone,
        possessionRetained: true,
        isFoul: false,
        primaryPlayer: attacker,
        secondaryPlayer: defender,
        commentaryTemplate: '{att} displays dazzling footwork, skipping past {def}!'
      };
    } else {
      // Tackle or Foul check
      const foulRisk = (defender.hidden.dirtiness / 20) * 0.28 + (defTactic.outOfPossession.pressingIntensity === 'Extreme' ? 0.1 : 0.0);
      const isFoul = prng.next() < foulRisk;

      if (isFoul) {
        const cardRoll = prng.next();
        let card: 'yellow_card' | 'red_card' | undefined;
        if (cardRoll < 0.02) card = 'red_card';
        else if (cardRoll < 0.22) card = 'yellow_card';

        return {
          eventType: card ?? 'foul',
          success: false,
          nextZone: currentZone,
          possessionRetained: true, // Attacking team gets free kick
          isFoul: true,
          card,
          primaryPlayer: defender,
          secondaryPlayer: attacker,
          commentaryTemplate: card === 'red_card'
            ? 'RED CARD! {def} commits a reckless, dangerous challenge on {att}!'
            : (card === 'yellow_card'
              ? 'Yellow card! {def} booked for bringing down {att} abruptly.'
              : 'Whistle blown: {def} fouls {att} during the duel.')
        };
      }

      return {
        eventType: 'tackle',
        success: false,
        nextZone: this.getDefensiveRecoveryZone(currentZone),
        possessionRetained: false,
        isFoul: false,
        primaryPlayer: defender,
        secondaryPlayer: attacker,
        commentaryTemplate: '{def} times the challenge to perfection, stripping {att} of possession.'
      };
    }
  }

  private static resolvePassDuel(
    prng: PRNG,
    currentZone: PitchZone,
    attacker: Player,
    defender: Player,
    attMult: number,
    defMult: number,
    attTactic: Tactic,
    _defTactic: Tactic
  ): DuelOutcome {
    const passSkill = (
      attacker.attributes.technical.passing * 0.4 +
      attacker.attributes.mental.vision * 0.3 +
      attacker.attributes.technical.technique * 0.15 +
      attacker.attributes.mental.decisions * 0.15
    ) * attMult;

    const interceptSkill = (
      defender.attributes.mental.positioning * 0.45 +
      defender.attributes.mental.anticipation * 0.35 +
      defender.attributes.physical.acceleration * 0.2
    ) * defMult;

    // Directness impact: Route One passes have higher turnover risk but bypass zones
    const isDirect = attTactic.inPossession.directness === 'Route One' || attTactic.inPossession.directness === 'Direct';
    const riskFactor = isDirect ? 0.72 : 0.88;

    const completionProb = Math.min(0.92, Math.max(0.35, (passSkill / (passSkill + interceptSkill * 0.85)) * riskFactor));
    const success = prng.next() < completionProb;

    if (success) {
      // Determine if progressive pass into next zone or circulation
      const isProgressive = isDirect || prng.next() < 0.65;
      const nextZone = isProgressive ? this.getNextAdvancedZone(currentZone) : currentZone;

      return {
        eventType: isProgressive ? 'progressive_pass' : 'pass',
        success: true,
        nextZone,
        possessionRetained: true,
        isFoul: false,
        primaryPlayer: attacker,
        secondaryPlayer: defender,
        commentaryTemplate: isProgressive
          ? '{att} threads an incisive progressive pass forward into space.'
          : '{att} neatly keeps possession ticking over.'
      };
    } else {
      return {
        eventType: 'interception',
        success: false,
        nextZone: this.getDefensiveRecoveryZone(currentZone),
        possessionRetained: false,
        isFoul: false,
        primaryPlayer: defender,
        secondaryPlayer: attacker,
        commentaryTemplate: '{def} reads the trajectory brilliantly to cut out {att}\'s pass.'
      };
    }
  }

  public static getNextAdvancedZone(zone: PitchZone): PitchZone {
    switch (zone) {
      case 'defensive_third': return 'defensive_halfspace';
      case 'defensive_halfspace': return 'midfield';
      case 'midfield': return 'attacking_halfspace';
      case 'attacking_halfspace': return 'penalty_box';
      case 'wide_flanks': return 'penalty_box';
      case 'penalty_box': return 'penalty_box';
    }
  }

  public static getDefensiveRecoveryZone(zone: PitchZone): PitchZone {
    // When possession is won, map attacker zone to defender's relative zone
    switch (zone) {
      case 'penalty_box': return 'defensive_third';
      case 'attacking_halfspace': return 'defensive_halfspace';
      case 'wide_flanks': return 'midfield';
      case 'midfield': return 'midfield';
      case 'defensive_halfspace': return 'attacking_halfspace';
      case 'defensive_third': return 'penalty_box';
    }
  }
}
