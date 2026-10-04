/* ==========================================================================
   RIPPLE PROPAGATION & SURFACE WAVES
   Handles generation, radial expansion, and damping of water ripples.
   ========================================================================== */

import { state, ctx } from '../core/state.js';

export function createRipple(x, y, a = 0.5, max) {
  state.ripples.push({
    x,
    y,
    r: 1,
    a,
    max: max || 40 * state.U
  });
}

export function updateRipples(dt) {
  for (let i = state.ripples.length - 1; i >= 0; i--) {
    const r = state.ripples[i];
    r.r += 0.5 * state.U * dt;
    r.a *= Math.pow(0.985, dt);

    if (r.r > r.max || r.a < 0.01) {
      state.ripples.splice(i, 1);
      continue;
    }

    ctx.strokeStyle = 'rgba(225, 255, 245, ' + (r.a * (1 - r.r / r.max)) + ')';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(r.x, r.y, r.r, 0, 6.29);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(r.x, r.y, r.r * 0.68, 0, 6.29);
    ctx.stroke();
  }
}
