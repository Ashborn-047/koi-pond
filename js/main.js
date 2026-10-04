/* ==========================================================================
   MAIN SIMULATION ORCHESTRATOR
   Initializes systems, handles viewport resize, and executes master render loop.
   ========================================================================== */

import { state, cv, ctx } from './core/state.js';
import { R, FL, GR } from './core/config.js';
import { drawWater } from './environment/water.js';
import { createRipple, updateRipples } from './environment/ripples.js';
import { initStones, drawStones } from './environment/stones.js';
import { plink, furinChime, bambooStrike, updateAudioState, playBugSound, rainDropPatter } from './audio/audio.js';
import { Koi } from './entities/koi.js';
import { makeSchools, updateFry, drawFry } from './entities/fry.js';
import { LotusPad } from './entities/lilypad.js';
import { Petal } from './entities/flora.js';
import { updateFood } from './entities/food.js';
import { initFauna, updateAndDrawFauna } from './entities/fauna.js';
import { initControls } from './ui/controls.js';

let nextChimeTime = performance.now() + 12000;
let nextBambooTime = performance.now() + 18000;
let nextBugTime = performance.now() + 3500;

/**
 * Builds the pond entities (stones, anchored lotus pads, edge duckweed, initial petals).
 */
export function build() {
  // 1. Underwater river stones & moss
  initStones();

  // 2. Anchored lotus lily pads with natural dispersion
  state.pads.length = 0;
  const numPads = 11;
  for (let i = 0; i < numPads; i++) {
    const a = (i / numPads) * 6.283 + R(-0.25, 0.25);
    const k = R(0.32, 0.64);
    const ox = state.w / 2 + Math.cos(a) * state.w * k;
    const oy = state.h / 2 + Math.sin(a) * state.h * k;
    const r = R(12, 21) * state.U;
    const rot = R(0, 6.283);
    const fl = (i % 3 === 0) || Math.random() < 0.35;
    state.pads.push(new LotusPad(ox, oy, r, rot, fl));
  }

  // 3. Pre-seed initial tranquil floating petals & leaves on water
  state.petals.length = 0;
  for (let i = 0; i < 9; i++) {
    state.petals.push(new Petal(true));
  }

  // 4. Living fauna (dragonflies & fireflies)
  initFauna();

  // 5. Edge foliage / duckweed around pond perimeter
  state.leaves = [];
  const cap = (state.w * state.h / 200) | 0;
  for (let i = 0; i < 5000 && state.leaves.length < cap; i++) {
    const x = R(0, state.w);
    const y = R(0, state.h);
    const e = Math.min(x, state.w - x, y, state.h - y) / (Math.min(state.w, state.h) * 0.3);
    if (Math.random() < Math.pow(Math.max(0, 1 - e), 2)) {
      state.leaves.push({
        x: x | 0,
        y: y | 0,
        s: Math.random() < 0.3 ? 2 : 1,
        c: Math.random() < 0.06 ? FL[i % 3] : GR[i % GR.length]
      });
    }
  }

  // Ambient radial vignetting
  const rIn = Math.max(1, Math.min(state.w, state.h) * 0.3);
  const rOut = Math.max(rIn + 1, Math.max(state.w, state.h) * 0.7);
  state.vig = ctx.createRadialGradient(
    state.w / 2, state.h / 2, rIn,
    state.w / 2, state.h / 2, rOut
  );
  state.vig.addColorStop(0, 'rgba(6, 50, 40, 0)');
  state.vig.addColorStop(1, 'rgba(6, 50, 40, 0.4)');
}

/**
 * Resizes the simulation canvas and adapts pixel scaling.
 */
export function resize() {
  state.W = window.innerWidth;
  state.H = window.innerHeight;
  state.PX = Math.min(state.W, state.H) < 600 ? 2 : 3;
  state.w = Math.ceil(state.W / state.PX);
  state.h = Math.ceil(state.H / state.PX);

  cv.width = state.w;
  cv.height = state.h;
  state.U = Math.min(state.w, state.h) / 195;

  build();

  for (const f of state.fish) {
    f.x = Math.min(f.x, state.w - 5);
    f.y = Math.min(f.y, state.h - 5);
  }

  if (!state.schools.length) makeSchools();
}

// Global window resize listener
window.addEventListener('resize', resize);

// Bootstrap
resize();

for (let i = 0; i < 7; i++) {
  state.fish.push(new Koi(i));
}

initControls();

/**
 * Master Animation Loop: renders all visual depth layers.
 */
let last = performance.now();

function frame(now) {
  // Zen meditation slow-mo mode (slows time by ~55%)
  const timeScale = state.zenMode ? 0.45 : 1.0;
  const elapsed = (now - last) / 16.67;
  const dt = (isNaN(elapsed) || elapsed <= 0) ? 1.0 : Math.min(2.5, Math.max(0.05, elapsed)) * timeScale;
  last = now;

  try {
    // Track pointer still dwell time for curious koi petting
    if (state.ptr) {
      state.ptrStillTime += dt;
    }

  // Ambient organic soundscape triggers (chimes, bamboo fountain, garden bugs)
  if (now > nextChimeTime) {
    furinChime();
    nextChimeTime = now + R(14000, 26000);
  }
  if (now > nextBambooTime) {
    bambooStrike();
    createRipple(state.w * 0.15, state.h * 0.15, 0.4, 25 * state.U);
    nextBambooTime = now + R(20000, 36000);
  }
  if (now > nextBugTime) {
    playBugSound();
    const bugInterval = (state.timeOfDay === 'night' || state.timeOfDay === 'dusk') ? R(2200, 4800) : R(4200, 8000);
    nextBugTime = now + bugInterval;
  }
  updateAudioState(now);

  // Layer 1: Water background & caustics (Day, Dusk, Night)
  drawWater(now);

  // Layer 2: Deep underwater river stones & moss
  drawStones();

  // Layer 3: Deep underwater pad stems
  for (const p of state.pads) p.drawStem();

  // Layer 4: Koi fish & minnow updates
  for (const f of state.fish) f.update(dt, now);
  updateFry(dt, now);

  // Layer 5: Fish shadows & bodies
  for (const f of state.fish) f.shadow();
  for (const f of state.fish) f.draw();
  drawFry();

  // Layer 6: Lotus pad physics updates
  for (const p of state.pads) p.update(dt, now);

  // Layer 7: Lotus pad shadows on pond bed
  for (const p of state.pads) p.drawShadow();

  // Layer 8: Spawn & update falling/floating leaves and petals
  if (now > state.nextPetalTime && state.petals.length < 38) {
    state.petals.push(new Petal(false));
    const interval = state.raining ? R(600, 1400) : R(1600, 3200);
    state.nextPetalTime = now + interval;
  }
  for (let i = state.petals.length - 1; i >= 0; i--) {
    const pt = state.petals[i];
    pt.update(dt, now);
    if (pt.isDead()) {
      state.petals.splice(i, 1);
    }
  }

  // Layer 9: Floating petals & falling petal shadows (on water surface)
  for (const pt of state.petals) pt.drawShadow();
  for (const pt of state.petals) {
    if (pt.state === 'floating') pt.drawBody();
  }

  // Layer 10: Lotus pads & blooming flowers
  for (const p of state.pads) p.drawBody(now);

  // Layer 11: Falling petals/leaves (in the air above pads)
  for (const pt of state.petals) {
    if (pt.state === 'falling') pt.drawBody();
  }

  // Layer 12: Living Pond Fauna (Dragonflies & Night Fireflies)
  updateAndDrawFauna(dt, now);

  // Layer 13: Food pellets
  updateFood(dt, now);

  // Layer 14: Rain ripples & organic raindrop patter sound
  if (state.raining && Math.random() < 0.4 * dt) {
    createRipple(R(0, state.w), R(0, state.h), 0.5, R(8, 16) * state.U);
    if (Math.random() < 0.35) {
      rainDropPatter();
    } else if (Math.random() < 0.05) {
      plink();
    }
  }

  // Layer 15: Water ripples animation
  updateRipples(dt);

  // Layer 16: Edge duckweed foliage
  for (const l of state.leaves) {
    ctx.fillStyle = l.c;
    ctx.fillRect(l.x, l.y, l.s, l.s);
  }

  // Layer 17: Vignette & Time-of-day atmospheric overlays
  ctx.fillStyle = state.vig;
  ctx.fillRect(0, 0, state.w, state.h);

  if (state.raining) {
    ctx.fillStyle = 'rgba(10, 40, 50, 0.16)';
    ctx.fillRect(0, 0, state.w, state.h);
  }

  if (state.timeOfDay === 'dusk') {
    ctx.fillStyle = 'rgba(65, 35, 110, 0.28)';
    ctx.fillRect(0, 0, state.w, state.h);
  } else if (state.timeOfDay === 'night') {
    ctx.fillStyle = 'rgba(4, 15, 30, 0.42)';
    ctx.fillRect(0, 0, state.w, state.h);
  }
  } catch (err) {
    console.error("Frame loop caught error:", err);
  }

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
