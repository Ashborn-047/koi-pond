/* ==========================================================================
   WATER & FLUID PHYSICS
   Current vectors, dynamic sky lighting (Day, Dusk, Moonlit Night) & caustics.
   ========================================================================== */

import { state, ctx } from '../core/state.js';

/**
 * Calculates fluid velocity vector at pond coordinates (x, y).
 */
export function getWaterCurrent(x, y, t) {
  const cx = state.w * 0.5;
  const cy = state.h * 0.5;
  const dx = x - cx;
  const dy = y - cy;
  const d = Math.hypot(dx, dy) || 1;

  // Gentle circular gyre around center of pond
  const swirl = 0.045 * state.U;
  const sx = (-dy / d) * swirl;
  const sy = (dx / d) * swirl;

  // Meandering natural fluid stream harmonics
  const a = t * 0.00032;
  const wx = (Math.sin(y * 0.012 + a) + Math.cos(x * 0.008 - a * 0.7)) * 0.05 * state.U;
  const wy = (Math.cos(x * 0.01 + a * 0.8) + Math.sin(y * 0.013 - a * 0.5)) * 0.05 * state.U;

  return { vx: sx + wx, vy: sy + wy };
}

/**
 * Renders the pond water gradient and dynamic animated caustics based on time of day.
 */
export function drawWater(t) {
  const g = ctx.createLinearGradient(0, 0, state.w, state.h);

  if (state.timeOfDay === 'night') {
    // Deep sapphire / midnight moonlit abyss
    g.addColorStop(0, '#0c2238');
    g.addColorStop(0.5, '#081c2b');
    g.addColorStop(1, '#041018');
  } else if (state.timeOfDay === 'dusk') {
    // Warm golden-violet sunset twilight
    g.addColorStop(0, '#4a3b5c');
    g.addColorStop(0.5, '#356358');
    g.addColorStop(1, '#234a3e');
  } else {
    // Fresh sunlit emerald jade
    g.addColorStop(0, '#48cba2');
    g.addColorStop(0.5, '#38b28c');
    g.addColorStop(1, '#2a9a78');
  }

  ctx.fillStyle = g;
  ctx.fillRect(0, 0, state.w, state.h);

  // Moonlight pool reflection in night mode
  if (state.timeOfDay === 'night') {
    const mx = state.w * 0.65;
    const my = state.h * 0.35;
    const rIn = Math.max(0.1, 2 * state.U);
    const rOut = Math.max(rIn + 1, 80 * state.U);
    const moonGlow = ctx.createRadialGradient(mx, my, rIn, mx, my, rOut);
    moonGlow.addColorStop(0, 'rgba(186, 230, 253, 0.22)');
    moonGlow.addColorStop(0.5, 'rgba(125, 211, 252, 0.08)');
    moonGlow.addColorStop(1, 'rgba(125, 211, 252, 0)');
    ctx.fillStyle = moonGlow;
    ctx.fillRect(0, 0, state.w, state.h);
  }

  // Surface light refraction caustic lines
  let causticColor = 'rgba(205, 255, 232, 0.2)';
  if (state.timeOfDay === 'night') {
    causticColor = 'rgba(125, 211, 252, 0.12)';
  } else if (state.timeOfDay === 'dusk') {
    causticColor = 'rgba(254, 215, 170, 0.22)';
  }

  ctx.fillStyle = causticColor;
  const a = t * 0.0004;
  for (let y = 0; y < state.h; y += 2) {
    for (let x = 0; x < state.w; x += 2) {
      const v = Math.sin(x * 0.09 + a) +
                Math.sin(y * 0.11 - a * 0.8) +
                Math.sin((x + y) * 0.06 + a * 0.5) +
                Math.sin((x - y) * 0.05 - a * 0.4);
      if (Math.abs(v) < 0.11) ctx.fillRect(x, y, 2, 1);
    }
  }
}
