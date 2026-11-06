// ==========================================
// Tactic Studio & 2D Spatial Pitch Visualizer
// 5x5 Spatial Formation Grid & Phase Controls
// ==========================================

import React, { useState } from 'react';
import {
  Tactic,
  TacticalSlot,
  RoleDuty,
  TacticalWidth,
  TacticalDirectness,
  TacticalTempo,
  TransitionLoss,
  TransitionGain,
  DefensiveLineHeight,
  PressingIntensity,
  Player
} from '../../types';
import { RoleDefinitions } from '../../engine/tactics/roles';
import { FormationEngine } from '../../engine/tactics/formations';
import {
  Compass,
  Shield,
  Zap,
  Activity
} from 'lucide-react';

interface TacticStudioProps {
  tactic: Tactic;
  onTacticChange: (updatedTactic: Tactic) => void;
  squad: Player[];
}

export const TacticStudio: React.FC<TacticStudioProps> = ({
  tactic,
  onTacticChange,
  squad
}) => {
  const [selectedSlotId, setSelectedSlotId] = useState<string>(tactic.slots[0]?.slotId ?? 'slot-0');

  const selectedSlot = tactic.slots.find(s => s.slotId === selectedSlotId) ?? tactic.slots[0];
  const assignedPlayer = squad.find(p => p.id === selectedSlot?.assignedPlayerId);
  const roleProfile = selectedSlot ? RoleDefinitions.getEffectiveProfile(selectedSlot.role, selectedSlot.duty) : null;

  // Preset switch handler
  const handleSelectPreset = (presetName: string) => {
    let preset: Tactic;
    switch (presetName) {
      case '433': preset = FormationEngine.create433(); break;
      case '4231': preset = FormationEngine.create4231(); break;
      case '442': preset = FormationEngine.create442(); break;
      case '352': preset = FormationEngine.create352(); break;
      case '532': preset = FormationEngine.create532(); break;
      default: preset = FormationEngine.create433();
    }
    const populated = FormationEngine.populateStarting11(preset, squad);
    onTacticChange(populated);
  };

  // Slot modifier
  const updateSlot = (updates: Partial<TacticalSlot>) => {
    const updatedSlots = tactic.slots.map(s => {
      if (s.slotId === selectedSlot.slotId) {
        return { ...s, ...updates };
      }
      return s;
    });
    onTacticChange({ ...tactic, slots: updatedSlots });
  };

  // Color helper for duty badges
  const getDutyColor = (duty: RoleDuty) => {
    switch (duty) {
      case 'Defend': return 'bg-blue-600 text-blue-100 border-blue-400';
      case 'Support': return 'bg-amber-600 text-amber-100 border-amber-400';
      case 'Attack': return 'bg-red-600 text-red-100 border-red-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Preset & Formation Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-400 font-mono">TACTICAL BLUEPRINT</div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <span>{tactic.name}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              {tactic.formationName}
            </span>
          </h2>
        </div>

        {/* Formation Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-400 font-mono mr-1">Presets:</span>
          {[
            { id: '433', label: '4-3-3 DM Wide' },
            { id: '4231', label: '4-2-3-1 Gegenpress' },
            { id: '442', label: '4-4-2 Direct' },
            { id: '352', label: '3-5-2 Wing-Backs' },
            { id: '532', label: '5-3-2 Low Block' }
          ].map(p => (
            <button
              key={p.id}
              onClick={() => handleSelectPreset(p.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium border transition-colors ${
                tactic.formationName.includes(p.id.split('').join('-')) || tactic.id.includes(p.id)
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: 2D Pitch Visualizer (5x5 Grid) + Role Config + Phase Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 2D Pitch 5x5 Matrix Visualizer */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-3 text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              5x5 Spatial Grid (Attacking ➔ Top)
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-[11px] text-blue-400">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span> Defend
              </span>
              <span className="flex items-center gap-1 text-[11px] text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> Support
              </span>
              <span className="flex items-center gap-1 text-[11px] text-red-400">
                <span className="w-2 h-2 rounded-full bg-red-500"></span> Attack
              </span>
            </div>
          </div>

          {/* SVG Pitch Canvas with 5x5 Grid */}
          <div className="relative w-full max-w-[440px] aspect-[4/5] bg-emerald-950 rounded-xl border-4 border-slate-800 overflow-hidden shadow-2xl p-3">
            {/* Pitch Markings */}
            <div className="absolute inset-0 pointer-events-none opacity-30">
              {/* Outer border & halfway line */}
              <div className="absolute inset-2 border border-white/40 rounded"></div>
              <div className="absolute left-2 right-2 top-1/2 h-px bg-white/40"></div>
              {/* Center Circle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-white/40"></div>
              {/* Penalty Areas */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-44 h-18 border-b border-x border-white/40"></div>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-44 h-18 border-t border-x border-white/40"></div>
              {/* Goal Area */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-6 border-b border-x border-white/40"></div>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-6 border-t border-x border-white/40"></div>
            </div>

            {/* 5x5 Grid Slots: Y runs from 0 (Bottom/GK) to 4 (Top/Striker), X from 0 (Left) to 4 (Right) */}
            <div className="relative w-full h-full grid grid-cols-5 grid-rows-5 gap-1.5 z-10">
              {Array.from({ length: 25 }).map((_, cellIdx) => {
                const gridX = cellIdx % 5;
                const rowFromTop = Math.floor(cellIdx / 5);
                const gridY = 4 - rowFromTop; // Invert so Y=4 is attacking top, Y=0 is defending bottom

                // Find if a tactical slot occupies this cell
                const slot = tactic.slots.find(s => s.gridX === gridX && s.gridY === gridY);
                const isSelected = slot && slot.slotId === selectedSlot.slotId;
                const player = slot ? squad.find(p => p.id === slot.assignedPlayerId) : null;

                if (!slot) {
                  return (
                    <div
                      key={cellIdx}
                      className="border border-white/5 rounded-lg flex items-center justify-center text-[9px] text-white/10 font-mono"
                    >
                      {gridX},{gridY}
                    </div>
                  );
                }

                return (
                  <button
                    key={cellIdx}
                    onClick={() => setSelectedSlotId(slot.slotId)}
                    className={`relative w-full h-full rounded-xl border flex flex-col items-center justify-center p-1 transition-all ${
                      isSelected
                        ? 'bg-slate-900 border-emerald-400 shadow-lg shadow-emerald-500/30 scale-105 z-20 ring-2 ring-emerald-400/50'
                        : 'bg-slate-950/85 border-slate-700/80 hover:bg-slate-900 hover:border-slate-500'
                    }`}
                  >
                    {/* Position & Role pill */}
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-mono font-black text-emerald-400">
                        {slot.position}
                      </span>
                      <span className={`text-[8px] font-mono px-1 rounded-sm border uppercase font-bold ${getDutyColor(slot.duty)}`}>
                        {slot.duty[0]}
                      </span>
                    </div>

                    <div className="text-[9px] font-semibold text-white truncate max-w-[70px] mt-0.5">
                      {player ? player.name.split(' ').pop() : 'Unassigned'}
                    </div>

                    <div className="text-[8px] text-slate-400 truncate max-w-[70px] font-mono">
                      {slot.role}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Selected Role Inspector & 3 Tactical Phase Panels */}
        <div className="lg:col-span-6 space-y-4">
          {/* Active Slot & Role Behavior Profile Card */}
          {selectedSlot && roleProfile && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono font-bold text-xs border border-emerald-500/20">
                      {selectedSlot.position} ({selectedSlot.gridX}, {selectedSlot.gridY})
                    </span>
                    <h3 className="text-base font-black text-white">{selectedSlot.role}</h3>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Assigned: <span className="text-white font-semibold">{assignedPlayer?.name ?? 'None'}</span>
                    {assignedPlayer && ` (CA: ${assignedPlayer.hidden.currentAbility})`}
                  </div>
                </div>

                {/* Duty Toggle (Defend, Support, Attack) */}
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                  {roleProfile.compatibleDuties.map(d => (
                    <button
                      key={d}
                      onClick={() => updateSlot({ duty: d })}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase transition-colors border ${
                        selectedSlot.duty === d ? getDutyColor(d) : 'border-transparent text-slate-400 hover:text-white'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Role Behavioral Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-3 text-xs font-mono">
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <div className="text-[9px] text-slate-500">Pass Risk</div>
                  <div className="font-bold text-emerald-400">
                    {(roleProfile.passRiskThreshold * 100).toFixed(0)}%
                  </div>
                </div>

                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <div className="text-[9px] text-slate-500">Forward Runs</div>
                  <div className="font-bold text-indigo-400">
                    {(roleProfile.forwardRunFrequency * 100).toFixed(0)}%
                  </div>
                </div>

                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <div className="text-[9px] text-slate-500">Pressing Urgency</div>
                  <div className="font-bold text-amber-400">
                    {(roleProfile.pressingUrgency * 100).toFixed(0)}%
                  </div>
                </div>

                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <div className="text-[9px] text-slate-500">Spatial Drift</div>
                  <div className="font-bold text-white">
                    ΔX {roleProfile.inPossessionSpatialOffset.dx > 0 ? `+${roleProfile.inPossessionSpatialOffset.dx}` : roleProfile.inPossessionSpatialOffset.dx}
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-400 italic bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
                "{roleProfile.description}"
              </p>
            </div>
          )}

          {/* Tactical Phase 1: In Possession */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h4 className="text-xs font-bold text-emerald-400 font-mono uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> Phase 1: In Possession
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {/* Width */}
              <div>
                <label className="text-[10px] text-slate-400 font-mono block mb-1">Attacking Width</label>
                <select
                  value={tactic.inPossession.width}
                  onChange={(e) => onTacticChange({
                    ...tactic,
                    inPossession: { ...tactic.inPossession, width: e.target.value as TacticalWidth }
                  })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white font-mono focus:border-emerald-500"
                >
                  <option value="Narrow">Narrow</option>
                  <option value="Standard">Standard</option>
                  <option value="Wide">Wide</option>
                  <option value="Extremely Wide">Extremely Wide</option>
                </select>
              </div>

              {/* Directness */}
              <div>
                <label className="text-[10px] text-slate-400 font-mono block mb-1">Pass Directness</label>
                <select
                  value={tactic.inPossession.directness}
                  onChange={(e) => onTacticChange({
                    ...tactic,
                    inPossession: { ...tactic.inPossession, directness: e.target.value as TacticalDirectness }
                  })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white font-mono focus:border-emerald-500"
                >
                  <option value="Short">Short</option>
                  <option value="Balanced">Balanced</option>
                  <option value="Direct">Direct</option>
                  <option value="Route One">Route One</option>
                </select>
              </div>

              {/* Tempo */}
              <div>
                <label className="text-[10px] text-slate-400 font-mono block mb-1">Match Tempo</label>
                <select
                  value={tactic.inPossession.tempo}
                  onChange={(e) => onTacticChange({
                    ...tactic,
                    inPossession: { ...tactic.inPossession, tempo: e.target.value as TacticalTempo }
                  })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white font-mono focus:border-emerald-500"
                >
                  <option value="Low">Low</option>
                  <option value="Standard">Standard</option>
                  <option value="High">High</option>
                  <option value="Maximum">Maximum</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tactical Phase 2: In Transition */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h4 className="text-xs font-bold text-indigo-400 font-mono uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" /> Phase 2: In Transition
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {/* On Loss */}
              <div>
                <label className="text-[10px] text-slate-400 font-mono block mb-1">On Loss of Possession</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['Counter-Press', 'Regroup'] as TransitionLoss[]).map(val => (
                    <button
                      key={val}
                      onClick={() => onTacticChange({
                        ...tactic,
                        inTransition: { ...tactic.inTransition, onLossOfPossession: val }
                      })}
                      className={`py-1.5 px-2 rounded-lg text-xs font-mono font-medium border text-center transition-colors ${
                        tactic.inTransition.onLossOfPossession === val
                          ? 'bg-indigo-600 text-white border-indigo-400'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              {/* On Gain */}
              <div>
                <label className="text-[10px] text-slate-400 font-mono block mb-1">On Won Possession</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['Counter', 'Hold Shape'] as TransitionGain[]).map(val => (
                    <button
                      key={val}
                      onClick={() => onTacticChange({
                        ...tactic,
                        inTransition: { ...tactic.inTransition, onWonPossession: val }
                      })}
                      className={`py-1.5 px-2 rounded-lg text-xs font-mono font-medium border text-center transition-colors ${
                        tactic.inTransition.onWonPossession === val
                          ? 'bg-indigo-600 text-white border-indigo-400'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tactical Phase 3: Out of Possession */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h4 className="text-xs font-bold text-amber-400 font-mono uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Phase 3: Out of Possession
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {/* Defensive Line */}
              <div>
                <label className="text-[10px] text-slate-400 font-mono block mb-1">Defensive Line</label>
                <select
                  value={tactic.outOfPossession.defensiveLine}
                  onChange={(e) => onTacticChange({
                    ...tactic,
                    outOfPossession: { ...tactic.outOfPossession, defensiveLine: e.target.value as DefensiveLineHeight }
                  })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white font-mono focus:border-amber-500"
                >
                  <option value="Very Low">Very Low</option>
                  <option value="Low">Low</option>
                  <option value="Mid-Block">Mid-Block</option>
                  <option value="High Line">High Line</option>
                  <option value="Much Higher Line">Much Higher Line</option>
                </select>
              </div>

              {/* Pressing Trigger */}
              <div>
                <label className="text-[10px] text-slate-400 font-mono block mb-1">Pressing Trigger</label>
                <select
                  value={tactic.outOfPossession.pressingIntensity}
                  onChange={(e) => onTacticChange({
                    ...tactic,
                    outOfPossession: { ...tactic.outOfPossession, pressingIntensity: e.target.value as PressingIntensity }
                  })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white font-mono focus:border-amber-500"
                >
                  <option value="Never">Never</option>
                  <option value="Cautious">Cautious</option>
                  <option value="Regular">Regular</option>
                  <option value="Frequent">Frequent</option>
                  <option value="Extreme">Extreme</option>
                </select>
              </div>

              {/* Offside Trap */}
              <div>
                <label className="text-[10px] text-slate-400 font-mono block mb-1">Offside Trap</label>
                <button
                  onClick={() => onTacticChange({
                    ...tactic,
                    outOfPossession: { ...tactic.outOfPossession, offsideTrap: !tactic.outOfPossession.offsideTrap }
                  })}
                  className={`w-full py-1.5 px-2 rounded-lg text-xs font-mono font-bold border transition-colors ${
                    tactic.outOfPossession.offsideTrap
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  {tactic.outOfPossession.offsideTrap ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
