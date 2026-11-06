# Agelius Games Hub

A unified arcade portal and collection of zero-dependency browser games crafted with pure HTML5 Canvas, Vanilla ES6 JavaScript, and Web Audio API synthesis.

---

## 🕹️ Quick Start

Simply open the central hub in your browser:
```bash
games.ageliusg.tech
```

Or run any specific title directly:
```bash
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
| **Playlog Grid: DOOH Dispatcher** | [`playlog-grid/`](file:///Users/ageliusg/Desktop/Antigravity/Games/playlog-grid/index.html) | Network telemetry & dispatch casual simulation inspired by *Mini Metro*. Fulfill screen demands, route video packets, resolve firmware incidents, and choose shift upgrades. |
| **Overdrive: Block Clearer** | [`overdrive/`](file:///Users/ageliusg/Desktop/Antigravity/Games/overdrive/index.html) | Kinetic 8x8 spatial polyomino block puzzle featuring dual-axis clears, screen shake, explosion particles, and harmonic synthesizer chords. |
| **LifeLines: The +Age Simulator** | [`lifelines/`](file:///Users/ageliusg/Desktop/Antigravity/Games/lifelines/index.html) | Text-based life simulation engine with a central "+ Age" button, dynamic vitals, career ladders, relationships, real estate, stocks, prison breaks, ribbons, and generational dynasties. |

---

## 📁 Project Structure

```
Games/
├── index.html            # Unified Arcade Hub & Game Selector
├── README.md             # Workspace Documentation
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
