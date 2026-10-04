/* ==========================================================================
   USER INPUT & CONTROLS
   Pointer events, touch gestures, keyboard shortcuts, and UI control buttons.
   ========================================================================== */

import { state, cv } from '../core/state.js';
import { R } from '../core/config.js';
import { Koi } from '../entities/koi.js';
import { Petal } from '../entities/flora.js';
import { createRipple } from '../environment/ripples.js';
import { dropFood } from '../entities/food.js';
import { plink, toggleSound } from '../audio/audio.js';

const $ = id => document.getElementById(id);

export function setCount(n) {
  n = Math.max(2, Math.min(14, n));
  while (state.fish.length < n) state.fish.push(new Koi(state.fish.length));
  while (state.fish.length > n) state.fish.pop();
  $('cnt').textContent = n;
}

export function scatter() {
  for (const f of state.fish) {
    f.a = R(0, 6.28);
    f.v = 1.8 * state.U;
  }
  for (const sc of state.schools) {
    for (const p of sc.m) {
      const a = R(0, 6.28);
      p.vx = Math.cos(a) * 1.6 * state.U;
      p.vy = Math.sin(a) * 1.6 * state.U;
    }
  }
  createRipple(state.w / 2, state.h / 2, 0.6, 65 * state.U);

  // Extra romantic flurry of falling petals on scatter!
  for (let i = 0; i < 6; i++) {
    const p = new Petal(false);
    p.x = R(state.w * 0.2, state.w * 0.8);
    p.y = R(state.h * 0.1, state.h * 0.5);
    p.z = R(30, 80) * state.U;
    state.petals.push(p);
  }
}

export function toggleUI() {
  const off = document.body.classList.toggle('off');
  $('hideb').classList.toggle('active', off);
}

export function toggleFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    document.documentElement.requestFullscreen();
  }
}

export function toggleZenMode() {
  state.zenMode = !state.zenMode;
  $('zen').classList.toggle('active', state.zenMode);
}

export function takeSnapshot() {
  try {
    const link = document.createElement('a');
    link.download = `koi-pond-${state.timeOfDay}-${Date.now()}.png`;
    link.href = cv.toDataURL('image/png');
    link.click();
  } catch (e) {
    console.error('Snapshot error:', e);
  }
}

export function setTimeOfDay(mode) {
  state.timeOfDay = mode;
  ['day', 'dusk', 'night'].forEach(m => {
    const btn = $(`btn-${m}`);
    if (btn) btn.classList.toggle('active', m === mode);
  });
}

export function initControls() {
  const mapCoord = e => ({
    x: e.clientX * state.w / state.W,
    y: e.clientY * state.h / state.H
  });

  cv.addEventListener('pointerdown', e => {
    const p = mapCoord(e);
    createRipple(p.x, p.y, 0.8);
    plink();
    dropFood(p.x, p.y);
    state.ptr = null;
    state.ptrStillTime = 0;
    $('hint').classList.add('gone');
  });

  let lastR = { x: -99, y: -99 };
  cv.addEventListener('pointermove', e => {
    state.ptr = mapCoord(e);
    state.ptrStillTime = 0;
    if (e.pointerType === 'mouse' && Math.hypot(state.ptr.x - lastR.x, state.ptr.y - lastR.y) > 16 * state.U) {
      lastR = { x: state.ptr.x, y: state.ptr.y };
      createRipple(state.ptr.x, state.ptr.y, 0.25, 18 * state.U);
    }
  });

  cv.addEventListener('pointerleave', () => {
    state.ptr = null;
    state.ptrStillTime = 0;
  });

  cv.addEventListener('pointerup', () => {
    state.ptr = null;
    state.ptrStillTime = 0;
  });

  // Top action buttons
  $('zen').onclick = toggleZenMode;
  $('snap').onclick = takeSnapshot;
  $('hideb').onclick = toggleUI;

  if (!document.documentElement.requestFullscreen) {
    $('full').style.display = 'none';
  }
  $('full').onclick = toggleFullscreen;

  // Bottom dock buttons
  $('scat').onclick = scatter;
  $('minus').onclick = () => setCount(state.fish.length - 1);
  $('plus').onclick = () => setCount(state.fish.length + 1);

  // Segmented Time of Day
  $('btn-day').onclick = () => setTimeOfDay('day');
  $('btn-dusk').onclick = () => setTimeOfDay('dusk');
  $('btn-night').onclick = () => setTimeOfDay('night');

  // Weather & Sound toggles
  $('rain').onclick = () => {
    state.raining = !state.raining;
    $('rain').classList.toggle('on', state.raining);
  };

  $('snd').onclick = () => {
    const isNowOn = toggleSound();
    $('snd').classList.toggle('on', isNowOn);
  };

  // Keyboard shortcuts
  addEventListener('keydown', e => {
    if (e.code === 'Space') {
      e.preventDefault();
      scatter();
    } else if (e.key === 'h' || e.key === 'H') {
      toggleUI();
    } else if (e.key === 'z' || e.key === 'Z') {
      toggleZenMode();
    } else if ((e.key === 'f' || e.key === 'F') && document.documentElement.requestFullscreen) {
      toggleFullscreen();
    }
  });
}
