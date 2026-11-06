// ==========================================
// Deep Football Management Simulation - Dev Harness App
// ==========================================

import React, { useState } from 'react';
import { League, Tactic, MatchSimulationResult, Matchday, ClubStanding, Fixture } from '../types';
import { LeagueGenerator } from '../engine/generator/leagueGenerator';
import { FormationEngine } from '../engine/tactics/formations';
import { FixtureGenerator } from '../engine/generator/fixtureGenerator';
import { StorageEngine, UniverseSaveState } from '../engine/persistence/storage';

import { Navbar, NavTab } from './components/Navbar';
import { UniverseInspector } from './components/UniverseInspector';
import { TacticStudio } from './components/TacticStudio';
import { MatchSimulatorView } from './components/MatchSimulatorView';
import { AnalyticalDataHub } from './components/AnalyticalDataHub';
import { BatchVerificationSuite } from './components/BatchVerificationSuite';
import { FixturesStandingsHub } from './components/FixturesStandingsHub';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('match');
  const [universeSeed, setUniverseSeed] = useState<string>('pitch-sim-universe-2026');
  const [tier, setTier] = useState<1 | 2>(1);

  // Active League Universe
  const [league, setLeague] = useState<League>(() => {
    const saved = StorageEngine.loadFromLocalStorage();
    if (saved && saved.league) {
      return saved.league;
    }
    return LeagueGenerator.generateLeague('pitch-sim-universe-2026', 1, 2026);
  });

  // Active User Tactic
  const [currentTactic, setCurrentTactic] = useState<Tactic>(() => {
    const defaultTactic = FormationEngine.create433();
    const firstClub = league.clubs[0];
    return FormationEngine.populateStarting11(defaultTactic, firstClub ? firstClub.players : []);
  });

  // League Schedule & Standings
  const [matchdays, setMatchdays] = useState<Matchday[]>(() => {
    return FixtureGenerator.generateSchedule(league.clubs, 'pitch-sim-universe-2026-fixtures');
  });

  const [standings, setStandings] = useState<ClubStanding[]>(() => {
    return FixtureGenerator.calculateStandings(league.clubs, matchdays);
  });

  // Active selected fixture to play in 2D Simulator
  const [selectedFixture, setSelectedFixture] = useState<Fixture | null>(null);

  // Latest Match Simulation Result
  const [latestMatchResult, setLatestMatchResult] = useState<MatchSimulationResult | null>(null);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUpdateMatchdays = (newMatchdays: Matchday[]) => {
    setMatchdays(newMatchdays);
    setStandings(FixtureGenerator.calculateStandings(league.clubs, newMatchdays));
  };

  // Regenerate Universe when seed or tier changes
  const handleRegenerateUniverse = () => {
    const newLeague = LeagueGenerator.generateLeague(universeSeed, tier, 2026);
    setLeague(newLeague);
    const populated = FormationEngine.populateStarting11(currentTactic, newLeague.clubs[0].players);
    setCurrentTactic(populated);

    const freshSchedule = FixtureGenerator.generateSchedule(newLeague.clubs, `${universeSeed}-fixtures`);
    setMatchdays(freshSchedule);
    setStandings(FixtureGenerator.calculateStandings(newLeague.clubs, freshSchedule));
    setSelectedFixture(null);

    showToast(`Universe re-generated with seed "${universeSeed}" (${newLeague.name})`);
  };

  // Tier change handler
  const handleTierChange = (newTier: 1 | 2) => {
    setTier(newTier);
    const newLeague = LeagueGenerator.generateLeague(universeSeed, newTier, 2026);
    setLeague(newLeague);
    const populated = FormationEngine.populateStarting11(currentTactic, newLeague.clubs[0].players);
    setCurrentTactic(populated);

    const freshSchedule = FixtureGenerator.generateSchedule(newLeague.clubs, `${universeSeed}-fixtures-t${newTier}`);
    setMatchdays(freshSchedule);
    setStandings(FixtureGenerator.calculateStandings(newLeague.clubs, freshSchedule));
    setSelectedFixture(null);

    showToast(`Switched to Tier ${newTier} (${newLeague.name})`);
  };

  // Handle Match Result from 2D Match Simulator
  const handleMatchFinished = (res: MatchSimulationResult) => {
    setLatestMatchResult(res);

    if (selectedFixture) {
      const updated = matchdays.map(md => {
        if (md.matchdayNumber !== selectedFixture.matchday) return md;
        return {
          ...md,
          fixtures: md.fixtures.map(f => {
            if (f.id !== selectedFixture.id) return f;
            return {
              ...f,
              played: true,
              homeScore: res.stats.homeScore,
              awayScore: res.stats.awayScore,
              homeXg: res.stats.homeXg,
              awayXg: res.stats.awayXg,
              result: res
            };
          })
        };
      });
      handleUpdateMatchdays(updated);
      showToast(`GW ${selectedFixture.matchday} match result recorded into official standings!`);
    }
  };

  // When user selects a fixture from Fixtures tab
  const handleSelectFixtureToPlay = (fixture: Fixture) => {
    setSelectedFixture(fixture);
    setCurrentTab('match');
    showToast(`Loaded ${fixture.homeClubName} vs ${fixture.awayClubName} into 2D Match Simulator`);
  };

  // Save state to LocalStorage
  const handleSaveState = () => {
    const state: UniverseSaveState = {
      version: '1.0.0',
      savedAt: new Date().toISOString(),
      seed: universeSeed,
      league,
      customTactics: [currentTactic],
      recentMatches: latestMatchResult ? [latestMatchResult] : []
    };
    const success = StorageEngine.saveToLocalStorage(state);
    if (success) {
      showToast('Universe, schedule, and tactics saved to LocalStorage!');
    } else {
      showToast('Failed to save state to LocalStorage.');
    }
  };

  // Export JSON file
  const handleExportJson = () => {
    const state: UniverseSaveState = {
      version: '1.0.0',
      savedAt: new Date().toISOString(),
      seed: universeSeed,
      league,
      customTactics: [currentTactic],
      recentMatches: latestMatchResult ? [latestMatchResult] : []
    };
    const jsonStr = StorageEngine.exportToJson(state);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pitchcore-universe-${universeSeed}-tier${tier}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported universe JSON file.');
  };

  // Import JSON file
  const handleImportJson = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const contents = event.target?.result as string;
          const imported = StorageEngine.importFromJson(contents);
          setLeague(imported.league);
          setUniverseSeed(imported.seed ?? 'imported-seed');
          setTier(imported.league.tier);
          if (imported.customTactics && imported.customTactics[0]) {
            setCurrentTactic(imported.customTactics[0]);
          }
          if (imported.recentMatches && imported.recentMatches[0]) {
            setLatestMatchResult(imported.recentMatches[0]);
          }
          const freshSchedule = FixtureGenerator.generateSchedule(imported.league.clubs, `${imported.seed}-fixtures`);
          setMatchdays(freshSchedule);
          setStandings(FixtureGenerator.calculateStandings(imported.league.clubs, freshSchedule));
          setSelectedFixture(null);
          showToast(`Imported universe with ${imported.league.clubs.length} clubs successfully!`);
        } catch {
          showToast('Failed to parse imported JSON file.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      {/* Top Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        tier={tier}
        onTierChange={handleTierChange}
        seed={universeSeed}
        onSeedChange={setUniverseSeed}
        onRegenerateUniverse={handleRegenerateUniverse}
        onSaveState={handleSaveState}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        {currentTab === 'universe' && (
          <UniverseInspector league={league} />
        )}

        {currentTab === 'tactics' && (
          <TacticStudio
            tactic={currentTactic}
            onTacticChange={setCurrentTactic}
            squad={league.clubs[0]?.players ?? []}
          />
        )}

        {currentTab === 'match' && (
          <MatchSimulatorView
            league={league}
            currentTactic={currentTactic}
            initialHomeClubId={selectedFixture?.homeClubId}
            initialAwayClubId={selectedFixture?.awayClubId}
            onMatchFinished={handleMatchFinished}
          />
        )}

        {currentTab === 'fixtures' && (
          <FixturesStandingsHub
            league={league}
            matchdays={matchdays}
            standings={standings}
            currentTactic={currentTactic}
            onUpdateMatchdays={handleUpdateMatchdays}
            onSelectFixtureToPlay={handleSelectFixtureToPlay}
          />
        )}

        {currentTab === 'analytics' && (
          <AnalyticalDataHub result={latestMatchResult} />
        )}

        {currentTab === 'batch' && (
          <BatchVerificationSuite />
        )}
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/50 text-white text-xs font-mono px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          {toastMessage}
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 py-4 px-6 text-center text-xs text-slate-500 font-mono">
        PitchCore Phase 1 Engine Harness • TypeScript + Vite + Tailwind CSS • Box-Muller Gaussian & Mulberry32 PRNG
      </footer>
    </div>
  );
};

export default App;
