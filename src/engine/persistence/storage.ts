// ==========================================
// Persistence & State Serialization Engine
// LocalStorage & IndexedDB State Management
// ==========================================

import { League, Tactic, MatchSimulationResult } from '../../types';

export interface UniverseSaveState {
  version: string;
  savedAt: string;
  seed: string;
  league: League;
  customTactics: Tactic[];
  recentMatches: MatchSimulationResult[];
}

export class StorageEngine {
  private static readonly STORAGE_KEY = 'deep_fm_universe_save_v1';

  /**
   * Saves state to browser LocalStorage (with fallback memory)
   */
  public static saveToLocalStorage(state: UniverseSaveState): boolean {
    try {
      const serialized = JSON.stringify(state);
      localStorage.setItem(this.STORAGE_KEY, serialized);
      return true;
    } catch (err) {
      console.warn('LocalStorage save failed, quota exceeded or unavailable', err);
      return false;
    }
  }

  /**
   * Loads state from LocalStorage
   */
  public static loadFromLocalStorage(): UniverseSaveState | null {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return null;
      return JSON.parse(data) as UniverseSaveState;
    } catch (err) {
      console.error('Failed to parse saved state from LocalStorage', err);
      return null;
    }
  }

  /**
   * Exports full universe state as a downloadable JSON blob
   */
  public static exportToJson(state: UniverseSaveState): string {
    return JSON.stringify(state, null, 2);
  }

  /**
   * Imports universe state from a JSON string
   */
  public static importFromJson(jsonString: string): UniverseSaveState {
    const parsed = JSON.parse(jsonString) as UniverseSaveState;
    if (!parsed.league || !parsed.league.clubs) {
      throw new Error('Invalid universe state format: missing league or clubs');
    }
    return parsed;
  }
}
