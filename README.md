# Agelius Games Hub

A unified arcade portal and collection of browser games crafted with pure HTML5 Canvas, Vanilla ES6 JavaScript, Web Audio API synthesis, and mathematical simulation engines by Agelius.

🌐 **Live Arcade:** [https://games.ageliusg.tech](https://games.ageliusg.tech)

---

## 🕹️ Quick Start

Simply open the central hub in your browser:
```bash
open index.html
```

Or run any specific title directly:
```bash
# PitchCore: Deep Football Manager
open football-manager/index.html

# Playlog Grid: DOOH Dispatcher
open playlog-grid/index.html

# Overdrive: Block Clearer
open overdrive/index.html

# LifeLines: The +Age Simulator
open lifelines/index.html
```

---

## 🎮 Catalog

| Game | Directory | Description |
| :--- | :--- | :--- |
| **PitchCore: Deep Football Manager** | [`football-manager/`](file:///Users/ageliusg/Desktop/Antigravity/Games/football-manager/index.html) | Ultra-deep, mathematically rigorous football management simulation. Features Box-Muller Gaussian player universes, Pareto club economies, 5x5 spatial tactics with dynamic role drift (Inverted Wing-Backs, Mezzalas), discrete 20s tick match duels, and 2D spatial xG shot maps. |
| **Playlog Grid: DOOH Dispatcher** | [`playlog-grid/`](file:///Users/ageliusg/Desktop/Antigravity/Games/playlog-grid/index.html) | Network telemetry & dispatch casual simulation inspired by *Mini Metro*. Fulfill screen demands, route video packets, resolve firmware incidents, and choose shift upgrades. |
| **Overdrive: Block Clearer** | [`overdrive/`](file:///Users/ageliusg/Desktop/Antigravity/Games/overdrive/index.html) | Kinetic 8x8 spatial polyomino block puzzle featuring dual-axis clears, screen shake, explosion particles, and harmonic synthesizer chords. |
| **LifeLines: The +Age Simulator** | [`lifelines/`](file:///Users/ageliusg/Desktop/Antigravity/Games/lifelines/index.html) | Text-based life simulation engine with a central "+ Age" button, dynamic vitals, career ladders, relationships, real estate, stocks, prison breaks, ribbons, and generational dynasties. |

---

## 📁 Project Structure

```
Games/
├── index.html            # Unified Arcade Hub & Game Selector (4 Cabinet Slots)
├── README.md             # Workspace Documentation
├── football-manager/     # PitchCore: Football Management Simulation (Standalone Build)
│   ├── index.html        # App Entry Point & Dev Harness
│   └── assets/           # Bundled CSS, JS & Assets
├── src/                  # PitchCore TypeScript Simulation Core & UI Engine
│   ├── engine/           # Math (PRNG, Gaussian), Generator, Tactics, Match Core
│   ├── types/            # Strict TypeScript Interfaces
│   └── ui/               # React Developer Testing Harness & Shot Maps
├── playlog-grid/         # Playlog Grid DOOH Dispatcher
│   ├── index.html        # Game Interface
│   ├── game.js           # 60fps Canvas Loop & Network Engine
│   ├── audio.js          # Procedural Web Audio Synthesizer
│   ├── style.css         # Cyberpunk NOC Theme
│   └── logo-playlog.png  # Playlog Brand Asset
├── overdrive/            # Overdrive Block Clearer
│   └── index.html        # Self-contained Canvas Game
└── lifelines/            # LifeLines: The +Age Simulator
    ├── index.html        # Mobile-First Life Sim Interface & Modals
    ├── game.js           # +Age Engine, Career Tracks & Dynasty Mechanics
    ├── data.js           # World Database (Careers, Real Estate, Dilemmas)
    ├── audio.js          # Procedural Web Audio Sound Synthesis
    └── style.css         # Modern Glassmorphic Theme & Vitals Gauges
```

---

## ⚽ PitchCore Engine Verification & Development

To test the headless simulation core, execute benchmarks, or rebuild:

```bash
# Run determinism and 100-match headless benchmark test (<1.5s)
npm test

# Type check TypeScript codebase
npm run typecheck

# Rebuild the standalone production package into football-manager/
npm run build
```
