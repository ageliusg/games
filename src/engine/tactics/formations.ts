// ==========================================
// Formations, Presets & Lineup Engine
// 5x5 Spatial Grid & Tactical Instruction Sets
// ==========================================

import {
  Tactic,
  TacticalSlot,
  Position,
  Player
} from '../../types';

export class FormationEngine {
  /**
   * 4-3-3 DM Wide (Modern balanced possession & pressing)
   */
  public static create433(): Tactic {
    const slots: TacticalSlot[] = [
      { slotId: 'slot-0', gridX: 2, gridY: 0, position: 'GK', role: 'Sweeper Keeper', duty: 'Defend', assignedPlayerId: '' },
      { slotId: 'slot-1', gridX: 0, gridY: 1, position: 'LB', role: 'Inverted Wing-Back', duty: 'Support', assignedPlayerId: '' },
      { slotId: 'slot-2', gridX: 1, gridY: 1, position: 'CB', role: 'Ball-Playing Defender', duty: 'Defend', assignedPlayerId: '' },
      { slotId: 'slot-3', gridX: 3, gridY: 1, position: 'CB', role: 'Central Defender', duty: 'Defend', assignedPlayerId: '' },
      { slotId: 'slot-4', gridX: 4, gridY: 1, position: 'RB', role: 'Wing-Back', duty: 'Attack', assignedPlayerId: '' },
      { slotId: 'slot-5', gridX: 2, gridY: 2, position: 'DM', role: 'Deep-Lying Playmaker', duty: 'Defend', assignedPlayerId: '' },
      { slotId: 'slot-6', gridX: 1, gridY: 3, position: 'CM', role: 'Mezzala', duty: 'Attack', assignedPlayerId: '' },
      { slotId: 'slot-7', gridX: 3, gridY: 3, position: 'CM', role: 'Box-to-Box Midfielder', duty: 'Support', assignedPlayerId: '' },
      { slotId: 'slot-8', gridX: 0, gridY: 4, position: 'LW', role: 'Inside Forward', duty: 'Attack', assignedPlayerId: '' },
      { slotId: 'slot-9', gridX: 4, gridY: 4, position: 'RW', role: 'Winger', duty: 'Support', assignedPlayerId: '' },
      { slotId: 'slot-10', gridX: 2, gridY: 4, position: 'ST', role: 'Advanced Forward', duty: 'Attack', assignedPlayerId: '' }
    ];

    return {
      id: 'preset-433-dm-wide',
      name: '4-3-3 Fluid Possession',
      formationName: '4-3-3 DM Wide',
      slots,
      inPossession: {
        width: 'Wide',
        directness: 'Short',
        tempo: 'High'
      },
      inTransition: {
        onLossOfPossession: 'Counter-Press',
        onWonPossession: 'Counter'
      },
      outOfPossession: {
        defensiveLine: 'High Line',
        pressingIntensity: 'Frequent',
        offsideTrap: true
      }
    };
  }

  /**
   * 4-2-3-1 High-intensity Gegenpress
   */
  public static create4231(): Tactic {
    const slots: TacticalSlot[] = [
      { slotId: 'slot-0', gridX: 2, gridY: 0, position: 'GK', role: 'Sweeper Keeper', duty: 'Defend', assignedPlayerId: '' },
      { slotId: 'slot-1', gridX: 0, gridY: 1, position: 'LB', role: 'Full-Back', duty: 'Support', assignedPlayerId: '' },
      { slotId: 'slot-2', gridX: 1, gridY: 1, position: 'CB', role: 'Ball-Playing Defender', duty: 'Defend', assignedPlayerId: '' },
      { slotId: 'slot-3', gridX: 3, gridY: 1, position: 'CB', role: 'Central Defender', duty: 'Defend', assignedPlayerId: '' },
      { slotId: 'slot-4', gridX: 4, gridY: 1, position: 'RB', role: 'Wing-Back', duty: 'Attack', assignedPlayerId: '' },
      { slotId: 'slot-5', gridX: 1, gridY: 2, position: 'DM', role: 'Defensive Midfielder', duty: 'Defend', assignedPlayerId: '' },
      { slotId: 'slot-6', gridX: 3, gridY: 2, position: 'DM', role: 'Deep-Lying Playmaker', duty: 'Support', assignedPlayerId: '' },
      { slotId: 'slot-7', gridX: 2, gridY: 3, position: 'AM', role: 'Advanced Playmaker', duty: 'Attack', assignedPlayerId: '' },
      { slotId: 'slot-8', gridX: 0, gridY: 4, position: 'LW', role: 'Inside Forward', duty: 'Attack', assignedPlayerId: '' },
      { slotId: 'slot-9', gridX: 4, gridY: 4, position: 'RW', role: 'Inside Forward', duty: 'Attack', assignedPlayerId: '' },
      { slotId: 'slot-10', gridX: 2, gridY: 4, position: 'ST', role: 'Complete Forward', duty: 'Attack', assignedPlayerId: '' }
    ];

    return {
      id: 'preset-4231-gegenpress',
      name: '4-2-3-1 Heavy Metal Gegenpress',
      formationName: '4-2-3-1 Gegenpress',
      slots,
      inPossession: {
        width: 'Standard',
        directness: 'Balanced',
        tempo: 'Maximum'
      },
      inTransition: {
        onLossOfPossession: 'Counter-Press',
        onWonPossession: 'Counter'
      },
      outOfPossession: {
        defensiveLine: 'Much Higher Line',
        pressingIntensity: 'Extreme',
        offsideTrap: true
      }
    };
  }

  /**
   * 4-4-2 Classic Direct Counter
   */
  public static create442(): Tactic {
    const slots: TacticalSlot[] = [
      { slotId: 'slot-0', gridX: 2, gridY: 0, position: 'GK', role: 'Goalkeeper', duty: 'Defend', assignedPlayerId: '' },
      { slotId: 'slot-1', gridX: 0, gridY: 1, position: 'LB', role: 'Full-Back', duty: 'Support', assignedPlayerId: '' },
      { slotId: 'slot-2', gridX: 1, gridY: 1, position: 'CB', role: 'Central Defender', duty: 'Defend', assignedPlayerId: '' },
      { slotId: 'slot-3', gridX: 3, gridY: 1, position: 'CB', role: 'Central Defender', duty: 'Defend', assignedPlayerId: '' },
      { slotId: 'slot-4', gridX: 4, gridY: 1, position: 'RB', role: 'Full-Back', duty: 'Support', assignedPlayerId: '' },
      { slotId: 'slot-5', gridX: 0, gridY: 2, position: 'LM', role: 'Winger', duty: 'Attack', assignedPlayerId: '' },
      { slotId: 'slot-6', gridX: 1, gridY: 2, position: 'CM', role: 'Box-to-Box Midfielder', duty: 'Support', assignedPlayerId: '' },
      { slotId: 'slot-7', gridX: 3, gridY: 2, position: 'CM', role: 'Central Midfielder', duty: 'Defend', assignedPlayerId: '' },
      { slotId: 'slot-8', gridX: 4, gridY: 2, position: 'RM', role: 'Winger', duty: 'Support', assignedPlayerId: '' },
      { slotId: 'slot-9', gridX: 1, gridY: 4, position: 'ST', role: 'Target Forward', duty: 'Support', assignedPlayerId: '' },
      { slotId: 'slot-10', gridX: 3, gridY: 4, position: 'ST', role: 'Poacher', duty: 'Attack', assignedPlayerId: '' }
    ];

    return {
      id: 'preset-442-direct',
      name: '4-4-2 Direct Route One',
      formationName: '4-4-2 Direct',
      slots,
      inPossession: {
        width: 'Wide',
        directness: 'Route One',
        tempo: 'Standard'
      },
      inTransition: {
        onLossOfPossession: 'Regroup',
        onWonPossession: 'Counter'
      },
      outOfPossession: {
        defensiveLine: 'Mid-Block',
        pressingIntensity: 'Regular',
        offsideTrap: false
      }
    };
  }

  /**
   * 3-5-2 Wing-Backs & Overloads
   */
  public static create352(): Tactic {
    const slots: TacticalSlot[] = [
      { slotId: 'slot-0', gridX: 2, gridY: 0, position: 'GK', role: 'Sweeper Keeper', duty: 'Defend', assignedPlayerId: '' },
      { slotId: 'slot-1', gridX: 1, gridY: 1, position: 'CB', role: 'Ball-Playing Defender', duty: 'Defend', assignedPlayerId: '' },
      { slotId: 'slot-2', gridX: 2, gridY: 1, position: 'CB', role: 'Central Defender', duty: 'Defend', assignedPlayerId: '' },
      { slotId: 'slot-3', gridX: 3, gridY: 1, position: 'CB', role: 'Ball-Playing Defender', duty: 'Defend', assignedPlayerId: '' },
      { slotId: 'slot-4', gridX: 0, gridY: 2, position: 'LB', role: 'Wing-Back', duty: 'Attack', assignedPlayerId: '' },
      { slotId: 'slot-5', gridX: 1, gridY: 2, position: 'DM', role: 'Defensive Midfielder', duty: 'Defend', assignedPlayerId: '' },
      { slotId: 'slot-6', gridX: 3, gridY: 2, position: 'CM', role: 'Mezzala', duty: 'Attack', assignedPlayerId: '' },
      { slotId: 'slot-7', gridX: 4, gridY: 2, position: 'RB', role: 'Wing-Back', duty: 'Attack', assignedPlayerId: '' },
      { slotId: 'slot-8', gridX: 2, gridY: 3, position: 'AM', role: 'Advanced Playmaker', duty: 'Support', assignedPlayerId: '' },
      { slotId: 'slot-9', gridX: 1, gridY: 4, position: 'ST', role: 'Advanced Forward', duty: 'Attack', assignedPlayerId: '' },
      { slotId: 'slot-10', gridX: 3, gridY: 4, position: 'ST', role: 'Complete Forward', duty: 'Support', assignedPlayerId: '' }
    ];

    return {
      id: 'preset-352-wingbacks',
      name: '3-5-2 Fluid Wing-Back Overload',
      formationName: '3-5-2 Wing-Backs',
      slots,
      inPossession: {
        width: 'Extremely Wide',
        directness: 'Short',
        tempo: 'High'
      },
      inTransition: {
        onLossOfPossession: 'Counter-Press',
        onWonPossession: 'Hold Shape'
      },
      outOfPossession: {
        defensiveLine: 'High Line',
        pressingIntensity: 'Frequent',
        offsideTrap: true
      }
    };
  }

  /**
   * 5-3-2 Low Block Catenaccio
   */
  public static create532(): Tactic {
    const slots: TacticalSlot[] = [
      { slotId: 'slot-0', gridX: 2, gridY: 0, position: 'GK', role: 'Goalkeeper', duty: 'Defend', assignedPlayerId: '' },
      { slotId: 'slot-1', gridX: 0, gridY: 1, position: 'LB', role: 'Full-Back', duty: 'Defend', assignedPlayerId: '' },
      { slotId: 'slot-2', gridX: 1, gridY: 1, position: 'CB', role: 'Central Defender', duty: 'Defend', assignedPlayerId: '' },
      { slotId: 'slot-3', gridX: 2, gridY: 1, position: 'CB', role: 'Central Defender', duty: 'Defend', assignedPlayerId: '' },
      { slotId: 'slot-4', gridX: 3, gridY: 1, position: 'CB', role: 'Central Defender', duty: 'Defend', assignedPlayerId: '' },
      { slotId: 'slot-5', gridX: 4, gridY: 1, position: 'RB', role: 'Full-Back', duty: 'Defend', assignedPlayerId: '' },
      { slotId: 'slot-6', gridX: 1, gridY: 2, position: 'CM', role: 'Central Midfielder', duty: 'Defend', assignedPlayerId: '' },
      { slotId: 'slot-7', gridX: 2, gridY: 2, position: 'DM', role: 'Defensive Midfielder', duty: 'Defend', assignedPlayerId: '' },
      { slotId: 'slot-8', gridX: 3, gridY: 2, position: 'CM', role: 'Box-to-Box Midfielder', duty: 'Support', assignedPlayerId: '' },
      { slotId: 'slot-9', gridX: 1, gridY: 4, position: 'ST', role: 'Target Forward', duty: 'Support', assignedPlayerId: '' },
      { slotId: 'slot-10', gridX: 3, gridY: 4, position: 'ST', role: 'Poacher', duty: 'Attack', assignedPlayerId: '' }
    ];

    return {
      id: 'preset-532-low-block',
      name: '5-3-2 Resilient Low Block',
      formationName: '5-3-2 Low Block',
      slots,
      inPossession: {
        width: 'Narrow',
        directness: 'Direct',
        tempo: 'Low'
      },
      inTransition: {
        onLossOfPossession: 'Regroup',
        onWonPossession: 'Counter'
      },
      outOfPossession: {
        defensiveLine: 'Very Low',
        pressingIntensity: 'Cautious',
        offsideTrap: false
      }
    };
  }

  public static getAllPresets(): Tactic[] {
    return [
      this.create433(),
      this.create4231(),
      this.create442(),
      this.create352(),
      this.create532()
    ];
  }

  /**
   * Deterministically assigns the best available players from the squad into the 11 tactical slots
   */
  public static populateStarting11(tactic: Tactic, squad: Player[]): Tactic {
    const assignedIds = new Set<string>();
    const updatedSlots: TacticalSlot[] = [];

    // Helper to evaluate player suitability for a position
    const ratePlayerForSlot = (player: Player, slotPos: Position): number => {
      let fitScore = player.hidden.currentAbility;
      if (player.position === slotPos) {
        fitScore += 30; // Natural position bonus
      } else if (player.secondaryPositions.includes(slotPos)) {
        fitScore += 15; // Accomplished secondary bonus
      } else {
        fitScore -= 25; // Out of position penalty
      }
      return fitScore;
    };

    for (const slot of tactic.slots) {
      // Find eligible unassigned players
      const available = squad.filter(p => !assignedIds.has(p.id));
      if (available.length === 0) break;

      // Sort by suitability score descending
      available.sort((a, b) => ratePlayerForSlot(b, slot.position) - ratePlayerForSlot(a, slot.position));
      const chosen = available[0];
      assignedIds.add(chosen.id);

      updatedSlots.push({
        ...slot,
        assignedPlayerId: chosen.id
      });
    }

    return {
      ...tactic,
      slots: updatedSlots
    };
  }
}
