// ==========================================
// Tactical Roles & Duty Modifiers
// Mathematical behavioral parameters for roles
// ==========================================

import { PlayerRoleName, RoleDuty, PitchZone } from '../../types';

export interface RoleBehaviorProfile {
  name: PlayerRoleName;
  compatibleDuties: RoleDuty[];
  // Spatial offset applied during in-possession phase (deltaX, deltaY in 5x5 grid units)
  inPossessionSpatialOffset: {
    dx: number; // positive = outward/wider, negative = inward/central
    dy: number; // positive = higher/advanced, negative = deeper
  };
  // Key behavior weights [0.1 to 1.0]
  passRiskThreshold: number;     // willingness to attempt high-risk / progressive passes
  passRangeMultiplier: number;   // preference for long or direct distribution
  dribbleUrgency: number;        // likelihood of taking on defenders in 1v1
  forwardRunFrequency: number;   // rate of penetrating forward off-the-ball runs
  pressingUrgency: number;       // aggression in closing down opponents
  shotTendency: number;          // trigger threshold to take a shot vs circulate ball
  primaryOperatingZone: PitchZone;
  description: string;
}

export class RoleDefinitions {
  public static readonly ROLES: Record<PlayerRoleName, RoleBehaviorProfile> = {
    'Goalkeeper': {
      name: 'Goalkeeper',
      compatibleDuties: ['Defend'],
      inPossessionSpatialOffset: { dx: 0, dy: 0 },
      passRiskThreshold: 0.15,
      passRangeMultiplier: 0.9,
      dribbleUrgency: 0.05,
      forwardRunFrequency: 0.0,
      pressingUrgency: 0.1,
      shotTendency: 0.0,
      primaryOperatingZone: 'defensive_third',
      description: 'Traditional keeper focused solely on shot-stopping and safe clearance.'
    },
    'Sweeper Keeper': {
      name: 'Sweeper Keeper',
      compatibleDuties: ['Defend', 'Support', 'Attack'],
      inPossessionSpatialOffset: { dx: 0, dy: 0.5 },
      passRiskThreshold: 0.45,
      passRangeMultiplier: 1.2,
      dribbleUrgency: 0.15,
      forwardRunFrequency: 0.1,
      pressingUrgency: 0.4,
      shotTendency: 0.0,
      primaryOperatingZone: 'defensive_third',
      description: 'Modern proactive goalkeeper sweeping behind a high defensive line and initiating play.'
    },
    'Central Defender': {
      name: 'Central Defender',
      compatibleDuties: ['Defend', 'Support'],
      inPossessionSpatialOffset: { dx: 0, dy: 0 },
      passRiskThreshold: 0.25,
      passRangeMultiplier: 0.9,
      dribbleUrgency: 0.1,
      forwardRunFrequency: 0.05,
      pressingUrgency: 0.5,
      shotTendency: 0.05,
      primaryOperatingZone: 'defensive_third',
      description: 'Solid anchor focused on maintaining shape, intercepting balls, and marking strikers.'
    },
    'Ball-Playing Defender': {
      name: 'Ball-Playing Defender',
      compatibleDuties: ['Defend', 'Support'],
      inPossessionSpatialOffset: { dx: 0, dy: 0.4 },
      passRiskThreshold: 0.65,
      passRangeMultiplier: 1.6,
      dribbleUrgency: 0.35,
      forwardRunFrequency: 0.15,
      pressingUrgency: 0.6,
      shotTendency: 0.08,
      primaryOperatingZone: 'defensive_third',
      description: 'Steps out of back line, attempts progressive through-balls and cross-field switches.'
    },
    'Full-Back': {
      name: 'Full-Back',
      compatibleDuties: ['Defend', 'Support', 'Attack'],
      inPossessionSpatialOffset: { dx: 0.2, dy: 0.6 },
      passRiskThreshold: 0.35,
      passRangeMultiplier: 1.0,
      dribbleUrgency: 0.45,
      forwardRunFrequency: 0.5,
      pressingUrgency: 0.6,
      shotTendency: 0.15,
      primaryOperatingZone: 'defensive_halfspace',
      description: 'Balances defensive flank security with overlapping support for wide attackers.'
    },
    'Wing-Back': {
      name: 'Wing-Back',
      compatibleDuties: ['Support', 'Attack'],
      inPossessionSpatialOffset: { dx: 0.4, dy: 1.2 },
      passRiskThreshold: 0.5,
      passRangeMultiplier: 1.2,
      dribbleUrgency: 0.7,
      forwardRunFrequency: 0.8,
      pressingUrgency: 0.75,
      shotTendency: 0.25,
      primaryOperatingZone: 'wide_flanks',
      description: 'High-octane wide runner providing the primary width and crossing outlet down the touchline.'
    },
    'Inverted Wing-Back': {
      name: 'Inverted Wing-Back',
      compatibleDuties: ['Defend', 'Support', 'Attack'],
      inPossessionSpatialOffset: { dx: -0.8, dy: 0.7 }, // shifts inside into midfield/half-space!
      passRiskThreshold: 0.55,
      passRangeMultiplier: 1.1,
      dribbleUrgency: 0.5,
      forwardRunFrequency: 0.5,
      pressingUrgency: 0.7,
      shotTendency: 0.2,
      primaryOperatingZone: 'midfield',
      description: 'Tucks centrally during possession creating numerical midfield overload and half-space control.'
    },
    'Defensive Midfielder': {
      name: 'Defensive Midfielder',
      compatibleDuties: ['Defend', 'Support'],
      inPossessionSpatialOffset: { dx: 0, dy: 0 },
      passRiskThreshold: 0.3,
      passRangeMultiplier: 1.0,
      dribbleUrgency: 0.2,
      forwardRunFrequency: 0.1,
      pressingUrgency: 0.7,
      shotTendency: 0.15,
      primaryOperatingZone: 'defensive_halfspace',
      description: 'Shields the back four, intercepts passing lanes, and cycles possession safely.'
    },
    'Deep-Lying Playmaker': {
      name: 'Deep-Lying Playmaker',
      compatibleDuties: ['Defend', 'Support'],
      inPossessionSpatialOffset: { dx: 0, dy: -0.2 },
      passRiskThreshold: 0.75,
      passRangeMultiplier: 1.7,
      dribbleUrgency: 0.25,
      forwardRunFrequency: 0.1,
      pressingUrgency: 0.45,
      shotTendency: 0.2,
      primaryOperatingZone: 'midfield',
      description: 'Operates in deep pocket to dictate match tempo with pinpoint long diagonal passes.'
    },
    'Box-to-Box Midfielder': {
      name: 'Box-to-Box Midfielder',
      compatibleDuties: ['Support'],
      inPossessionSpatialOffset: { dx: 0, dy: 0.8 },
      passRiskThreshold: 0.5,
      passRangeMultiplier: 1.1,
      dribbleUrgency: 0.55,
      forwardRunFrequency: 0.75,
      pressingUrgency: 0.85,
      shotTendency: 0.45,
      primaryOperatingZone: 'midfield',
      description: 'Tireless workhorse defending the edge of the box and bursting into attacking half-spaces.'
    },
    'Central Midfielder': {
      name: 'Central Midfielder',
      compatibleDuties: ['Defend', 'Support', 'Attack'],
      inPossessionSpatialOffset: { dx: 0, dy: 0.4 },
      passRiskThreshold: 0.45,
      passRangeMultiplier: 1.1,
      dribbleUrgency: 0.4,
      forwardRunFrequency: 0.5,
      pressingUrgency: 0.65,
      shotTendency: 0.3,
      primaryOperatingZone: 'midfield',
      description: 'Dynamic all-round central midfielder bridging lines and supporting both phases.'
    },
    'Mezzala': {
      name: 'Mezzala',
      compatibleDuties: ['Support', 'Attack'],
      inPossessionSpatialOffset: { dx: 0.7, dy: 1.1 }, // drifts outward into attacking half-spaces!
      passRiskThreshold: 0.7,
      passRangeMultiplier: 1.3,
      dribbleUrgency: 0.75,
      forwardRunFrequency: 0.8,
      pressingUrgency: 0.7,
      shotTendency: 0.55,
      primaryOperatingZone: 'attacking_halfspace',
      description: 'Drifts from central midfield into wide half-spaces to deliver penetrative key passes.'
    },
    'Advanced Playmaker': {
      name: 'Advanced Playmaker',
      compatibleDuties: ['Support', 'Attack'],
      inPossessionSpatialOffset: { dx: 0, dy: 0.5 },
      passRiskThreshold: 0.85,
      passRangeMultiplier: 1.3,
      dribbleUrgency: 0.65,
      forwardRunFrequency: 0.6,
      pressingUrgency: 0.5,
      shotTendency: 0.4,
      primaryOperatingZone: 'attacking_halfspace',
      description: 'The creative focal point between lines unlocking stubborn defenses with visionary passes.'
    },
    'Winger': {
      name: 'Winger',
      compatibleDuties: ['Support', 'Attack'],
      inPossessionSpatialOffset: { dx: 0.4, dy: 0.5 },
      passRiskThreshold: 0.6,
      passRangeMultiplier: 1.2,
      dribbleUrgency: 0.85,
      forwardRunFrequency: 0.8,
      pressingUrgency: 0.6,
      shotTendency: 0.4,
      primaryOperatingZone: 'wide_flanks',
      description: 'Hugs the touchline, beats full-backs on the outside, and drives crosses into the box.'
    },
    'Inverted Winger': {
      name: 'Inverted Winger',
      compatibleDuties: ['Support', 'Attack'],
      inPossessionSpatialOffset: { dx: -0.6, dy: 0.6 },
      passRiskThreshold: 0.7,
      passRangeMultiplier: 1.1,
      dribbleUrgency: 0.8,
      forwardRunFrequency: 0.75,
      pressingUrgency: 0.65,
      shotTendency: 0.6,
      primaryOperatingZone: 'attacking_halfspace',
      description: 'Cuts inside on their favored foot to combine with central midfielders or unleash shots.'
    },
    'Inside Forward': {
      name: 'Inside Forward',
      compatibleDuties: ['Support', 'Attack'],
      inPossessionSpatialOffset: { dx: -0.8, dy: 1.0 },
      passRiskThreshold: 0.65,
      passRangeMultiplier: 1.0,
      dribbleUrgency: 0.85,
      forwardRunFrequency: 0.9,
      pressingUrgency: 0.7,
      shotTendency: 0.75,
      primaryOperatingZone: 'penalty_box',
      description: 'Attacks diagonal space directly into the penalty box, acting as a second striker.'
    },
    'Target Forward': {
      name: 'Target Forward',
      compatibleDuties: ['Support', 'Attack'],
      inPossessionSpatialOffset: { dx: 0, dy: 0.2 },
      passRiskThreshold: 0.4,
      passRangeMultiplier: 0.8,
      dribbleUrgency: 0.3,
      forwardRunFrequency: 0.5,
      pressingUrgency: 0.6,
      shotTendency: 0.7,
      primaryOperatingZone: 'penalty_box',
      description: 'Physical focal point holding up the ball with back to goal and winning aerial battles.'
    },
    'Poacher': {
      name: 'Poacher',
      compatibleDuties: ['Attack'],
      inPossessionSpatialOffset: { dx: 0, dy: 0.6 },
      passRiskThreshold: 0.2,
      passRangeMultiplier: 0.6,
      dribbleUrgency: 0.5,
      forwardRunFrequency: 0.95,
      pressingUrgency: 0.4,
      shotTendency: 0.95,
      primaryOperatingZone: 'penalty_box',
      description: 'Lurks on the shoulder of the last defender to finish chances in the penalty area.'
    },
    'Advanced Forward': {
      name: 'Advanced Forward',
      compatibleDuties: ['Attack'],
      inPossessionSpatialOffset: { dx: 0.2, dy: 0.8 },
      passRiskThreshold: 0.5,
      passRangeMultiplier: 0.9,
      dribbleUrgency: 0.7,
      forwardRunFrequency: 0.9,
      pressingUrgency: 0.75,
      shotTendency: 0.85,
      primaryOperatingZone: 'penalty_box',
      description: 'Spearheads attacks, runs channels, finishes moves, and presses opposing center-backs.'
    },
    'Complete Forward': {
      name: 'Complete Forward',
      compatibleDuties: ['Support', 'Attack'],
      inPossessionSpatialOffset: { dx: 0, dy: 0.7 },
      passRiskThreshold: 0.65,
      passRangeMultiplier: 1.2,
      dribbleUrgency: 0.75,
      forwardRunFrequency: 0.85,
      pressingUrgency: 0.75,
      shotTendency: 0.85,
      primaryOperatingZone: 'penalty_box',
      description: 'Master of all trades who can drop deep, hold up play, beat defenders, and score from any angle.'
    }
  };

  /**
   * Applies duty adjustments to role parameters
   */
  public static getEffectiveProfile(role: PlayerRoleName, duty: RoleDuty): RoleBehaviorProfile {
    const base = this.ROLES[role];
    if (!base) {
      return this.ROLES['Central Midfielder'];
    }

    const copy = { ...base };
    if (duty === 'Defend') {
      copy.forwardRunFrequency = Math.max(0.05, copy.forwardRunFrequency * 0.4);
      copy.passRiskThreshold = Math.max(0.1, copy.passRiskThreshold * 0.7);
      copy.pressingUrgency = Math.min(1.0, copy.pressingUrgency * 1.15);
      copy.shotTendency = Math.max(0.05, copy.shotTendency * 0.3);
    } else if (duty === 'Attack') {
      copy.forwardRunFrequency = Math.min(1.0, copy.forwardRunFrequency * 1.35);
      copy.passRiskThreshold = Math.min(1.0, copy.passRiskThreshold * 1.2);
      copy.shotTendency = Math.min(1.0, copy.shotTendency * 1.3);
    }

    return copy;
  }
}
