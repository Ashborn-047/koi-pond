/* ==========================================================================
   MINNOW / FRY SCHOOLS
   Boids flocking, schooling dynamics and evasion behavior.
   ========================================================================== */

import { state, ctx } from '../core/state.js';
import { R } from '../core/config.js';

export function makeSchools() {
  state.schools.length = 0;
  const colors = [
    ['#e8452a', '#ff9a5a'],
    ['#3a7bd5', '#7cc0ff'],
    ['#f2c230', '#ffe58a']
  ];
  for (const c of colors) {
    const sc = { c, ph: R(0, 6.28), m: [] };
    const x = R(0.2, 0.8) * state.w;
    const y = R(0.2, 0.8) * state.h;
    for (let i = 0; i < 13; i++) {
      sc.m.push({
        x: x + R(-8, 8),
        y: y + R(-8, 8),
        vx: R(-0.2, 0.2),
        vy: R(-0.2, 0.2)
      });
    }
    state.schools.push(sc);
  }
}

export function updateFry(dt, t) {
  for (const sc of state.schools) {
    let cx = 0, cy = 0, vx = 0, vy = 0;
    const n = sc.m.length;
    for (const p of sc.m) {
      cx += p.x; cy += p.y;
      vx += p.vx; vy += p.vy;
    }
    cx /= n; cy /= n; vx /= n; vy /= n;

    const tx = state.w / 2 + Math.sin(t * 0.00013 + sc.ph) * state.w * 0.38;
    const ty = state.h / 2 + Math.cos(t * 0.00011 + sc.ph * 1.7) * state.h * 0.38;

    for (const p of sc.m) {
      p.vx += ((cx - p.x) * 0.004 + (vx - p.vx) * 0.05 + (tx - cx) * 0.0006 + R(-0.02, 0.02)) * dt;
      p.vy += ((cy - p.y) * 0.004 + (vy - p.vy) * 0.05 + (ty - cy) * 0.0006 + R(-0.02, 0.02)) * dt;

      if (state.ptr) {
        const dx = p.x - state.ptr.x, dy = p.y - state.ptr.y;
        const d = Math.hypot(dx, dy);
        if (d < 30 * state.U) {
          p.vx += (dx / d) * 0.06 * dt;
          p.vy += (dy / d) * 0.06 * dt;
        }
      }

      const sp = Math.hypot(p.vx, p.vy);
      const mx = 0.5 * state.U;
      if (sp > mx) {
        p.vx *= 0.96;
        p.vy *= 0.96;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
  }
}

export function drawFry() {
  for (const sc of state.schools) {
    for (const p of sc.m) {
      const sp = Math.hypot(p.vx, p.vy) || 1;
      ctx.fillStyle = sc.c[1];
      ctx.fillRect(Math.round(p.x - p.vx / sp * 1.5), Math.round(p.y - p.vy / sp * 1.5), 1, 1);
      ctx.fillStyle = sc.c[0];
      ctx.fillRect(Math.round(p.x), Math.round(p.y), 2, 2);
    }
  }
}
