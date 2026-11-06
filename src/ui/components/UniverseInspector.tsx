// ==========================================
// Universe Inspector & Statistical Distributions
// ==========================================

import React, { useState, useMemo } from 'react';
import { League, Player } from '../../types';
import {
  Search,
  Building,
  DollarSign,
  TrendingUp,
  Award
} from 'lucide-react';

interface UniverseInspectorProps {
  league: League;
}

export const UniverseInspector: React.FC<UniverseInspectorProps> = ({ league }) => {
  const [selectedClubId, setSelectedClubId] = useState<string>(league.clubs[0]?.id ?? '');
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState<string>('ALL');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  // Active Club
  const currentClub = useMemo(() => {
    return league.clubs.find(c => c.id === selectedClubId) ?? league.clubs[0];
  }, [league, selectedClubId]);

  // Aggregate All Players across League for Global Distribution Analysis
  const allLeaguePlayers = useMemo(() => {
    return league.clubs.flatMap(c => c.players);
  }, [league]);

  // Filtered Roster for current club
  const filteredSquad = useMemo(() => {
    if (!currentClub) return [];
    return currentClub.players.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.nationality.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPos = positionFilter === 'ALL' || p.position === positionFilter;
      return matchesSearch && matchesPos;
    });
  }, [currentClub, searchQuery, positionFilter]);

  // Histogram calculation for CA (Current Ability)
  // Bins: 70-80, 80-90, 90-100, 100-110, 110-120, 120-130, 130-140, 140-150, 150-160, 160-170, 170-180, 180-190, 190-200
  const histogramData = useMemo(() => {
    const binSize = 10;
    const minBin = 70;
    const maxBin = 200;
    const bins: { label: string; count: number; theoretical: number }[] = [];

    const total = allLeaguePlayers.length;
    const targetMean = league.tier === 1 ? 145 : 115;
    const targetSigma = league.tier === 1 ? 18 : 15;

    for (let b = minBin; b < maxBin; b += binSize) {
      const binMid = b + binSize / 2;
      const count = allLeaguePlayers.filter(p => p.hidden.currentAbility >= b && p.hidden.currentAbility < b + binSize).length;
      
      // Theoretical Gaussian height: (1 / (sigma * sqrt(2pi))) * exp(-0.5 * ((x - mu)/sigma)^2) * total * binSize
      const z = (binMid - targetMean) / targetSigma;
      const gaussianPdf = (1.0 / (targetSigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z);
      const theoretical = Math.round(gaussianPdf * total * binSize);

      bins.push({
        label: `${b}-${b + binSize}`,
        count,
        theoretical
      });
    }

    const maxCount = Math.max(...bins.map(b => Math.max(b.count, b.theoretical)), 1);

    return { bins, maxCount, total, mean: targetMean, sigma: targetSigma };
  }, [allLeaguePlayers, league.tier]);

  // Helper for attribute color badge
  const getAttrBadgeColor = (val: number) => {
    if (val >= 16) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (val >= 12) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    if (val >= 8) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  return (
    <div className="space-y-6">
      {/* Top Statistical Summary Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-mono">LEAGUE COMPETITION</div>
            <div className="text-lg font-bold text-white mt-0.5">{league.name}</div>
            <div className="text-xs text-emerald-400 font-mono mt-1">20 Clubs • 500 Players</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-mono">GAUSSIAN CA TARGET</div>
            <div className="text-lg font-bold text-white mt-0.5">
              μ = {histogramData.mean} <span className="text-slate-400 font-normal">| σ = {histogramData.sigma}</span>
            </div>
            <div className="text-xs text-indigo-400 font-mono mt-1">Box-Muller Scaled</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-mono">TOTAL WAGE EXPENDITURE</div>
            <div className="text-lg font-bold text-white mt-0.5">
              £{(league.clubs.reduce((acc, c) => acc + c.finances.currentWageBillWeekly, 0) / 1000000).toFixed(1)}M /wk
            </div>
            <div className="text-xs text-amber-400 font-mono mt-1">Pareto α = 1.65 Disparity</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-mono">STADIUM CAPACITY SPAN</div>
            <div className="text-lg font-bold text-white mt-0.5">
              {Math.min(...league.clubs.map(c => c.finances.stadiumCapacity)).toLocaleString()} - {Math.max(...league.clubs.map(c => c.finances.stadiumCapacity)).toLocaleString()}
            </div>
            <div className="text-xs text-cyan-400 font-mono mt-1">Seats across League</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Building className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Gaussian CA/PA Distribution Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              League Current Ability (CA) Gaussian Histogram vs Theoretical Curve
            </h3>
            <p className="text-xs text-slate-400">
              Demonstrates Box-Muller sampling fidelity across all {histogramData.total} players in the generated universe
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span>
              <span className="text-slate-300">Empirical Sample</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-indigo-500/60 border border-indigo-400 inline-block"></span>
              <span className="text-slate-300">Theoretical Normal Curve</span>
            </div>
          </div>
        </div>

        {/* Histogram Bar Chart */}
        <div className="h-44 flex items-end gap-2 pt-6 pb-2 border-b border-slate-800">
          {histogramData.bins.map((bin, idx) => {
            const barHeightPct = Math.min(100, (bin.count / histogramData.maxCount) * 100);
            const theoreticalHeightPct = Math.min(100, (bin.theoretical / histogramData.maxCount) * 100);

            return (
              <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                {/* Tooltip */}
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 border border-slate-700 text-[10px] font-mono px-2 py-1 rounded shadow-lg pointer-events-none z-10 whitespace-nowrap text-white">
                  CA {bin.label}: {bin.count} players (Theo: {bin.theoretical})
                </div>

                <div className="w-full flex items-end justify-center gap-0.5 h-full">
                  {/* Empirical Bar */}
                  <div
                    style={{ height: `${barHeightPct}%` }}
                    className="w-1/2 bg-emerald-500 rounded-t-sm transition-all duration-300 hover:bg-emerald-400"
                  />
                  {/* Theoretical Curve Overlay Bar */}
                  <div
                    style={{ height: `${theoreticalHeightPct}%` }}
                    className="w-1/2 bg-indigo-500/40 border-t-2 border-indigo-400 rounded-t-sm transition-all duration-300"
                  />
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-1.5 truncate">
                  {bin.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Two-Column Layout: Club Selector & Squad Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Club Directory */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono mb-3 flex items-center justify-between">
              <span>Club Directory ({league.clubs.length})</span>
              <span className="text-slate-500 text-[10px]">Ranked by Reputation</span>
            </h3>

            <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
              {league.clubs.map((club, idx) => {
                const isSelected = club.id === selectedClubId;
                return (
                  <button
                    key={club.id}
                    onClick={() => setSelectedClubId(club.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-slate-800/90 border-emerald-500/50 shadow-sm shadow-emerald-500/10'
                        : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3.5 h-7 rounded-sm flex-shrink-0 shadow-sm"
                        style={{ backgroundColor: club.primaryColor }}
                      />
                      <div>
                        <div className="font-semibold text-sm text-white flex items-center gap-1.5">
                          <span>{club.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">[{club.code}]</span>
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>Rep: {club.reputation}</span>
                          <span>•</span>
                          <span>Cap: {(club.finances.stadiumCapacity / 1000).toFixed(0)}k</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono font-semibold text-emerald-400">
                        £{(club.finances.wageBudgetWeekly / 1000).toFixed(0)}k/w
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Rank #{idx + 1}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Selected Club Roster & Inspector */}
        <div className="lg:col-span-8 space-y-4">
          {/* Club Header Card */}
          {currentClub && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center font-black font-mono text-lg shadow-md"
                    style={{ backgroundColor: currentClub.primaryColor, color: currentClub.secondaryColor }}
                  >
                    {currentClub.code}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white tracking-tight">{currentClub.name}</h2>
                    <div className="text-xs text-slate-400 flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-slate-500" />
                        {currentClub.stadiumName} ({currentClub.finances.stadiumCapacity.toLocaleString()} seats)
                      </span>
                      <span>•</span>
                      <span className="text-emerald-400 font-semibold font-mono">
                        Reputation: {currentClub.reputation} / 10,000
                      </span>
                    </div>
                  </div>
                </div>

                {/* Club Financial Ledger */}
                <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs font-mono">
                  <div>
                    <div className="text-[10px] text-slate-500">TRANSFER BUDGET</div>
                    <div className="font-bold text-white">£{(currentClub.finances.transferBudget / 1000000).toFixed(1)}M</div>
                  </div>
                  <div className="h-6 w-px bg-slate-800" />
                  <div>
                    <div className="text-[10px] text-slate-500">WAGE BUDGET</div>
                    <div className="font-bold text-white">£{(currentClub.finances.wageBudgetWeekly / 1000).toFixed(0)}k/w</div>
                  </div>
                  <div className="h-6 w-px bg-slate-800" />
                  <div>
                    <div className="text-[10px] text-slate-500">CURRENT SPEND</div>
                    <div className={`font-bold ${currentClub.finances.currentWageBillWeekly > currentClub.finances.wageBudgetWeekly ? 'text-red-400' : 'text-emerald-400'}`}>
                      £{(currentClub.finances.currentWageBillWeekly / 1000).toFixed(0)}k/w
                    </div>
                  </div>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 mt-5 pt-4 border-t border-slate-800">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search player name, nationality, or position..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-1 text-xs">
                  {['ALL', 'GK', 'CB', 'LB', 'RB', 'DM', 'CM', 'LW', 'RW', 'AM', 'ST'].map(pos => (
                    <button
                      key={pos}
                      onClick={() => setPositionFilter(pos)}
                      className={`px-2 py-1 rounded font-mono text-[11px] font-semibold transition-colors ${
                        positionFilter === pos
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Player Roster Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto max-h-[480px]">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] tracking-wider sticky top-0 z-10 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Pos</th>
                    <th className="py-2.5 px-3">Player Name</th>
                    <th className="py-2.5 px-2 text-center">Age</th>
                    <th className="py-2.5 px-2 text-center">CA</th>
                    <th className="py-2.5 px-2 text-center">PA</th>
                    <th className="py-2.5 px-3">Personality</th>
                    <th className="py-2.5 px-3 text-right">Wage</th>
                    <th className="py-2.5 px-3 text-right">Market Value</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredSquad.map((player) => (
                    <tr
                      key={player.id}
                      onClick={() => setSelectedPlayer(player)}
                      className={`cursor-pointer transition-colors ${
                        selectedPlayer?.id === player.id
                          ? 'bg-emerald-500/10'
                          : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="py-2 px-3">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 font-bold text-[10px] border border-slate-700">
                          {player.position}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-sans font-semibold text-white">
                        <div className="flex items-center gap-1.5">
                          <span>{player.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">({player.nationality})</span>
                        </div>
                      </td>
                      <td className="py-2 px-2 text-center text-slate-300">{player.age}</td>
                      <td className="py-2 px-2 text-center font-bold text-emerald-400">
                        {player.hidden.currentAbility}
                      </td>
                      <td className="py-2 px-2 text-center font-bold text-indigo-400">
                        {player.hidden.potentialAbility}
                      </td>
                      <td className="py-2 px-3 text-slate-300 font-sans text-[11px]">
                        {player.personality}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-300">
                        £{player.wageWeekly.toLocaleString()}/w
                      </td>
                      <td className="py-2 px-3 text-right text-amber-400 font-semibold">
                        £{(player.marketValue / 1000000).toFixed(1)}M
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPlayer(player);
                          }}
                          className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px]"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Player Modal Card */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold font-mono text-base">
                  {selectedPlayer.position}
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">{selectedPlayer.name}</h3>
                  <div className="text-xs text-slate-400 flex items-center gap-3 mt-0.5">
                    <span>{selectedPlayer.nationality}</span>
                    <span>•</span>
                    <span>{selectedPlayer.age} years old</span>
                    <span>•</span>
                    <span>Foot: {selectedPlayer.preferredFoot}</span>
                    <span>•</span>
                    <span className="text-indigo-400 font-semibold">
                      Personality: {selectedPlayer.personality}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedPlayer(null)}
                className="text-slate-400 hover:text-white text-lg font-mono p-1"
              >
                ✕
              </button>
            </div>

            {/* Hidden Variables & Ratings Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-500 font-mono">CURRENT ABILITY (CA)</div>
                <div className="text-lg font-black text-emerald-400 font-mono">
                  {selectedPlayer.hidden.currentAbility} <span className="text-xs text-slate-500 font-normal">/ 200</span>
                </div>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-500 font-mono">POTENTIAL ABILITY (PA)</div>
                <div className="text-lg font-black text-indigo-400 font-mono">
                  {selectedPlayer.hidden.potentialAbility} <span className="text-xs text-slate-500 font-normal">/ 200</span>
                </div>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-500 font-mono">WEEKLY WAGE</div>
                <div className="text-lg font-black text-white font-mono">
                  £{selectedPlayer.wageWeekly.toLocaleString()}
                </div>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-500 font-mono">MARKET ESTIMATE</div>
                <div className="text-lg font-black text-amber-400 font-mono">
                  £{(selectedPlayer.marketValue / 1000000).toFixed(1)}M
                </div>
              </div>
            </div>

            {/* Hidden Attributes Matrix */}
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 mb-5 text-xs font-mono">
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-2">
                Underlying Hidden Variables (1-20 Scale)
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
                <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                  <div className="text-[9px] text-slate-500">Consistency</div>
                  <div className="font-bold text-white">{selectedPlayer.hidden.consistency}</div>
                </div>
                <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                  <div className="text-[9px] text-slate-500">Dirtiness</div>
                  <div className="font-bold text-white">{selectedPlayer.hidden.dirtiness}</div>
                </div>
                <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                  <div className="text-[9px] text-slate-500">Injury Prone</div>
                  <div className="font-bold text-white">{selectedPlayer.hidden.injuryProneness}</div>
                </div>
                <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                  <div className="text-[9px] text-slate-500">Professionalism</div>
                  <div className="font-bold text-white">{selectedPlayer.hidden.professionalism}</div>
                </div>
                <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                  <div className="text-[9px] text-slate-500">Ambition</div>
                  <div className="font-bold text-white">{selectedPlayer.hidden.ambition}</div>
                </div>
                <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                  <div className="text-[9px] text-slate-500">Pressure</div>
                  <div className="font-bold text-white">{selectedPlayer.hidden.pressure}</div>
                </div>
              </div>
            </div>

            {/* Primary Attributes (Technical, Mental, Physical, Goalkeeping) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Technical */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-xs font-bold text-slate-300 uppercase font-mono mb-2 flex items-center justify-between">
                  <span>Technical</span>
                  <span className="text-[10px] text-slate-500">1-20</span>
                </div>
                <div className="space-y-1.5">
                  {Object.entries(selectedPlayer.attributes.technical).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between text-xs">
                      <span className="capitalize text-slate-400">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span className={`px-1.5 py-0.5 rounded font-mono font-bold text-[11px] border ${getAttrBadgeColor(val)}`}>
                        {val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mental */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-xs font-bold text-slate-300 uppercase font-mono mb-2 flex items-center justify-between">
                  <span>Mental</span>
                  <span className="text-[10px] text-slate-500">1-20</span>
                </div>
                <div className="space-y-1.5">
                  {Object.entries(selectedPlayer.attributes.mental).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between text-xs">
                      <span className="capitalize text-slate-400">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span className={`px-1.5 py-0.5 rounded font-mono font-bold text-[11px] border ${getAttrBadgeColor(val)}`}>
                        {val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Physical & GK */}
              <div className="space-y-4">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-xs font-bold text-slate-300 uppercase font-mono mb-2 flex items-center justify-between">
                    <span>Physical</span>
                    <span className="text-[10px] text-slate-500">1-20</span>
                  </div>
                  <div className="space-y-1.5">
                    {Object.entries(selectedPlayer.attributes.physical).map(([key, val]) => (
                      <div key={key} className="flex items-center justify-between text-xs">
                        <span className="capitalize text-slate-400">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span className={`px-1.5 py-0.5 rounded font-mono font-bold text-[11px] border ${getAttrBadgeColor(val)}`}>
                          {val}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedPlayer.position === 'GK' && (
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div className="text-xs font-bold text-slate-300 uppercase font-mono mb-2 flex items-center justify-between">
                      <span>Goalkeeping</span>
                      <span className="text-[10px] text-slate-500">1-20</span>
                    </div>
                    <div className="space-y-1.5">
                      {Object.entries(selectedPlayer.attributes.goalkeeping).map(([key, val]) => (
                        <div key={key} className="flex items-center justify-between text-xs">
                          <span className="capitalize text-slate-400">{key.replace(/([A-Z])/g, ' $1')}</span>
                          <span className={`px-1.5 py-0.5 rounded font-mono font-bold text-[11px] border ${getAttrBadgeColor(val)}`}>
                            {val}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
