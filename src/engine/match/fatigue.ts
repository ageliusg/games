// ==========================================
// Fatigue & Condition Degradation Model
// Non-linear attribute penalty below 70% threshold
// ==========================================

import { Player, TacticalTempo, PressingIntensity } from '../../types';

export class FatigueModel {
  /**
   * Calculates the exponential degradation multiplier on attributes when condition falls below 70%
   */
  public static getEffectiveMultiplier(condition: number): number {
    if (condition >= 70) {
      return 1.0;
    }
    // Below 70%, exponential decay: (condition / 70)^1.45 clamped to minimum 0.40
    const ratio = Math.max(0, condition) / 70.0;
    const penalty = Math.pow(ratio, 1.45);
    return Math.max(0.40, penalty);
  }

  /**
   * Calculates condition drop per 20-second tick
   */
  public static calculateTickConditionDrop(
    player: Player,
    tempo: TacticalTempo,
    pressing: PressingIntensity,
    isActiveDuelist: boolean
  ): number {
    // Base drop rate per tick (~270 ticks in a match; 90 min / 20 sec = 270)
    // Over 270 ticks, a typical player should finish around 68% - 82% condition
    // That corresponds to a total drop of ~20% - 30% -> ~0.08 - 0.12% per tick
    let baseDrop = 0.088;

    // Stamina damping (1 to 20): Stamina 20 reduces fatigue rate by 35%
    const stamina = player.attributes.physical.stamina;
    const staminaFactor = Math.max(0.65, 1.35 - (stamina / 20.0) * 0.55);

    // Tempo multiplier
    let tempoMultiplier = 1.0;
    switch (tempo) {
      case 'Low': tempoMultiplier = 0.82; break;
      case 'Standard': tempoMultiplier = 1.0; break;
      case 'High': tempoMultiplier = 1.25; break;
      case 'Maximum': tempoMultiplier = 1.55; break;
    }

    // Pressing intensity multiplier
    let pressingMultiplier = 1.0;
    switch (pressing) {
      case 'Never': pressingMultiplier = 0.75; break;
      case 'Cautious': pressingMultiplier = 0.88; break;
      case 'Regular': pressingMultiplier = 1.0; break;
      case 'Frequent': pressingMultiplier = 1.28; break;
      case 'Extreme': pressingMultiplier = 1.62; break;
    }

    // Extra exertion for players actively involved in duels or sprints during the tick
    const duelTax = isActiveDuelist ? 1.4 : 1.0;

    const totalDrop = baseDrop * staminaFactor * tempoMultiplier * pressingMultiplier * duelTax;
    return totalDrop;
  }
}
