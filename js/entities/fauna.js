/* ==========================================================================
   LIVING POND FAUNA: DRAGONFLIES & NIGHT FIREFLIES
   Daytime hovering dragonflies with tail-dipping ripples & night bioluminescent fireflies.
   ========================================================================== */

import { state, ctx } from '../core/state.js';
import { R } from '../core/config.js';
import { createRipple } from '../environment/ripples.js';

export class Dragonfly {
  constructor() {
    this.x = R(0, state.w);
    this.y = R(0, state.h);
    this.tx = R(state.w * 0.1, state.w * 0.9);
    this.ty = R(state.h * 0.1, state.h * 0.9);
    this.vx = 0;
    this.vy = 0;
    this.a = R(0, 6.28);
    this.size = R(2.8, 3.8) * state.U;
    this.height = R(25, 60) * state.U; // Height above water
    this.wingBeat = R(0, 6.28);
    this.hoverTimer = R(60, 180);
    this.dipTimer = R(300, 700); // Time until water touchdown
    this.color = Math.random() < 0.5 ? '#06b6d4' : '#ef4444'; // Azure or scarlet darter
  }

  update(dt, t) {
    this.wingBeat += 0.8 * dt;

    // Hover or dart toward target
    this.hoverTimer -= dt;
    if (this.hoverTimer <= 0) {
      if (state.pads.length && Math.random() < 0.6) {
        const targetPad = state.pads[(Math.random() * state.pads.length) | 0];
        this.tx = targetPad.x + R(-15, 15) * state.U;
        this.ty = targetPad.y + R(-15, 15) * state.U;
      } else {
        this.tx = R(state.w * 0.1, state.w * 0.9);
        this.ty = R(state.h * 0.1, state.h * 0.9);
      }
      this.hoverTimer = R(90, 240);
    }

    // Occasional tail dip into water
    this.dipTimer -= dt;
    if (this.dipTimer <= 0 && this.dipTimer > -30) {
      this.height = Math.max(2 * state.U, this.height - 1.5 * state.U * dt);
      if (this.height <= 3 * state.U) {
        createRipple(this.x, this.y, 0.2, 8 * state.U);
      }
    } else if (this.dipTimer <= -30) {
      this.height = R(30, 55) * state.U;
      this.dipTimer = R(400, 900);
    }

    // Darting steering dynamics
    const dx = this.tx - this.x;
    const dy = this.ty - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 10 * state.U) {
      const wantAngle = Math.atan2(dy, dx);
      this.a += (wantAngle - this.a) * 0.12 * dt;
      const speed = 0.8 * state.U;
      this.vx += (Math.cos(this.a) * speed - this.vx) * 0.08 * dt;
      this.vy += (Math.sin(this.a) * speed - this.vy) * 0.08 * dt;
    } else {
      this.vx += (Math.sin(t * 0.01) * 0.2 * state.U - this.vx) * 0.1 * dt;
      this.vy += (Math.cos(t * 0.012) * 0.2 * state.U - this.vy) * 0.1 * dt;
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }

  drawShadow() {
    const shRatio = this.height / (40 * state.U);
    const sx = this.x + 3 * state.U + shRatio * 4 * state.U;
    const sy = this.y + 4 * state.U + shRatio * 6 * state.U;
    const shAlpha = Math.max(0.08, 0.25 / (1 + shRatio * 0.8));

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(this.a);
    ctx.fillStyle = `rgba(0, 40, 30, ${shAlpha})`;
    ctx.beginPath();
    ctx.ellipse(0, 0, this.size * 0.8, this.size * 0.25, 0, 0, 6.283);
    ctx.fill();
    ctx.restore();
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.a);

    const s = this.size;
    const wingFlap = Math.sin(this.wingBeat) * 0.55;

    // Double gossamer wings
    ctx.fillStyle = 'rgba(235, 255, 255, 0.55)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 0.5;

    for (const dir of [-1, 1]) {
      // Forewing
      ctx.save();
      ctx.translate(-s * 0.2, 0);
      ctx.rotate(dir * (1.1 + wingFlap));
      ctx.beginPath();
      ctx.ellipse(0, dir * s * 1.1, s * 0.28, s * 1.2, 0, 0, 6.283);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Hindwing
      ctx.save();
      ctx.translate(s * 0.1, 0);
      ctx.rotate(dir * (1.3 + wingFlap * 0.9));
      ctx.beginPath();
      ctx.ellipse(0, dir * s * 0.9, s * 0.24, s * 0.95, 0, 0, 6.283);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Slender segmented needle abdomen
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(s * 0.8, 0);
    ctx.lineTo(-s * 1.4, -s * 0.12);
    ctx.lineTo(-s * 1.5, 0);
    ctx.lineTo(-s * 1.4, s * 0.12);
    ctx.closePath();
    ctx.fill();

    // Thorax & eyes
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(s * 0.3, 0, s * 0.25, 0, 6.283);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(s * 0.5, -s * 0.18, s * 0.22, s * 0.36);

    ctx.restore();
  }
}

export class Firefly {
  constructor() {
    this.x = R(0, state.w);
    this.y = R(0, state.h);
    this.vx = R(-0.15, 0.15) * state.U;
    this.vy = R(-0.15, 0.15) * state.U;
    this.ph = R(0, 6.28);
    this.pulseSpeed = R(0.002, 0.004);
    this.glow = 0;
  }

  update(dt, t) {
    this.ph += this.pulseSpeed * dt * 16.67;
    this.glow = Math.max(0, Math.sin(this.ph));

    this.vx += (Math.sin(t * 0.001 + this.ph) * 0.08 * state.U - this.vx) * 0.05 * dt;
    this.vy += (Math.cos(t * 0.0009 + this.ph) * 0.08 * state.U - this.vy) * 0.05 * dt;

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    if (this.x < -10) this.x = state.w + 10;
    if (this.x > state.w + 10) this.x = -10;
    if (this.y < -10) this.y = state.h + 10;
    if (this.y > state.h + 10) this.y = -10;
  }

  draw() {
    const g = this.glow;
    if (g < 0.05) return;

    // 1. Water surface glowing reflection
    const refR = Math.max(0.1, 6 * state.U * g);
    ctx.fillStyle = `rgba(163, 230, 53, ${0.15 * g})`;
    ctx.beginPath();
    ctx.arc(this.x + 2 * state.U, this.y + 4 * state.U, refR, 0, 6.283);
    ctx.fill();

    // 2. Bioluminescent soft radial glow halo
    const haloR = Math.max(1, 10 * state.U);
    const rad = ctx.createRadialGradient(this.x, this.y, 0.5, this.x, this.y, haloR);
    rad.addColorStop(0, `rgba(254, 240, 138, ${0.9 * g})`);
    rad.addColorStop(0.35, `rgba(163, 230, 53, ${0.45 * g})`);
    rad.addColorStop(1, 'rgba(163, 230, 53, 0)');

    ctx.fillStyle = rad;
    ctx.beginPath();
    ctx.arc(this.x, this.y, haloR, 0, 6.283);
    ctx.fill();

    // 3. Bright core bead
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, 1.2 * state.U, 0, 6.283);
    ctx.fill();
  }
}

export function initFauna() {
  state.dragonflies = [new Dragonfly(), new Dragonfly()];
  state.fireflies = [];
  for (let i = 0; i < 18; i++) {
    state.fireflies.push(new Firefly());
  }
}

export function updateAndDrawFauna(dt, now) {
  if (state.timeOfDay !== 'night') {
    for (const df of state.dragonflies) {
      df.update(dt, now);
      df.drawShadow();
      df.draw();
    }
  }

  if (state.timeOfDay === 'night' || state.timeOfDay === 'dusk') {
    for (const ff of state.fireflies) {
      ff.update(dt, now);
      ff.draw();
    }
  }
}
