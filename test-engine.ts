// ==========================================
// CLI Verification Test Script
// ==========================================

import { EngineTester } from './src/engine/benchmark';

console.log('⚽ DEEP FOOTBALL MANAGEMENT SIMULATION - ENGINE VERIFICATION ⚽\n');

// 1. Determinism Test
console.log('--- 1. Testing Determinism ---');
const detTest = EngineTester.verifyDeterminism('alpha-omega-seed-99');
console.log(`Seed: ${detTest.seed}`);
console.log(`Run 1 Score: ${detTest.run1Score} | Run 2 Score: ${detTest.run2Score}`);
console.log(`Run 1 xG:    ${detTest.run1Xg} | Run 2 xG:    ${detTest.run2Xg}`);
console.log(`Run 1 Hash:  ${detTest.run1Hash} | Run 2 Hash:  ${detTest.run2Hash}`);
console.log(`Events Match: ${detTest.eventCount1} == ${detTest.eventCount2}`);
console.log(`Shots Match:  ${detTest.shotCount1} == ${detTest.shotCount2}`);
console.log(`Deterministic Result: ${detTest.isDeterministic ? '✅ PASS (Bit-for-bit identical)' : '❌ FAIL'}\n`);

// 2. Performance & Statistical Benchmark (100 Matches)
console.log('--- 2. Benchmarking 100 Headless Matches ---');
const bench = EngineTester.runBenchmark(100);
console.log(`Simulated: ${bench.matchesRun} full 90-minute matches`);
console.log(`Total Time: ${bench.totalTimeMs} ms (Average: ${bench.averageTimePerMatchMs} ms/match)`);
console.log(`Performance Target (< 1500 ms): ${bench.performancePass ? '✅ PASS' : '❌ FAIL'}`);
console.log(`Total Goals: ${bench.totalGoals} (Average: ${bench.averageGoalsPerMatch} per match)`);
console.log(`Total xG: ${bench.totalXg} (Average: ${bench.averageXgPerMatch} per match)`);
console.log(`Outcomes: Home ${bench.homeWinPct}% | Draw ${bench.drawPct}% | Away ${bench.awayWinPct}%\n`);

if (detTest.isDeterministic && bench.performancePass) {
  console.log('🎉 ALL ENGINE VERIFICATIONS PASSED SUCCESSFULLY!');
} else {
  console.error('❌ SOME VERIFICATIONS FAILED');
  process.exit(1);
}
