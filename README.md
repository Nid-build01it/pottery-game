# 🏺 3D Pottery Game - Let's Create!

> An interactive, browser-based 3D pottery game inspired by *"Let's Create! Pottery"*, built from scratch with **Vite**, **Vanilla JavaScript (ES Modules)**, and **Three.js**.

🎮 **Live Demo:** [https://pottery-game.vercel.app/](https://pottery-game.vercel.app/)

---

## ✨ Features

- **🌀 Spinning Potter's Wheel & Lathe Clay**:
  - 64 height slice `LatheGeometry` that simulates real-time wheel throwing.
  - Zero-allocation geometry position buffer updates for 60 FPS performance on mid-range and mobile devices.
- **🖐️ Dynamic Hand Shaping**:
  - Drag horizontally to push or pull the clay's diameter with a smooth Gaussian falloff curve.
  - Drag near the top lip vertically to pull the pot taller or compress it into a squat bowl.
  - Clamped minimum and maximum boundaries ensure the clay structure never inverts or breaks.
- **💧 Clay Smoothing**:
  - Weighted neighbor averaging irons out ridges, bumps, and imperfections into sleek ceramic curves.
- **💠 Procedural Cultural Pattern Bands**:
  - Seamless repeating decorative ribbons drawn live via HTML5 Canvas (zero external image assets):
    - **African**: Serengeti dancers & acacia tree silhouettes, tribal orange chevron ladders, Kikuyu diamond lattice, Omo Valley dots.
    - **Egyptian**: Nile lotus arches, Pharaoh lapis crescents, Papyrus fluted reeds.
    - **American**: Navajo sawtooth chevrons, Southwest stepped frets, Aztec sunburst arrows.
    - **Geometric**: Classical Greek key meanders, running wave scrolls, pearl string beads.
- **🎨 Glaze Painting**:
  - Color palette with 9 curated ceramic glaze swatches (Terracotta, Cobalt Blue, Aegean Teal, Sunshine Gold, Emerald Green, Royal Plum, Charcoal, etc.).
  - Feathered horizontal glaze brush strokes that blend smoothly into the ceramic body.
- **🧹 Eraser**:
  - Restores painted or patterned bands back to raw, natural unglazed stoneware clay.
- **🏆 Target Reference & Star Appraisal**:
  - Bottom-left Polaroid card displays the target pot silhouette (Amphora, Ming Dynastic Vase, Seed Urn, Chalice, Caravan Bottle).
  - Tap the Polaroid to cycle between challenge shapes.
  - **"Finish" Button**: Compares player pot profile against target profile using Mean Absolute Error + height matching + decoration bonuses to evaluate a **1 to 5 star rating** and calculate the **"SOLD! $ price"** appraisal.
- **🔊 Web Audio API Procedural Sound Synthesis**:
  - Wet clay squishing & friction sounds that dynamically modulate with finger drag velocity.
  - Harmonic ceramic bell chimes when stamping patterns.
  - Wet glaze brush whooshes and celebratory fanfare upon selling the pot.
  - 100% procedural audio with no external audio files.
- **📸 4K Photo Export & Persistence**:
  - Dedicated camera button exports clean, high-resolution PNG snapshots without UI overlays.
  - Auto-saves and restores clay shape, height, and custom glaze textures to `localStorage`.
- **↺ History & Undo**:
  - Multi-step undo stack preserving geometry profiles and canvas texture snapshots.

---

## 🛠️ Tech Stack

- **Core Engine**: [Three.js](https://threejs.org/) (WebGL 3D Rendering, PCF Soft Shadows, ACES Filmic Tone Mapping)
- **Bundler & Dev Server**: [Vite](https://vitejs.dev/)
- **Language**: Vanilla JavaScript (ES Modules)
- **Audio**: Web Audio API (Synthesized Oscillators, Bandpass/Highpass Filters, Noise Generators)
- **Deployment**: [Vercel](https://vercel.com/)

---

## 📁 File Structure

```
pot/
├── .gitignore
├── index.html           # Game canvas container, UI overlays, modals, and toolbars
├── package.json         # Scripts and dependencies (Three.js & Vite)
├── vite.config.js       # Vite server configuration
├── README.md            # Project documentation and live link
└── src/
    ├── audio.js         # Procedural sound synthesizer (squish, stamp, brush, fanfare)
    ├── clay.js          # Lathe geometry, position updates & procedural textures
    ├── history.js       # Undo / snapshot stack
    ├── main.js          # Three.js setup, lighting, raycasting, wheel animation & loop
    ├── patterns.js      # Procedural pattern generator (African, Egyptian, American, Geometric)
    ├── scoring.js       # Target reference profiles & star appraisal calculation
    ├── style.css        # Responsive UI styling (forest bokeh backdrop, cards, badges, modals)
    └── ui.js           # UI controls, category tabs, swatches, modals & event binding
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` or `pnpm`

### Installation

```bash
# Clone repository or navigate to directory
cd pot

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open your browser at `http://localhost:3000` to play.

### Production Build

```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 🎛️ Easiest Customizations & Tweaks

1. **Wheel Spin Speed (`src/main.js`)**:
   Adjust `this.wheelSpinSpeed = 1.2;` (e.g. `2.0` for rapid rotation, or `0.6` for a relaxing slow spin).
2. **Clay Shaping Sensitivity (`src/main.js` & `src/clay.js`)**:
   In `src/main.js`, change `deltaRadius = deltaX * 0.006` to increase or decrease touch sensitivity. In `src/clay.js`, modify `brushSigma = 5.5` in `shapeRadius()` to change brush width.
3. **Smoothing Strength (`src/clay.js`)**:
   In `smoothSlices(centerSlice, strength = 0.45)`, raise `strength` to `0.8` for rapid smoothing or drop to `0.2` for subtle adjustments.
4. **Pattern Band Width (`src/clay.js`)**:
   In `applyPatternBand(v, pattern, bandHeightRatio = 0.13)`, change `0.13` to `0.08` for thin delicate lines or `0.20` for thick ornamental ribbons.
5. **Clay Texture & Glaze Finish (`src/clay.js`)**:
   In `this.material = new THREE.MeshStandardMaterial({...})`, tweak `bumpScale: 0.024` for deeper or shallower throwing rings, or change `roughness: 0.8` to `0.2` for a shiny glazed porcelain finish.

---

## 📄 License

MIT License. Free to use, modify, and distribute.
