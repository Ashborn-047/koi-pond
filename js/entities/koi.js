/* ==========================================================================
   KOI FISH MECHANICS & AI
   Boids flocking, steering inertia, curious petting AI, Tancho & Ginrin scales.
   ========================================================================== */

import { state, ctx } from '../core/state.js';
import { R, norm, N, PROFILE, PALS } from '../core/config.js';
import { createRipple } from '../environment/ripples.js';
import { plink } from '../audio/audio.js';

export class Koi {
  constructor(i) {
    this.pal = PALS[i % PALS.length];
    // Size variation: occasional majestic elder koi
    const isElder = i === 0;
    this.s = (isElder ? R(6.8, 8.2) : R(4.4, 6.0)) * state.U;
    this.x = R(0, state.w);
    this.y = R(0, state.h);
    this.a = R(0, 6.28);            // Heading angle
    this.v = (isElder ? 0.24 : 0.32) * state.U;
    this.ph = R(0, 6.28);           // Fin beat phase
    this.seed = R(0, 100);
    this.turn = 0;                  // Steering momentum
    this.isCurious = Math.random() < 0.45; // Friendly personality
    this.seg = [];                  // Skeletal vertebrae

    for (let k = 0; k < N; k++) {
      this.seg.push({
        x: this.x - Math.cos(this.a) * k * this.s * 0.55,
        y: this.y - Math.sin(this.a) * k * this.s * 0.55
      });
    }

    // Colored patches on scales
    this.patches = [];
    if (!this.pal.isTancho) {
      const n = 3 + (R(0, 3) | 0);
      for (let k = 0; k < n; k++) {
        this.patches.push({
          i: R(1, 11),
          r: R(0.6, 1.3),
          c: this.pal.p[k % this.pal.p.length]
        });
      }
    }
  }

  update(dt, t) {
    let want = this.a;
    let sp = (0.3 + Math.sin(this.seed) * 0.05) * state.U;
    let food = null;
    let fd = 1e9;
    let free = true;

    // 1. Food foraging
    for (const f of state.foods) {
      const d = Math.hypot(f.x - this.x, f.y - this.y);
      if (d < fd) { fd = d; food = f; }
    }
    if (food && fd < 150 * state.U) {
      free = false;
      want = Math.atan2(food.y - this.y, food.x - this.x);
      sp = 0.7 * state.U;
      if (fd < this.s * 0.8) {
        state.foods.splice(state.foods.indexOf(food), 1);
        createRipple(food.x, food.y, 0.6, 7 * state.U);
        plink();
      }
    }

    // 2. Pond margin avoidance
    const m = 45 * state.U;
    if (this.x < m || this.x > state.w - m || this.y < m || this.y > state.h - m) {
      free = false;
      want = Math.atan2(state.h / 2 - this.y, state.w / 2 - this.x);
    }

    // 3. Curious Koi Petting vs. Pointer Flight Evasion
    if (state.ptr) {
      const d = Math.hypot(state.ptr.x - this.x, state.ptr.y - this.y);

      // If pointer is held still: friendly koi are curious and approach to be petted!
      if (state.ptrStillTime > 25 && this.isCurious && d < 70 * state.U) {
        free = false;
        // Circle gently around finger
        const angleToPtr = Math.atan2(state.ptr.y - this.y, state.ptr.x - this.x);
        want = angleToPtr + 0.65; // Orbit offset
        sp = 0.26 * state.U; // Slow tranquil glide
        if (d < this.s * 0.9 && Math.random() < 0.05 * dt) {
          createRipple(this.x, this.y, 0.15, 6 * state.U);
        }
      } else if (d < 38 * state.U) {
        // Fast pointer motion: flee
        free = false;
        want = Math.atan2(this.y - state.ptr.y, this.x - state.ptr.x);
        sp = 0.9 * state.U;
      }
    }

    // 4. Koi flocking separation
    for (const o of state.fish) {
      if (o === this) continue;
      if (Math.hypot(o.x - this.x, o.y - this.y) < this.s * 3) {
        want += norm(Math.atan2(this.y - o.y, this.x - o.x) - want) * 0.35;
      }
    }

    // 5. Smooth hydrodynamic steering
    const maxT = this.v / (this.s * 3);
    if (free) {
      this.turn = (this.turn + R(-1, 1) * 0.002 * dt) * Math.pow(0.985, dt);
      this.turn = Math.max(-maxT * 0.6, Math.min(maxT * 0.6, this.turn));
      this.a += this.turn * dt;
    } else {
      this.a += Math.max(-maxT, Math.min(maxT, norm(want - this.a))) * dt;
      this.turn *= 0.9;
    }

    // Forward motion integration
    this.v += (sp - this.v) * 0.03 * dt;
    this.x += Math.cos(this.a) * this.v * dt;
    this.y += Math.sin(this.a) * this.v * dt;
    this.ph += (this.v / state.U * 0.22 + 0.035) * dt;

    // Inverse kinematics for spinal vertebrae
    this.seg[0].x = this.x;
    this.seg[0].y = this.y;
    const d = this.s * 0.55;
    for (let k = 1; k < N; k++) {
      const p = this.seg[k - 1];
      const q = this.seg[k];
      const g = Math.atan2(q.y - p.y, q.x - p.x);
      q.x = p.x + Math.cos(g) * d;
      q.y = p.y + Math.sin(g) * d;
    }
  }

  pts() {
    const o = [];
    const amp = this.s * 0.13 * Math.min(1.8, 0.5 + this.v / state.U * 1.2);
    for (let k = 0; k < N; k++) {
      const a = this.seg[Math.max(0, k - 1)];
      const b = this.seg[Math.min(N - 1, k + 1)];
      let nx = -(b.y - a.y);
      let ny = b.x - a.x;
      const l = Math.hypot(nx, ny) || 1;
      nx /= l;
      ny /= l;
      const off = Math.sin(this.ph - k * 0.55) * amp * Math.pow(k / N, 1.3) * 1.6;
      o.push({
        x: this.seg[k].x + nx * off,
        y: this.seg[k].y + ny * off,
        nx,
        ny,
        w: PROFILE[k] * this.s * 0.5
      });
    }
    return o;
  }

  path(P, dx = 0, dy = 0) {
    ctx.beginPath();
    ctx.moveTo(this.x + Math.cos(this.a) * P[0].w * 1.1 + dx, this.y + Math.sin(this.a) * P[0].w * 1.1 + dy);
    for (let k = 0; k < N; k++) ctx.lineTo(P[k].x + P[k].nx * P[k].w + dx, P[k].y + P[k].ny * P[k].w + dy);
    for (let k = N - 1; k >= 0; k--) ctx.lineTo(P[k].x - P[k].nx * P[k].w + dx, P[k].y - P[k].ny * P[k].w + dy);
    ctx.closePath();
  }

  shadow() {
    this._P = this.pts();
    ctx.fillStyle = 'rgba(0, 45, 35, 0.28)';
    this.path(this._P, 2.5 * state.U, 3.5 * state.U);
    ctx.fill();
  }

  draw() {
    const P = this._P;
    const s = this.s;
    const T = P[N - 1];
    const T2 = P[N - 3];
    let tx = T.x - T2.x;
    let ty = T.y - T2.y;
    const tl = Math.hypot(tx, ty) || 1;
    tx /= tl;
    ty /= tl;

    // Caudal fin
    const nx = -ty;
    const ny = tx;
    const sw = Math.sin(this.ph - N * 0.55) * s * 0.45;
    const len = s * 1.5;
    const wd = s * 0.5;
    const Ex = T.x + tx * len;
    const Ey = T.y + ty * len;

    ctx.fillStyle = this.pal.b;
    ctx.globalAlpha = 0.65;
    ctx.beginPath();
    ctx.moveTo(T.x, T.y);
    ctx.quadraticCurveTo(T.x + tx * len * 0.6 + nx * wd, T.y + ty * len * 0.6 + ny * wd, Ex + nx * (wd + sw), Ey + ny * (wd + sw));
    ctx.quadraticCurveTo(Ex - tx * len * 0.2 + nx * sw, Ey - ty * len * 0.2 + ny * sw, Ex - nx * (wd - sw), Ey - ny * (wd - sw));
    ctx.quadraticCurveTo(T.x + tx * len * 0.6 - nx * wd, T.y + ty * len * 0.6 - ny * wd, T.x, T.y);
    ctx.fill();

    // Pectoral fins
    const flap = Math.sin(this.ph * 0.8) * 0.25;
    for (const sd of [-1, 1]) {
      const q = P[3];
      ctx.save();
      ctx.translate(q.x + q.nx * q.w * sd, q.y + q.ny * q.w * sd);
      ctx.rotate(this.a + sd * (1.1 + flap));
      ctx.beginPath();
      ctx.ellipse(-s * 0.25, 0, s * 0.4, s * 0.13, 0, 0, 6.29);
      ctx.fill();
      ctx.restore();
    }

    // Main fish body
    ctx.globalAlpha = 1;
    ctx.fillStyle = this.pal.b;
    this.path(P);
    ctx.fill();

    // Night moonlight rim highlight
    if (state.timeOfDay === 'night') {
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.35)';
      ctx.lineWidth = 1;
      this.path(P);
      ctx.stroke();
    }

    // Pattern patches
    ctx.save();
    this.path(P);
    ctx.clip();

    if (this.pal.isTancho) {
      // Tancho: Bold perfect crimson sun disc on forehead
      const head = P[1];
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(head.x, head.y, s * 0.28, 0, 6.283);
      ctx.fill();
    } else {
      // Standard scale patches
      for (const p of this.patches) {
        const i = p.i | 0;
        const f = p.i - i;
        const a = P[i];
        const b = P[i + 1];
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.ellipse(a.x + (b.x - a.x) * f, a.y + (b.y - a.y) * f, s * 0.38 * p.r, s * 0.3 * p.r, this.a, 0, 6.29);
        ctx.fill();
      }
    }

    // Kinginrin metallic diamond scale sparkles
    if (this.pal.isGinrin) {
      const sparklePh = (this.ph * 2) % 6.283;
      if (Math.sin(sparklePh) > 0.3) {
        const spkPt = P[5];
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.beginPath();
        ctx.arc(spkPt.x + spkPt.nx * 2, spkPt.y + spkPt.ny * 2, 1.2 * state.U, 0, 6.283);
        ctx.fill();
      }
    }

    ctx.restore();
  }
}
