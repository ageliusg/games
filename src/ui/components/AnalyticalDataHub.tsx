// ==========================================
// Analytical Data Hub & 2D Shot Map Visualizer
// Post-Match Metrics, Spatial Shot Plots & Player Ratings
// ==========================================

import React, { useState } from 'react';
import { MatchSimulationResult, ShotRecord } from '../../types';
import {
  BarChart3,
  Crosshair,
  Award,
  Shield
} from 'lucide-react';

interface AnalyticalDataHubProps {
  result: MatchSimulationResult | null;
}

export const AnalyticalDataHub: React.FC<AnalyticalDataHubProps> = ({ result }) => {
  const [hoveredShot, setHoveredShot] = useState<ShotRecord | null>(null);
  const [selectedTeamTab, setSelectedTeamTab] = useState<'both' | 'home' | 'away'>('both');
  const [playerRatingTeam, setPlayerRatingTeam] = useState<'home' | 'away'>('home');

  if (!result) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 font-mono">
        <BarChart3 className="w-12 h-12 mx-auto mb-3 text-slate-600 animate-pulse" />
        <h3 className="text-base font-bold text-white mb-1">No Match Data Available</h3>
        <p className="text-xs">Run a simulation from the Match Simulator tab to generate analytical shot maps and ratings.</p>
      </div>
    );
  }

  const { stats, shots, playerStats, homeClubName, awayClubName } = result;

  // Filtered shots for 2D shot map
  const displayedShots = shots.filter(s => {
    if (selectedTeamTab === 'home') return s.team === 'home';
    if (selectedTeamTab === 'away') return s.team === 'away';
    return true;
  });

  // Player stats lists
  const homePlayersList = Object.values(playerStats).filter(p => p.team === 'home');
  const awayPlayersList = Object.values(playerStats).filter(p => p.team === 'away');
  const activePlayersList = playerRatingTeam === 'home' ? homePlayersList : awayPlayersList;

  // Outcome color helper
  const getOutcomeColor = (outcome: ShotRecord['outcome']) => {
    switch (outcome) {
      case 'goal': return 'fill-emerald-400 stroke-emerald-200';
      case 'saved': return 'fill-blue-500 stroke-blue-300';
      case 'blocked': return 'fill-amber-500 stroke-amber-300';
      case 'off_target': return 'fill-slate-600 stroke-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Final Result & xG Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-400 font-mono">FULL TIME ANALYTICAL REPORT</div>
            <h2 className="text-2xl font-black text-white tracking-tight mt-0.5">
              {homeClubName} <span className="text-emerald-400">{stats.homeScore}</span> - <span className="text-indigo-400">{stats.awayScore}</span> {awayClubName}
            </h2>
            <div className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-3">
              <span>Expected Goals (xG): <strong className="text-emerald-400">{stats.homeXg.toFixed(2)}</strong> vs <strong className="text-indigo-400">{stats.awayXg.toFixed(2)}</strong></span>
              <span>•</span>
              <span>Total Shots: {stats.homeShots} - {stats.awayShots}</span>
            </div>
          </div>

          {/* Verification Badge */}
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-xs font-mono">
            <div className="text-[10px] text-slate-500">DETERMINISTIC HASH</div>
            <div className="text-emerald-400 font-bold">{result.verificationHash}</div>
          </div>
        </div>

        {/* Possession & Passing Bars */}
        <div className="mt-6 space-y-3">
          {/* Possession Bar */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-emerald-400 font-bold">{stats.homePossessionPct}% Possession</span>
              <span className="text-indigo-400 font-bold">{stats.awayPossessionPct}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${stats.homePossessionPct}%` }}
                className="bg-emerald-500 transition-all duration-500"
              />
              <div
                style={{ width: `${stats.awayPossessionPct}%` }}
                className="bg-indigo-500 transition-all duration-500"
              />
            </div>
          </div>

          {/* Pass Completion Bar */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-emerald-400 font-bold">{stats.homePassAccuracyPct}% Pass Acc ({stats.homePassesCompleted}/{stats.homePassesAttempted})</span>
              <span className="text-indigo-400 font-bold">{stats.awayPassAccuracyPct}% ({stats.awayPassesCompleted}/{stats.awayPassesAttempted})</span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${stats.homePassAccuracyPct}%` }}
                className="bg-emerald-400/80 transition-all duration-500"
              />
              <div
                style={{ width: `${stats.awayPassAccuracyPct}%` }}
                className="bg-indigo-400/80 transition-all duration-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: 2D Spatial Shot Map & Detailed Team Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 2D Interactive Shot Map */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-emerald-400" />
                Spatial Shot Map (2D Pitch Coordinates & xG Sizing)
              </h3>
              <p className="text-xs text-slate-400">
                Circle diameter proportional to xG • Click or hover shots for geometric analysis
              </p>
            </div>

            {/* Team Filter for Shots */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
              {(['both', 'home', 'away'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setSelectedTeamTab(t)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase transition-colors ${
                    selectedTeamTab === t ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Pitch Canvas */}
          <div className="relative w-full aspect-[16/10] bg-emerald-950 rounded-xl border-4 border-slate-800 overflow-hidden shadow-2xl p-2">
            {/* SVG Pitch Field */}
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full"
              preserveAspectRatio="none"
            >
              {/* Pitch Boundaries & Center */}
              <rect x="2" y="2" width="96" height="96" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
              <line x1="50" y1="2" x2="50" y2="98" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
              <circle cx="50" cy="50" r="12" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />

              {/* Goal & Penalty Areas (Right Side = Attacking Goal) */}
              {/* Penalty box */}
              <rect x="83" y="22" width="15" height="56" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
              {/* Goal area */}
              <rect x="94" y="36" width="4" height="28" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
              {/* Goal Net */}
              <rect x="98" y="44.6" width="1.5" height="10.8" fill="rgba(255,255,255,0.5)" stroke="#ffffff" strokeWidth="0.5" />

              {/* Penalty box Left */}
              <rect x="2" y="22" width="15" height="56" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />

              {/* Render Shot Circles */}
              {displayedShots.map((shot) => {
                // Sizing based on xG: radius between 1.2 and 4.8 units
                const radius = Math.max(1.4, Math.min(5.2, Math.sqrt(shot.xG) * 4.8));
                const isHovered = hoveredShot?.id === shot.id;

                // Adjust x coordinate for away team if shooting left
                const plotX = shot.team === 'home' ? shot.x : (100 - shot.x);

                return (
                  <circle
                    key={shot.id}
                    cx={plotX}
                    cy={shot.y}
                    r={radius}
                    className={`cursor-pointer transition-transform duration-150 ${getOutcomeColor(shot.outcome)} ${
                      isHovered ? 'scale-150 stroke-2 ring-4 ring-white' : 'stroke-1'
                    }`}
                    onMouseEnter={() => setHoveredShot(shot)}
                    onMouseLeave={() => setHoveredShot(null)}
                    onClick={() => setHoveredShot(shot)}
                  />
                );
              })}
            </svg>

            {/* Hovered Shot Tooltip */}
            {hoveredShot && (
              <div className="absolute bottom-3 left-3 bg-slate-950/95 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs font-mono max-w-xs z-30 pointer-events-none">
                <div className="flex items-center justify-between font-bold text-white mb-1">
                  <span>{hoveredShot.shooterName} ({hoveredShot.minute}')</span>
                  <span className={`uppercase px-1.5 py-0.2 rounded text-[10px] ${
                    hoveredShot.outcome === 'goal' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {hoveredShot.outcome}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-slate-400 text-[11px] mt-1.5">
                  <div>xG: <strong className="text-emerald-400">{hoveredShot.xG.toFixed(3)}</strong></div>
                  <div>Dist: <strong>{hoveredShot.distanceMeters}m</strong></div>
                  <div>Angle: <strong>{(hoveredShot.angleRadians * 57.3).toFixed(1)}°</strong></div>
                  <div>Type: <strong className="capitalize">{hoveredShot.shotType.replace('_', ' ')}</strong></div>
                </div>
              </div>
            )}
          </div>

          {/* Shot Legend */}
          <div className="flex flex-wrap items-center justify-around gap-2 mt-4 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-400"></span> Goal
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span> Saved
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span> Blocked
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-slate-600"></span> Off Target
            </span>
          </div>
        </div>

        {/* Right Column: Key Team Performance Metrics */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            Head-to-Head Tactical Metrics
          </h3>

          <div className="space-y-3 text-xs font-mono">
            {[
              { label: 'Total Shots', home: stats.homeShots, away: stats.awayShots },
              { label: 'Shots on Target', home: stats.homeShotsOnTarget, away: stats.awayShotsOnTarget },
              { label: 'Expected Goals (xG)', home: stats.homeXg.toFixed(2), away: stats.awayXg.toFixed(2) },
              { label: 'Tackles Won', home: stats.homeTackles, away: stats.awayTackles },
              { label: 'Interceptions', home: stats.homeInterceptions, away: stats.awayInterceptions },
              { label: 'Fouls Committed', home: stats.homeFouls, away: stats.awayFouls },
              { label: 'Corner Kicks', home: stats.homeCorners, away: stats.awayCorners },
              { label: 'Yellow Cards', home: stats.homeYellowCards, away: stats.awayYellowCards },
              { label: 'Red Cards', home: stats.homeRedCards, away: stats.awayRedCards },
            ].map((metric) => (
              <div key={metric.label} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 flex items-center justify-between">
                <span className="font-bold text-emerald-400 w-16 text-left">{metric.home}</span>
                <span className="text-slate-400 text-center flex-1">{metric.label}</span>
                <span className="font-bold text-indigo-400 w-16 text-right">{metric.away}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Individual Player Performance Ratings (1.0 to 10.0 scale) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              Individual Player Ratings & Performance Breakdown
            </h3>
            <p className="text-xs text-slate-400">
              Evaluated on 1.0 to 10.0 scale reflecting match impact, duel efficiency, condition degradation, and discipline
            </p>
          </div>

          {/* Toggle Home / Away Players */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setPlayerRatingTeam('home')}
              className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                playerRatingTeam === 'home' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              {homeClubName}
            </button>
            <button
              onClick={() => setPlayerRatingTeam('away')}
              className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                playerRatingTeam === 'away' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {awayClubName}
            </button>
          </div>
        </div>

        {/* Player Ratings Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Rating</th>
                <th className="py-2.5 px-3">Pos</th>
                <th className="py-2.5 px-3">Player Name</th>
                <th className="py-2.5 px-3">Role / Duty</th>
                <th className="py-2.5 px-2 text-center">G</th>
                <th className="py-2.5 px-2 text-center">A</th>
                <th className="py-2.5 px-2 text-center">Shots (OT)</th>
                <th className="py-2.5 px-2 text-center">xG</th>
                <th className="py-2.5 px-2 text-center">Passes</th>
                <th className="py-2.5 px-2 text-center">Tackles</th>
                <th className="py-2.5 px-2 text-center">Saves</th>
                <th className="py-2.5 px-3 text-right">Condition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {activePlayersList.map((p) => {
                const ratingBadgeColor = p.rating >= 7.8
                  ? 'bg-emerald-500 text-slate-950 font-black'
                  : (p.rating >= 6.8
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-300 font-medium');

                return (
                  <tr key={p.playerId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded text-xs ${ratingBadgeColor}`}>
                        {p.rating.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-bold text-emerald-400">{p.position}</td>
                    <td className="py-2 px-3 font-sans font-semibold text-white">{p.name}</td>
                    <td className="py-2 px-3 text-slate-400 text-[11px]">
                      {p.role} <span className="text-[9px] uppercase font-bold text-slate-500">({p.duty})</span>
                    </td>
                    <td className="py-2 px-2 text-center font-bold text-emerald-400">{p.goals || '-'}</td>
                    <td className="py-2 px-2 text-center text-slate-300">{p.assists || '-'}</td>
                    <td className="py-2 px-2 text-center text-slate-300">{p.shots} ({p.shotsOnTarget})</td>
                    <td className="py-2 px-2 text-center text-slate-300">{p.xG > 0 ? p.xG.toFixed(2) : '-'}</td>
                    <td className="py-2 px-2 text-center text-slate-300">{p.passesCompleted}/{p.passesAttempted}</td>
                    <td className="py-2 px-2 text-center text-slate-300">{p.tacklesWon}/{p.tacklesAttempted}</td>
                    <td className="py-2 px-2 text-center text-slate-300">{p.saves || '-'}</td>
                    <td className="py-2 px-3 text-right font-semibold">
                      <span className={p.conditionRemaining < 70 ? 'text-amber-400' : 'text-emerald-400'}>
                        {p.conditionRemaining}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
