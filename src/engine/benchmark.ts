// ==========================================
// Benchmark & Verification Test Runner
// Verifies 100-match < 1.5s execution & strict determinism
// ==========================================

import { LeagueGenerator } from './generator/leagueGenerator';
import { FormationEngine } from './tactics/formations';
import { MatchSimulator } from './match/simulator';

export interface BenchmarkReport {
  matchesRun: number;
  totalTimeMs: number;
  averageTimePerMatchMs: number;
  totalGoals: number;
  averageGoalsPerMatch: number;
  totalXg: number;
  averageXgPerMatch: number;
  homeWinPct: number;
  drawPct: number;
  awayWinPct: number;
  performancePass: boolean; // < 1500ms for 100 matches
}

export interface DeterminismVerificationReport {
  seed: string;
  isDeterministic: boolean;
  run1Hash: string;
  run2Hash: string;
  run1Score: string;
  run2Score: string;
  run1Xg: string;
  run2Xg: string;
  eventCount1: number;
  eventCount2: number;
  shotCount1: number;
  shotCount2: number;
  mismatches: string[];
}

export class EngineTester {
  /**
   * Runs 100 or N headless match simulations and measures execution time and statistical distribution
   */
  public static runBenchmark(count: number = 100): BenchmarkReport {
    const league = LeagueGenerator.generateLeague('benchmark-seed', 1, 2026);
    const homeClub = league.clubs[0];
    const awayClub = league.clubs[1];

    const homeTactic = FormationEngine.populateStarting11(FormationEngine.create433(), homeClub.players);
    const awayTactic = FormationEngine.populateStarting11(FormationEngine.create4231(), awayClub.players);

    let homeWins = 0;
    let draws = 0;
    let awayWins = 0;
    let totalGoals = 0;
    let totalXg = 0;

    const start = performance.now();

    for (let i = 0; i < count; i++) {
      const sim = new MatchSimulator(`bench-match-${i}`);
      // Record ticks = false for headless performance run
      const result = sim.simulate(homeClub, awayClub, homeTactic, awayTactic, false);

      totalGoals += result.stats.homeScore + result.stats.awayScore;
      totalXg += result.stats.homeXg + result.stats.awayXg;

      if (result.stats.homeScore > result.stats.awayScore) homeWins++;
      else if (result.stats.homeScore === result.stats.awayScore) draws++;
      else awayWins++;
    }

    const totalTimeMs = Math.round(performance.now() - start);
    const averageTimePerMatchMs = Math.round((totalTimeMs / count) * 100) / 100;

    return {
      matchesRun: count,
      totalTimeMs,
      averageTimePerMatchMs,
      totalGoals,
      averageGoalsPerMatch: Math.round((totalGoals / count) * 100) / 100,
      totalXg: Math.round(totalXg * 10) / 10,
      averageXgPerMatch: Math.round((totalXg / count) * 100) / 100,
      homeWinPct: Math.round((homeWins / count) * 100),
      drawPct: Math.round((draws / count) * 100),
      awayWinPct: Math.round((awayWins / count) * 100),
      performancePass: totalTimeMs < 1500
    };
  }

  /**
   * Verifies that two independent runs with identical seeds produce bit-for-bit identical outputs
   */
  public static verifyDeterminism(seed: string = 'test-seed-42'): DeterminismVerificationReport {
    const league = LeagueGenerator.generateLeague(seed, 1, 2026);
    const homeClub = league.clubs[2];
    const awayClub = league.clubs[3];

    const homeTactic = FormationEngine.populateStarting11(FormationEngine.create433(), homeClub.players);
    const awayTactic = FormationEngine.populateStarting11(FormationEngine.create442(), awayClub.players);

    const sim1 = new MatchSimulator(seed);
    const run1 = sim1.simulate(homeClub, awayClub, homeTactic, awayTactic, true);

    const sim2 = new MatchSimulator(seed);
    const run2 = sim2.simulate(homeClub, awayClub, homeTactic, awayTactic, true);

    const mismatches: string[] = [];

    if (run1.verificationHash !== run2.verificationHash) {
      mismatches.push(`Verification hash mismatch: ${run1.verificationHash} vs ${run2.verificationHash}`);
    }
    if (run1.stats.homeScore !== run2.stats.homeScore || run1.stats.awayScore !== run2.stats.awayScore) {
      mismatches.push(`Score mismatch: ${run1.stats.homeScore}-${run1.stats.awayScore} vs ${run2.stats.homeScore}-${run2.stats.awayScore}`);
    }
    if (run1.stats.homeXg !== run2.stats.homeXg || run1.stats.awayXg !== run2.stats.awayXg) {
      mismatches.push(`xG mismatch: ${run1.stats.homeXg}-${run1.stats.awayXg} vs ${run2.stats.homeXg}-${run2.stats.awayXg}`);
    }
    if (run1.events.length !== run2.events.length) {
      mismatches.push(`Event count mismatch: ${run1.events.length} vs ${run2.events.length}`);
    }
    if (run1.shots.length !== run2.shots.length) {
      mismatches.push(`Shot count mismatch: ${run1.shots.length} vs ${run2.shots.length}`);
    }

    // Check individual events
    for (let i = 0; i < Math.min(run1.events.length, run2.events.length); i++) {
      const e1 = run1.events[i];
      const e2 = run2.events[i];
      if (e1.tick !== e2.tick || e1.type !== e2.type || e1.primaryPlayerId !== e2.primaryPlayerId) {
        mismatches.push(`Event[${i}] mismatch at tick ${e1.tick}: ${e1.type} vs ${e2.type}`);
        break;
      }
    }

    return {
      seed,
      isDeterministic: mismatches.length === 0,
      run1Hash: run1.verificationHash,
      run2Hash: run2.verificationHash,
      run1Score: `${run1.stats.homeScore} - ${run1.stats.awayScore}`,
      run2Score: `${run2.stats.homeScore} - ${run2.stats.awayScore}`,
      run1Xg: `${run1.stats.homeXg.toFixed(2)} - ${run1.stats.awayXg.toFixed(2)}`,
      run2Xg: `${run2.stats.homeXg.toFixed(2)} - ${run2.stats.awayXg.toFixed(2)}`,
      eventCount1: run1.events.length,
      eventCount2: run2.events.length,
      shotCount1: run1.shots.length,
      shotCount2: run2.shots.length,
      mismatches
    };
  }
}
