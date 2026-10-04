# 鯉の池 · KOI POND — Interactive Zen Sanctuary

[![Deploy to GitHub Pages](https://github.com/Ashborn-047/koi-pond/actions/workflows/deploy.yml/badge.svg)](https://github.com/Ashborn-047/koi-pond/actions/workflows/deploy.yml)
[![CI Quality & Syntax Check](https://github.com/Ashborn-047/koi-pond/actions/workflows/ci.yml/badge.svg)](https://github.com/Ashborn-047/koi-pond/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Vanilla JavaScript](https://img.shields.io/badge/Vanilla-ES6%2B%20Modules-f59e0b.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5 Canvas](https://img.shields.io/badge/Graphics-HTML5%20Canvas2D-38bdf8.svg)](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
[![Web Audio API](https://img.shields.io/badge/Audio-Procedural%20Web%20Audio-ec4899.svg)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero%20(Pure%20Native)-10b981.svg)](#)

> A serene, interactive Japanese Zen garden pond simulation crafted in pure Vanilla JavaScript, HTML5 Canvas, and procedural Web Audio. Features multi-joint kinematic swimming koi, buoyant lily pads coupled to fluid current physics, falling sakura petals, living garden fauna, and an organic nature soundscape.

---

## 🌊 Live Demonstration

Experience the interactive sanctuary directly in your browser:
👉 **[https://ashborn-047.github.io/koi-pond/](https://ashborn-047.github.io/koi-pond/)**

---

## ✨ Features & Visual Physics

### 🎏 1. Realistic Koi Kinematics & Varieties
- **Multi-Joint Segment Chain:** 10 articulable skeletal vertebrae simulated with angle clamping, dynamic body curvature, fin flutter oscillation, and variable swimming velocity.
- **Traditional Japanese Varieties:**
  - **Kohaku:** Pristine porcelain white with vibrant fiery vermilion patches.
  - **Taisho Sanke:** Tri-color white body decorated with scarlet and lacquer-black sumi.
  - **Showa Sanshoku:** Powerful black-based sumi patterns with crimson and snow-white accents.
  - **Tancho:** Pure snow-white body with an iconic crimson crown crest on the head.
  - **Asagi:** Indigo-blue diamond net reticulation scales with sunset-orange ventral fins.
  - **Ginrin Ogon:** Glistening platinum metallic sheen catching surface caustics.
- **Curious AI & Petting Interaction:** Keeping your cursor or finger stationary gently attracts curious koi to surface and investigate. Moving quickly scatters the fish in panic wakes.

### 🍃 2. Buoyant Lotus Pads & Fluid Physics
- **Coupled Fluid Current:** Lily pads drift organically according to pond gyre currents and meandering fluid harmonics.
- **Elastic Stem Anchors:** Flexible stems tether each pad to the pond bed with hookian restoring spring forces.
- **Dynamic Buoyancy & Wakes:** Swimming koi push pads aside, generating realistic vertical bobbing, tilt, and expanding fluid ripples.
- **Hydrophobic Dew Droplets:** Shimmering surface beads that roll and tilt with wave crests.
- **Blooming Lotus Blossoms:** Layered floral petals and golden stamen core.

### 🌸 3. Flora, River Bed & Sky Lighting
- **Smooth River Stones & Velvet Moss:** Embedded cobbles along the pond floor with 3D bevel lighting and organic sediment shadows.
- **Falling Cherry & Lotus Petals:** Air-resistance tumbling physics; petals drift on the wind before touching down to float on the water surface.
- **Dynamic Celestial Sky Lighting:**
  - **Day:** Sunlit emerald jade waters with golden caustic refractions.
  - **Dusk:** Warm twilight violet-magenta gradients with glowing golden reflections.
  - **Night:** Deep midnight sapphire pool with soft luminous moonbeams.

### 🦗 4. Living Garden Fauna
- **Skimming Dragonflies:** High-speed aerodynamic darting, hovering, and water-dipping behaviors that create delicate ripples.
- **Nocturnal Fireflies:** Bioluminescent yellow-green glowing orbs that drift lazily through twilight and night air with realistic rhythmic pulse breathing.

### 🎵 5. Organic Procedural Soundscape (Zero Audio Files)
All audio is synthesized in real-time using the **Web Audio API**:
- **Flowing Mountain Wind:** Sweeping resonant bandpass noise that breathes with gentle gusts.
- **Living Bug Sounds:**
  - *Night / Dusk:* Rhythmic stridulating cricket chirps (`~4.6 kHz`).
  - *Daylight:* Japanese summer cicada / katydid vibrato trills (`~4.0 kHz`) with amplitude tremolo.
  - *Dragonfly:* Subtle low-frequency wing flutter and hover buzz (`85–130 Hz`).
- **Layered Rain Shower:** Continuous filtered rain wash combined with soft individual water droplet impacts.
- **Shishi-odoshi:** Traditional Japanese bamboo fountain thumps and water fills.
- **Furin Wind Chime:** Resonant glass wind chime tones swaying in the mountain breeze.
- **Feeding Plinks:** Water droplets and koi surface strikes.

---

## 🎮 Interactive Controls & Shortcuts

| Action | Control | Description |
| :--- | :--- | :--- |
| **Drop Fish Food** | `Click / Tap` | Drops sinking nutrition pellets; koi actively steer to feed. |
| **Water Ripples** | `Move Pointer / Swipe` | Creates interactive surface waves and pushes lily pads. |
| **Scatter School** | `Spacebar` or `Scatter` Button | Sends fish darting in all directions with romantic petal flurry. |
| **Koi Population** | `+ / -` Buttons | Adjusts the active school size between 2 and 14 koi. |
| **Time of Day** | `Day / Dusk / Night` | Transitions pond lighting, water refraction, and fauna sounds. |
| **Rain Shower** | `Rain` Button | Toggles atmospheric gentle rainfall with ripples and audio. |
| **Soundscape** | `Sound` Button | Activates/mutes the procedural Web Audio engine. |
| **Zen Meditation** | `Z` key or `Zen` Button | Slows simulation time by 55% for tranquil mindfulness. |
| **Photo Snapshot** | `Camera` Button | Captures high-res PNG snapshot of the pond without UI overlays. |
| **Toggle UI** | `H` key or `Hide` Button | Minimizes all HUD controls for an unobstructed screensaver view. |
| **Fullscreen** | `F` key or `Fullscreen` Button | Toggles distraction-free immersive full-screen mode. |

---

## 🏛️ Modular Architecture

The codebase is organized into cleanly segregated ES6 modules with single responsibilities:

```
KOI POND/
├── .github/
│   └── workflows/
│       ├── deploy.yml          # Automated zero-config GitHub Pages deployment
│       └── ci.yml              # Syntax validation & module integrity check
├── css/
│   ├── base.css                # Reset, typography, full-bleed canvas styling
│   ├── canvas.css              # Pixel scaling and canvas layer configuration
│   └── ui.css                  # Modern glassmorphism HUD, segmented dock, animations
├── js/
│   ├── core/
│   │   ├── config.js           # Math utilities, fish palettes, random generators
│   │   └── state.js            # Global reactive simulation state & singleton
│   ├── environment/
│   │   ├── water.js            # Fluid velocity vectors, sky lighting & caustics
│   │   ├── ripples.js          # Ring wave propagation, damping, reflection
│   │   └── stones.js           # Pond floor river cobbles & moss patches
│   ├── entities/
│   │   ├── koi.js              # Multi-joint kinematics, fish AI, curiosity petting
│   │   ├── fry.js              # Minnow boid schooling algorithms (flocking)
│   │   ├── lilypad.js          # Elastic stem physics, floating lotus pads & flowers
│   │   ├── lotus.js            # Module alias re-export for clean backwards-compat
│   │   ├── flora.js            # Falling cherry/lotus petal flight & surface drift
│   │   ├── fauna.js            # Dragonflies & nocturnal bioluminescent fireflies
│   │   └── food.js             # Sinking food pellets and feeding consumption
│   ├── audio/
│   │   └── audio.js            # Web Audio synthesis (wind, bugs, rain, chimes, bamboo)
│   ├── ui/
│   │   └── controls.js         # Pointer, touch, keyboard shortcuts & HUD binders
│   └── main.js                 # Master simulation orchestrator & requestAnimationFrame loop
├── .gitignore                  # Clean repository ignore patterns
├── index.html                  # Accessible, semantic entrypoint
├── LICENSE                     # MIT Open Source License
├── package.json                # Project scripts and metadata
├── server.js                   # Lightweight zero-cache local development server
└── style.css                   # Global CSS manifest importing modular stylesheets
```

---

## 🚀 Getting Started

### Prerequisites
- Any modern web browser (Google Chrome, Mozilla Firefox, Apple Safari, Microsoft Edge).
- Node.js (optional, only for the local dev server).

### Running Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Ashborn-047/koi-pond.git
   cd koi-pond
   ```

2. **Launch the local development server:**
   ```bash
   node server.js
   ```
   *Or with npm:*
   ```bash
   npm start
   ```

3. **Open in browser:**
   Navigate to `http://localhost:3000/`.

*(Alternatively, you can open `index.html` with VS Code Live Server or Python's `python -m http.server 3000`.)*

---

## 🌐 Deploying to GitHub Pages

This repository is pre-configured with automated **GitHub Actions** for instant, zero-build deployment:

1. Push this repository to GitHub:
   ```bash
   git remote add origin https://github.com/Ashborn-047/koi-pond.git
   git branch -M main
   git push -u origin main
   ```

2. Enable GitHub Pages in your repository settings:
   - On GitHub, go to your repository **Settings** → **Pages** (in the left sidebar).
   - Under **Build and deployment** → **Source**, select **GitHub Actions**.
   - The `.github/workflows/deploy.yml` workflow will automatically run and publish your site!

3. Your live link will be available at:
   👉 **https://ashborn-047.github.io/koi-pond/**

---

## ⚡ Performance Philosophy

- **Zero External Dependencies:** Built with pure web standards. No React, no Three.js, no bundler overhead, and zero third-party runtime scripts.
- **Fast 60+ FPS Rendering:** Hardware-accelerated Canvas2D transforms, cached gradients, and optimized boid schooling algorithms.
- **Zero Audio Assets to Download:** All sound is synthesized procedurally in real-time, resulting in virtually instantaneous page load times and zero network audio bandwidth.
- **Responsive Across All Screens:** Adapts pixel scaling dynamically from 4K desktop displays down to mobile smartphones.

---

## 📜 License

This project is open source and available under the [MIT License](LICENSE).
Feel free to fork, customize, and build your own Zen sanctuaries!

---

*Made with tranquility and attention to detail.* 🌿🎏
