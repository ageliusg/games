// ==========================================
// Dev Harness Top Navigation Bar
// ==========================================

import React from 'react';
import {
  Trophy,
  Users,
  Compass,
  Play,
  Calendar,
  BarChart3,
  CheckCircle2,
  Save,
  RotateCcw,
  Download,
  Upload
} from 'lucide-react';

export type NavTab = 'universe' | 'tactics' | 'match' | 'fixtures' | 'analytics' | 'batch';

interface NavbarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  tier: 1 | 2;
  onTierChange: (tier: 1 | 2) => void;
  seed: string;
  onSeedChange: (seed: string) => void;
  onRegenerateUniverse: () => void;
  onSaveState: () => void;
  onExportJson: () => void;
  onImportJson: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  tier,
  onTierChange,
  seed,
  onSeedChange,
  onRegenerateUniverse,
  onSaveState,
  onExportJson,
  onImportJson
}) => {
  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Logo and System Identification */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-white text-base font-mono">
                PITCH<span className="text-emerald-400">CORE</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-mono font-semibold">
                PHASE 1 ENGINE
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Deterministic Football Simulation Harness
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => onTabChange('universe')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentTab === 'universe'
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Universe Inspector
          </button>

          <button
            onClick={() => onTabChange('tactics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentTab === 'tactics'
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Tactic Studio
          </button>

          <button
            onClick={() => onTabChange('match')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentTab === 'match'
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            Match Simulator
          </button>

          <button
            onClick={() => onTabChange('fixtures')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentTab === 'fixtures'
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Fixtures & League
          </button>

          <button
            onClick={() => onTabChange('analytics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentTab === 'analytics'
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Shot Map & Hub
          </button>

          <button
            onClick={() => onTabChange('batch')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentTab === 'batch'
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Batch & Determinism
          </button>
        </nav>

        {/* Global Controls: Seed, Tier, Save */}
        <div className="flex items-center gap-2">
          {/* League Tier selector */}
          <div className="flex items-center rounded-lg bg-slate-950 border border-slate-800 p-0.5 text-xs font-mono">
            <button
              onClick={() => onTierChange(1)}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                tier === 1 ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Tier 1: Elite (Mean CA 145, SD 18)"
            >
              Tier 1
            </button>
            <button
              onClick={() => onTierChange(2)}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                tier === 2 ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Tier 2: Championship (Mean CA 115, SD 15)"
            >
              Tier 2
            </button>
          </div>

          {/* Seed Input */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1">
            <span className="text-[10px] text-slate-400 font-mono">SEED:</span>
            <input
              type="text"
              value={seed}
              onChange={(e) => onSeedChange(e.target.value)}
              className="w-24 bg-transparent text-xs font-mono text-emerald-400 focus:outline-none"
              title="Universe Seed"
            />
            <button
              onClick={onRegenerateUniverse}
              className="text-slate-400 hover:text-emerald-400 transition-colors p-0.5"
              title="Regenerate Universe with new seed"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Save / Export Actions */}
          <button
            onClick={onSaveState}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Save state to LocalStorage"
          >
            <Save className="w-4 h-4" />
          </button>

          <button
            onClick={onExportJson}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Export Universe as JSON"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={onImportJson}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Import Universe from JSON"
          >
            <Upload className="w-4 h-4" />
          </button>

          {/* Link back to retro arcade hub */}
          <a
            href="../index.html"
            className="text-[10px] text-amber-400 hover:text-amber-300 px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded font-mono transition-colors"
            title="Return to Coin-Op Arcade Hub"
          >
            Arcade Hub 🕹️
          </a>
        </div>
      </div>
    </header>
  );
};
