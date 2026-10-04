/* ==========================================================================
   UNDERWATER DEPTH: RIVER STONES, PEBBLES & MOSS
   Pond floor sediment, smooth river cobbles, and moss patches.
   ========================================================================== */

import { state, ctx } from '../core/state.js';
import { R } from '../core/config.js';

export class RiverStone {
  constructor(x, y, rx, ry, rot) {
    this.x = x;
    this.y = y;
    this.rx = rx;
    this.ry = ry;
    this.rot = rot;
    // Natural stone shade variations (granite, basalt, slate, river sand)
    const pals = [
      { base: '#1e293b', mid: '#334155', hi: '#475569', moss: '#14532d' },
      { base: '#1c1917', mid: '#292524', hi: '#44403c', moss: '#15803d' },
      { base: '#172554', mid: '#1e3a5f', hi: '#2e5b88', moss: '#166534' }
    ];
    this.pal = pals[(Math.random() * pals.length) | 0];
    this.hasMoss = Math.random() < 0.45;
  }

  draw() {
    const rx = Math.max(1, this.rx);
    const ry = Math.max(1, this.ry);
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);

    // 1. Deep sediment embed shadow
    ctx.fillStyle = 'rgba(0, 30, 20, 0.4)';
    ctx.beginPath();
    ctx.ellipse(1.5 * state.U, 2.5 * state.U, rx * 1.05, ry * 1.05, 0, 0, 6.283);
    ctx.fill();

    // 2. Main smooth stone body with 3D bevel lighting
    const grad = ctx.createLinearGradient(-rx, -ry, rx, ry);
    grad.addColorStop(0, this.pal.hi);
    grad.addColorStop(0.4, this.pal.mid);
    grad.addColorStop(1, this.pal.base);

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, 6.283);
    ctx.fill();

    // 3. Velvet moss patch on top edge
    if (this.hasMoss) {
      ctx.fillStyle = `rgba(22, 101, 52, 0.65)`;
      ctx.beginPath();
      ctx.ellipse(-rx * 0.25, -ry * 0.25, Math.max(0.5, rx * 0.45), Math.max(0.5, ry * 0.35), 0.3, 0, 6.283);
      ctx.fill();
    }

    ctx.restore();
  }
}

export function initStones() {
  state.stones = [];
  const numStones = 16;
  for (let i = 0; i < numStones; i++) {
    // Distribute around pond bottom with organic clusters
    const a = R(0, 6.283);
    const dist = R(0.2, 0.85) * Math.min(state.w, state.h) * 0.5;
    const x = state.w * 0.5 + Math.cos(a) * dist;
    const y = state.h * 0.5 + Math.sin(a) * dist;
    const rx = R(6, 14) * state.U;
    const ry = rx * R(0.6, 0.85);
    const rot = R(0, 6.283);
    state.stones.push(new RiverStone(x, y, rx, ry, rot));
  }
}

export function drawStones() {
  for (const st of state.stones) {
    st.draw();
  }
}
