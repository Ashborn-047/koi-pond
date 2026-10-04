/* ==========================================================================
   FALLING & FLOATING FLORA
   Falling cherry/lotus petals & leaves with 3D wind flutter and water drift.
   ========================================================================== */

import { state, ctx } from '../core/state.js';
import { R } from '../core/config.js';
import { getWaterCurrent } from '../environment/water.js';
import { createRipple } from '../environment/ripples.js';
import { plink } from '../audio/audio.js';

export class Petal {
  constructor(isSpawnOnWater = false) {
    this.type = Math.random() < 0.65 ? 'petal' : 'leaf';
    this.size = (this.type === 'petal' ? R(2.4, 4.2) : R(3.0, 5.5)) * state.U;
    this.x = R(0, state.w);
    this.y = isSpawnOnWater ? R(0, state.h) : R(-40, state.h * 0.4);
    this.state = isSpawnOnWater ? 'floating' : 'falling';
    this.z = isSpawnOnWater ? 0 : R(60, 130) * state.U;
    this.vz = R(0.3, 0.6) * state.U;
    this.vx = 0;
    this.vy = 0;
    this.rot = R(0, 6.283);
    this.vrot = R(-0.02, 0.02);
    this.pitch = R(0, 6.283); // 3D tumbling angle
    this.vpitch = R(0.025, 0.055);
    this.swayPh = R(0, 6.283);
    this.swaySpeed = R(0.002, 0.004);
    this.age = 0;
    this.maxAge = R(22, 38); // Seconds on water before sinking
    this.opacity = 1;

    // Palettes
    if (this.type === 'petal') {
      const pals = [
        { c1: '#fff0f3', c2: '#fda4af', c3: '#fb7185' },
        { c1: '#ffe4e6', c2: '#f472b6', c3: '#e11d48' },
        { c1: '#ffffff', c2: '#fbcfe8', c3: '#f43f5e' }
      ];
      this.pal = pals[(Math.random() * pals.length) | 0];
    } else {
      const pals = [
        { c1: '#84cc16', c2: '#65a30d', c3: '#3f6212' },
        { c1: '#a3e635', c2: '#4ade80', c3: '#15803d' },
        { c1: '#f59e0b', c2: '#d97706', c3: '#92400e' }
      ];
      this.pal = pals[(Math.random() * pals.length) | 0];
    }
  }

  update(dt, t) {
    if (this.state === 'falling') {
      // Wind & air flutter
      const windBase = state.raining ? 0.35 : 0.18;
      const wx = (windBase + Math.sin(t * 0.0003) * 0.1) * state.U;
      const wy = (windBase * 0.8 + Math.cos(t * 0.00025) * 0.08) * state.U;

      this.swayPh += this.swaySpeed * dt * 16.67;
      const sway = Math.sin(this.swayPh) * 0.35 * state.U;

      this.x += (wx + sway) * dt;
      this.y += (wy + Math.abs(sway) * 0.2) * dt;
      this.z -= this.vz * dt;

      this.rot += this.vrot * dt;
      this.pitch += this.vpitch * dt;

      // Touchdown on water surface
      if (this.z <= 0) {
        this.z = 0;
        this.state = 'floating';
        this.pitch = 0;
        createRipple(this.x, this.y, 0.22, 9 * state.U);
        if (Math.random() < 0.25) plink();
      }
    } else {
      // Floating on water surface: carried by water current
      this.age += dt * 0.01667;
      const cur = getWaterCurrent(this.x, this.y, t);

      let fx = (cur.vx - this.vx) * 0.06;
      let fy = (cur.vy - this.vy) * 0.06;

      // Pushed by passing koi fish
      for (const f of state.fish) {
        const dx = this.x - f.x, dy = this.y - f.y;
        const d = Math.hypot(dx, dy);
        const reach = f.s * 1.5;
        if (d < reach && d > 0.1) {
          const push = (1 - d / reach) * (f.v / state.U) * 0.16 * state.U;
          fx += (Math.cos(f.a) * 0.6 + (dx / d) * 0.4) * push;
          fy += (Math.sin(f.a) * 0.6 + (dy / d) * 0.4) * push;
        }
      }

      // Pushed by water ripples
      for (const r of state.ripples) {
        const rdx = this.x - r.x, rdy = this.y - r.y;
        const rd = Math.hypot(rdx, rdy);
        const diff = Math.abs(rd - r.r);
        if (diff < 12 * state.U && rd > 0.1) {
          const factor = (1 - diff / (12 * state.U)) * r.a;
          fx += (rdx / rd) * factor * 0.08 * state.U;
          fy += (rdy / rd) * factor * 0.08 * state.U;
        }
      }

      // Pushed by mouse pointer
      if (state.ptr) {
        const pdx = this.x - state.ptr.x, pdy = this.y - state.ptr.y;
        const pd = Math.hypot(pdx, pdy);
        if (pd < 25 * state.U && pd > 0.1) {
          const ppush = (1 - pd / (25 * state.U)) * 0.2 * state.U;
          fx += (pdx / pd) * ppush;
          fy += (pdy / pd) * ppush;
        }
      }

      this.vx = (this.vx + fx * dt) * Math.pow(0.96, dt);
      this.vy = (this.vy + fy * dt) * Math.pow(0.96, dt);
      this.x += this.vx * dt;
      this.y += this.vy * dt;

      // Water vorticity spins floating petals gently
      this.rot += (this.vrot * 0.4 + (cur.vx * 0.002 - cur.vy * 0.002)) * dt;

      // Gentle fading/sinking when reaching end of lifespan
      if (this.age > this.maxAge - 4) {
        this.opacity = Math.max(0, (this.maxAge - this.age) / 4);
      }
    }
  }

  isDead() {
    return this.opacity <= 0 || this.x < -30 || this.x > state.w + 30 || this.y > state.h + 40;
  }

  drawShadow() {
    if (this.opacity <= 0) return;
    ctx.save();
    if (this.state === 'falling') {
      // Aerial shadow casts on water surface
      const heightRatio = Math.max(0, this.z / (50 * state.U));
      const sx = this.x + 2.5 * state.U + heightRatio * 8 * state.U;
      const sy = this.y + 3.5 * state.U + heightRatio * 10 * state.U;
      const shScale = this.size * (1 + heightRatio * 0.5);
      const shAlpha = Math.max(0.04, 0.22 / (1 + heightRatio * 0.9));
      ctx.translate(sx, sy);
      ctx.rotate(this.rot);
      ctx.scale(Math.cos(this.pitch), 1);
      ctx.fillStyle = 'rgba(0, 40, 30, ' + shAlpha + ')';
      ctx.beginPath();
      ctx.ellipse(0, 0, shScale * 0.9, shScale * 0.45, 0, 0, 6.283);
      ctx.fill();
    } else {
      // Floating petal surface shadow
      ctx.translate(this.x + 1.2 * state.U, this.y + 1.8 * state.U);
      ctx.rotate(this.rot);
      ctx.fillStyle = 'rgba(0, 45, 35, ' + (0.2 * this.opacity) + ')';
      ctx.beginPath();
      ctx.ellipse(0, 0, this.size * 0.85, this.size * 0.42, 0, 0, 6.283);
      ctx.fill();
    }
    ctx.restore();
  }

  drawBody() {
    if (this.opacity <= 0) return;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);

    // 3D tumbling flutter in air
    const flip = this.state === 'falling' ? Math.cos(this.pitch) : 1;
    ctx.scale(flip, 1);
    ctx.globalAlpha = this.opacity;

    const sz = this.size;
    if (this.type === 'petal') {
      // Delicate curved cherry blossom / lotus petal
      const pGrad = ctx.createLinearGradient(-sz * 0.8, 0, sz * 0.8, 0);
      pGrad.addColorStop(0, this.pal.c1);
      pGrad.addColorStop(0.55, this.pal.c2);
      pGrad.addColorStop(1, this.pal.c3);
      ctx.fillStyle = pGrad;

      ctx.beginPath();
      ctx.moveTo(-sz * 0.7, 0);
      ctx.bezierCurveTo(-sz * 0.2, -sz * 0.55, sz * 0.5, -sz * 0.5, sz * 0.8, 0);
      ctx.bezierCurveTo(sz * 0.5, sz * 0.5, -sz * 0.2, sz * 0.55, -sz * 0.7, 0);
      ctx.fill();

      // Subtle petal vein highlight
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(-sz * 0.5, 0);
      ctx.lineTo(sz * 0.4, 0);
      ctx.stroke();
    } else {
      // Organic curved leaf
      const lGrad = ctx.createLinearGradient(-sz, 0, sz, 0);
      lGrad.addColorStop(0, this.pal.c1);
      lGrad.addColorStop(0.6, this.pal.c2);
      lGrad.addColorStop(1, this.pal.c3);
      ctx.fillStyle = lGrad;

      ctx.beginPath();
      ctx.moveTo(-sz * 0.85, 0);
      ctx.quadraticCurveTo(-sz * 0.1, -sz * 0.48, sz * 0.85, 0);
      ctx.quadraticCurveTo(-sz * 0.1, sz * 0.48, -sz * 0.85, 0);
      ctx.fill();

      // Leaf center vein
      ctx.strokeStyle = this.pal.c3;
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(-sz * 0.75, 0);
      ctx.lineTo(sz * 0.7, 0);
      ctx.stroke();
    }
    ctx.restore();
  }
}
