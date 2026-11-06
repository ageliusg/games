// ==========================================
// League Fixtures & Standings Hub
// Gameweek Scheduler, Matchday Simulator & Live Table
// ==========================================

import React, { useState } from 'react';
import {
  League,
  Matchday,
  Fixture,
  ClubStanding,
  Tactic,
  MatchSimulationResult
} from '../../types';
import { MatchSimulator } from '../../engine/match/simulator';
import { FormationEngine } from '../../engine/tactics/formations';
import { FixtureGenerator } from '../../engine/generator/fixtureGenerator';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  Tv
} from 'lucide-react';

interface FixturesStandingsHubProps {
  league: League;
  matchdays: Matchday[];
  standings: ClubStanding[];
  currentTactic: Tactic;
  onUpdateMatchdays: (newMatchdays: Matchday[]) => void;
  onSelectFixtureToPlay: (fixture: Fixture) => void;
}

export const FixturesStandingsHub: React.FC<FixturesStandingsHubProps> = ({
  league,
  matchdays,
  standings,
  currentTactic,
  onUpdateMatchdays,
  onSelectFixtureToPlay
}) => {
  const [currentGameweek, setCurrentGameweek] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'fixtures' | 'table'>('fixtures');

  const currentMatchday = matchdays.find(m => m.matchdayNumber === currentGameweek) ?? matchdays[0];

  const clubMap = new Map(league.clubs.map(c => [c.id, c]));

  // Simulate a single fixture headlessly
  const simulateFixture = (fix: Fixture): Fixture => {
    if (fix.played && fix.homeScore !== undefined) return fix;

    const homeClub = clubMap.get(fix.homeClubId);
    const awayClub = clubMap.get(fix.awayClubId);
    if (!homeClub || !awayClub) return fix;

    const homeTactic = FormationEngine.populateStarting11(currentTactic, homeClub.players);
    const awayTactic = FormationEngine.populateStarting11(FormationEngine.create4231(), awayClub.players);

    const simulator = new MatchSimulator(fix.matchSeed);
    const result: MatchSimulationResult = simulator.simulate(homeClub, awayClub, homeTactic, awayTactic, true);

    return {
      ...fix,
      played: true,
      homeScore: result.stats.homeScore,
      awayScore: result.stats.awayScore,
      homeXg: result.stats.homeXg,
      awayXg: result.stats.awayXg,
      result
    };
  };

  // Simulate entire current gameweek (10 matches)
  const handleSimulateCurrentGameweek = () => {
    const updatedMatchdays = matchdays.map(md => {
      if (md.matchdayNumber !== currentGameweek) return md;
      const updatedFixtures = md.fixtures.map(f => simulateFixture(f));
      return { ...md, fixtures: updatedFixtures };
    });
    onUpdateMatchdays(updatedMatchdays);
  };

  // Simulate entire 38-gameweek season
  const handleSimulateFullSeason = () => {
    const updatedMatchdays = matchdays.map(md => {
      const updatedFixtures = md.fixtures.map(f => simulateFixture(f));
      return { ...md, fixtures: updatedFixtures };
    });
    onUpdateMatchdays(updatedMatchdays);
  };

  // Reset entire season schedule
  const handleResetSeason = () => {
    const freshSchedule = FixtureGenerator.generateSchedule(league.clubs, `${league.id}-fixtures`);
    onUpdateMatchdays(freshSchedule);
    setCurrentGameweek(1);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Navigation Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        {/* Title & Gameweek indicator */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-extrabold text-white font-mono flex items-center gap-2">
              <span>{league.name}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-normal">
                SEASON 2026/27
              </span>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              38 Gameweeks • 380 Fixtures • Round-Robin Engine
            </div>
          </div>
        </div>

        {/* View Switcher: Fixtures vs League Table */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab('fixtures')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'fixtures'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Fixtures (GW {currentGameweek})
          </button>
          <button
            onClick={() => setActiveTab('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'table'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            League Table
          </button>
        </div>

        {/* Quick Batch Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSimulateCurrentGameweek}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs font-mono transition-colors shadow-md shadow-emerald-600/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Simulate GW {currentGameweek}
          </button>

          <button
            onClick={handleSimulateFullSeason}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs font-mono transition-colors shadow-md shadow-indigo-600/20"
          >
            <Play className="w-3.5 h-3.5" />
            Simulate Season
          </button>

          <button
            onClick={handleResetSeason}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors"
            title="Reset Season"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'fixtures' ? (
        <div className="space-y-4">
          {/* Gameweek Selector Bar */}
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs font-mono">
            <button
              onClick={() => setCurrentGameweek(prev => Math.max(1, prev - 1))}
              disabled={currentGameweek <= 1}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Prev GW
            </button>

            <div className="flex items-center gap-3">
              <span className="font-extrabold text-white text-sm">
                GAMEWEEK {currentGameweek} / 38
              </span>
              <select
                value={currentGameweek}
                onChange={(e) => setCurrentGameweek(parseInt(e.target.value))}
                className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-xs text-emerald-400 font-mono font-bold"
              >
                {Array.from({ length: 38 }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    GW {i + 1}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setCurrentGameweek(prev => Math.min(38, prev + 1))}
              disabled={currentGameweek >= 38}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              Next GW
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* 10 Fixtures Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentMatchday.fixtures.map((fix) => {
              const homeClub = clubMap.get(fix.homeClubId);
              const awayClub = clubMap.get(fix.awayClubId);

              return (
                <div
                  key={fix.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors shadow-sm"
                >
                  {/* Home Team */}
                  <div className="flex-1 flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-black font-mono text-xs border border-white/20 shrink-0"
                      style={{ backgroundColor: fix.homePrimaryColor, color: homeClub?.secondaryColor || '#ffffff' }}
                    >
                      {fix.homeClubCode}
                    </div>
                    <span className="font-semibold text-white text-xs truncate">
                      {fix.homeClubName}
                    </span>
                  </div>

                  {/* Score or VS Badge */}
                  <div className="flex flex-col items-center justify-center px-3 py-1 rounded-lg bg-slate-950 border border-slate-800/80 min-w-[70px]">
                    {fix.played ? (
                      <>
                        <div className="font-black font-mono text-base text-white">
                          {fix.homeScore} : {fix.awayScore}
                        </div>
                        <div className="text-[9px] text-slate-500 font-mono">
                          xG {fix.homeXg?.toFixed(1)} - {fix.awayXg?.toFixed(1)}
                        </div>
                      </>
                    ) : (
                      <span className="font-extrabold font-mono text-xs text-slate-500">
                        VS
                      </span>
                    )}
                  </div>

                  {/* Away Team */}
                  <div className="flex-1 flex items-center justify-end gap-2.5 min-w-0 text-right">
                    <span className="font-semibold text-white text-xs truncate">
                      {fix.awayClubName}
                    </span>
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-black font-mono text-xs border border-white/20 shrink-0"
                      style={{ backgroundColor: fix.awayPrimaryColor, color: awayClub?.secondaryColor || '#ffffff' }}
                    >
                      {fix.awayClubCode}
                    </div>
                  </div>

                  {/* Play in 2D Match Simulator Button */}
                  <button
                    onClick={() => onSelectFixtureToPlay(fix)}
                    className="ml-2 p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/30 text-emerald-400 hover:text-slate-950 transition-all shrink-0"
                    title={fix.played ? 'Watch 2D Match Replay' : 'Play Live in 2D Match Simulator'}
                  >
                    {fix.played ? <Tv className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Standings Table */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-emerald-400" />
              Official League Standings
            </span>
            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span>
                UCL (Top 4)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-red-500"></span>
                Relegation (Bottom 3)
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3 text-center w-10">POS</th>
                  <th className="py-2.5 px-4">CLUB</th>
                  <th className="py-2.5 px-2 text-center">MP</th>
                  <th className="py-2.5 px-2 text-center">W</th>
                  <th className="py-2.5 px-2 text-center">D</th>
                  <th className="py-2.5 px-2 text-center">L</th>
                  <th className="py-2.5 px-2 text-center">GF</th>
                  <th className="py-2.5 px-2 text-center">GA</th>
                  <th className="py-2.5 px-2 text-center">GD</th>
                  <th className="py-2.5 px-3 text-center font-bold text-white">PTS</th>
                  <th className="py-2.5 px-4 text-center">FORM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {standings.map((entry, idx) => {
                  const pos = idx + 1;
                  const isTop4 = pos <= 4;
                  const isRelegation = pos >= 18;

                  return (
                    <tr
                      key={entry.clubId}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isTop4
                          ? 'border-l-4 border-l-emerald-500 bg-emerald-950/10'
                          : isRelegation
                            ? 'border-l-4 border-l-red-500 bg-red-950/10'
                            : ''
                      }`}
                    >
                      <td className={`py-2 px-3 text-center font-bold ${
                        isTop4 ? 'text-emerald-400' : isRelegation ? 'text-red-400' : 'text-slate-400'
                      }`}>
                        {pos}
                      </td>

                      <td className="py-2 px-4 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-5 h-5 rounded flex items-center justify-center font-black text-[9px] border border-white/20"
                            style={{ backgroundColor: entry.primaryColor, color: '#ffffff' }}
                          >
                            {entry.clubCode}
                          </div>
                          <span className="font-sans text-xs">{entry.clubName}</span>
                        </div>
                      </td>

                      <td className="py-2 px-2 text-center text-slate-300">{entry.played}</td>
                      <td className="py-2 px-2 text-center text-slate-300">{entry.won}</td>
                      <td className="py-2 px-2 text-center text-slate-300">{entry.drawn}</td>
                      <td className="py-2 px-2 text-center text-slate-300">{entry.lost}</td>
                      <td className="py-2 px-2 text-center text-slate-400">{entry.goalsFor}</td>
                      <td className="py-2 px-2 text-center text-slate-400">{entry.goalsAgainst}</td>
                      <td className={`py-2 px-2 text-center font-semibold ${
                        entry.goalDifference > 0 ? 'text-emerald-400' : entry.goalDifference < 0 ? 'text-red-400' : 'text-slate-400'
                      }`}>
                        {entry.goalDifference > 0 ? `+${entry.goalDifference}` : entry.goalDifference}
                      </td>
                      <td className="py-2 px-3 text-center font-extrabold text-sm text-emerald-400">
                        {entry.points}
                      </td>

                      <td className="py-2 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {entry.form.length === 0 ? (
                            <span className="text-slate-600 text-[10px]">-</span>
                          ) : (
                            entry.form.map((res, i) => (
                              <span
                                key={i}
                                className={`w-4 h-4 rounded text-[9px] font-black flex items-center justify-center ${
                                  res === 'W'
                                    ? 'bg-emerald-500 text-slate-950'
                                    : res === 'D'
                                      ? 'bg-amber-500 text-slate-950'
                                      : 'bg-red-500 text-white'
                                }`}
                              >
                                {res}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
