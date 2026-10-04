/* ==========================================================================
   FOOD & FEEDING SYSTEM
   Pellet spawning, gentle drift, and visual rendering.
   ========================================================================== */

import { state, ctx } from '../core/state.js';
import { R } from '../core/config.js';

export function dropFood(x, y) {
  for (let i = 0; i < 4; i++) {
    state.foods.push({
      x: x + R(-5, 5) * state.U,
      y: y + R(-5, 5) * state.U,
      t: 0,
      ph: R(0, 6.28)
    });
  }
}

export function updateFood(dt, now) {
  for (let i = state.foods.length - 1; i >= 0; i--) {
    const f = state.foods[i];
    f.t += dt;
    if (f.t > 1400) {
      state.foods.splice(i, 1);
      continue;
    }
    ctx.globalAlpha = 1 - f.t / 1400;
    ctx.fillStyle = '#f0e2b0';
    ctx.fillRect(
      Math.round(f.x + Math.sin(now * 0.002 + f.ph)),
      Math.round(f.y + Math.cos(now * 0.0017 + f.ph)),
      2, 2
    );
  }
  ctx.globalAlpha = 1;
}
