# HANDOFF — FREQ AI PlayCanvas Simulation

## Current Goal

Build and polish the **PlayCanvas-powered barge drafting simulation** on the FREQ AI website (`/platform` page). This is a 3D operational digital twin that demonstrates FREQ AI's autonomous maritime cargo intelligence — Ghost LiDAR scanning, crane loading, hydrostatics, draft measurement, and safety (MOB) systems. The site is an **Astro** project deployed to **Cloudflare Pages**.

## Progress (What's Done)

1. **Full Astro site** with pages: Platform, Solutions/Barge-Drafting, About, Team, Contact.
2. **PlayCanvas simulation** (`public/simulation-pc.js`) — the core deliverable:
   - 3D barge model with six draft measurement stations (FP, FS, MP, MS, AP, AS).
   - **Authorization gate** — scene stays static until user clicks "AUTHORIZE DIGITAL TWIN".
   - **6-phase operational sequence**: SURVEY → BALLAST → CRANE → LOADING → TRIM-CORR → FINAL SURVEY.
   - **Ghost LiDAR scan** with visual beam sweep and sensor hub entities.
   - **Crane** with material stream particles during loading.
   - **Weight-driven hydrostatics** — barge sinks/trims/heels based on actual cargo weight using physics-based displacement math (not animation keyframes).
   - **MOB (Man Overboard)** emergency stop system with countdown and auto-resume.
   - **7 camera presets** (Orbit, Overhead, Side, Fore, Aft, First Person, Station) with keyboard shortcuts (keys 1-7).
   - **First-person walk mode** on the barge deck (WASD + mouse look).
   - **Full telemetry UI**: draft readings, trim, heel, displacement, GM, mean draft, elapsed time.
   - **Phase progress bar**, operations briefing panel, signal ribbon, flow strip, and completion card.
3. **Loading loop fix** — TRIM-CORR phase now triggers on `targetWeight` threshold, not a fixed timer.
4. **Geometric raycast draft calculation** — draft readings computed from actual waterline intersection with hull geometry.

## Lessons Learned

| Problem | Solution |
|---------|----------|
| **Loading phase ran forever** — cargo kept accumulating past target weight | Changed trigger from a fixed `setTimeout` to checking `currentCargo >= targetWeight` each frame to transition to TRIM-CORR phase (`8674d0c`) |
| **Draft readings were cosmetic/fake** | Implemented geometric raycast approach — LiDAR sensor hubs cast rays downward to compute real waterline intersection (`4c27057`) |
| **Barge movement looked canned/animated** | Replaced keyframe animations with weight-driven hydrostatics: displacement = weight / (density × waterplane area), trim/heel from load distribution (`ed9a910`) |
| **PlayCanvas `pc` namespace not available at script parse time** | Wrapped entire module in `whenPlayCanvasReady()` polling callback since the engine loads with `defer` |
| **Camera system conflicts** | Each camera preset stores/restores orbit controller state; first-person mode disables orbit script and uses its own input handler |

## Immediate Next Steps

The simulation logic is functionally complete. Likely next work:

1. **Visual polish** — water shader/material improvements, barge textures, ambient lighting tweaks, skybox.
2. **Mobile responsiveness** — test and fix touch controls, camera toolbar overflow, canvas sizing on small screens.
3. **Performance** — profile on lower-end devices; consider LOD or draw-call reduction if needed.
4. **Aggregate pile visuals** — the cargo currently loads as weight; adding a visible aggregate pile mesh that grows in the hold would sell the demo.
5. **Any bugs or UX issues** the user identifies during review.

Ask the user what they want to focus on — don't assume.

## Relevant Files

| File | Purpose |
|------|---------|
| `public/simulation-pc.js` | **THE main file** — all PlayCanvas 3D scene, simulation logic, cameras, phases, hydrostatics, UI wiring |
| `src/pages/platform.astro` | Platform page HTML — canvas shell, all overlay panels, telemetry grid, buttons, phase bar |
| `public/css/platform.css` | All simulation UI styling — control bar, telemetry, overlays, MOB banners, camera toolbar |
| `public/css/global.css` | Site-wide design tokens, fonts, card/button base styles |
