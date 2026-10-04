/* ==========================================================================
   LOTUS LEAF (LILY PAD) PHYSICS
   Stem elasticity, fluid current coupling, fish wakes, buoyancy & flower petals.
   ========================================================================== */

import { state, ctx } from '../core/state.js';
import { R } from '../core/config.js';
import { getWaterCurrent } from '../environment/water.js';

export class LotusPad {
  constructor(ox, oy, r, rot, fl) {
    this.ox = ox; // Pond floor anchor coordinates
    this.oy = oy;
    this.x = ox;  // Floating surface coordinates
    this.y = oy;
    this.vx = 0;
    this.vy = 0;
    this.r = r;
    this.rot = rot;
    this.vrot = 0;
    this.notch = R(0.2, 0.45); // Natural slit angle
    this.fl = fl;              // True if holding a blooming flower
    this.ph = R(0, 6.28);
    this.bob = 0;              // Vertical buoyancy wave displacement
    this.vbob = 0;
    this.tiltX = 0;            // Fluid surface tilt
    this.tiltY = 0;

    // Hydrophobic dew beads on the leaf surface
    this.beads = [];
    const numBeads = Math.random() < 0.65 ? (1 + (Math.random() * 3 | 0)) : 0;
    for (let k = 0; k < numBeads; k++) {
      const br = R(this.r * 0.2, this.r * 0.7);
      const ba = R(0, 6.28);
      this.beads.push({ r: br, a: ba, s: R(0.8, 1.8) * state.U });
    }
  }

  update(dt, t) {
    // 1. Water flow force at current position
    const cur = getWaterCurrent(this.x, this.y, t);

    // 2. Flexible stem restoring spring force
    const kStem = 0.0028;
    let fx = (this.ox - this.x) * kStem;
    let fy = (this.oy - this.y) * kStem;

    // 3. Koi fish wakes: push pad and induce buoyant bobbing
    for (const f of state.fish) {
      const dx = this.x - f.x, dy = this.y - f.y;
      const d = Math.hypot(dx, dy);
      const reach = this.r + f.s * 1.35;
      if (d < reach && d > 0.1) {
        const factor = 1 - d / reach;
        const push = factor * (f.v / state.U) * 0.14 * state.U;
        fx += (Math.cos(f.a) * 0.7 + (dx / d) * 0.3) * push;
        fy += (Math.sin(f.a) * 0.7 + (dy / d) * 0.3) * push;
        this.vbob += factor * 0.12 * state.U;
      }
    }

    // 4. Water ripples: push outward and bob vertically
    for (const r of state.ripples) {
      const rdx = this.x - r.x, rdy = this.y - r.y;
      const rd = Math.hypot(rdx, rdy);
      const diff = Math.abs(rd - r.r);
      if (diff < 15 * state.U && rd > 0.1) {
        const factor = (1 - diff / (15 * state.U)) * r.a;
        fx += (rdx / rd) * factor * 0.09 * state.U;
        fy += (rdy / rd) * factor * 0.09 * state.U;
        this.vbob += Math.sin((rd - r.r) * 0.45) * factor * 0.16 * state.U;
      }
    }

    // 5. User pointer push (safe state.ptr access)
    if (state.ptr) {
      const pdx = this.x - state.ptr.x, pdy = this.y - state.ptr.y;
      const pd = Math.hypot(pdx, pdy);
      const pReach = this.r + 22 * state.U;
      if (pd < pReach && pd > 0.1) {
        const ppush = (1 - pd / pReach) * 0.22 * state.U;
        fx += (pdx / pd) * ppush;
        fy += (pdy / pd) * ppush;
        this.vbob += (1 - pd / pReach) * 0.08 * state.U;
      }
    }

    // 6. Gentle collision separation between adjacent lily pads
    for (const o of state.pads) {
      if (o === this) continue;
      const odx = this.x - o.x, ody = this.y - o.y;
      const od = Math.hypot(odx, ody) || 1;
      const minDist = (this.r + o.r) * 0.94;
      if (od < minDist) {
        const rep = (minDist - od) * 0.026;
        fx += (odx / od) * rep;
        fy += (ody / od) * rep;
      }
    }

    // 7. Water drag and integration
    const drag = 0.075;
    this.vx = (this.vx + (fx + (cur.vx - this.vx) * drag) * dt) * Math.pow(0.965, dt);
    this.vy = (this.vy + (fy + (cur.vy - this.vy) * drag) * dt) * Math.pow(0.965, dt);
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Max tether distance constraint
    const maxTether = this.r * 1.35;
    const curTether = Math.hypot(this.x - this.ox, this.y - this.oy);
    if (curTether > maxTether) {
      const sc = maxTether / curTether;
      this.x = this.ox + (this.x - this.ox) * sc;
      this.y = this.oy + (this.y - this.oy) * sc;
    }

    // 8. Angular rotation torque from flow shear & motion
    const flowTorque = (cur.vx * Math.sin(this.rot) - cur.vy * Math.cos(this.rot)) * 0.0035;
    const moveTorque = (this.vx * Math.sin(this.rot) - this.vy * Math.cos(this.rot)) * 0.0045;
    this.vrot = (this.vrot + (flowTorque + moveTorque) * dt) * Math.pow(0.94, dt);
    this.rot += this.vrot * dt + Math.sin(t * 0.0006 + this.ph) * 0.00025 * dt;

    // 9. Buoyant vertical bobbing (spring-damper)
    this.vbob = (this.vbob - this.bob * 0.038 * dt) * Math.pow(0.92, dt);
    this.bob += this.vbob * dt;

    // 10. Surface tilt from velocity and wave crests
    this.tiltX += (this.vx / (1.6 * state.U) - this.tiltX) * 0.1 * dt;
    this.tiltY += (this.vy / (1.6 * state.U) - this.tiltY) * 0.1 * dt;
  }

  drawStem() {
    ctx.save();
    ctx.strokeStyle = 'rgba(15, 60, 35, 0.32)';
    ctx.lineWidth = 2.2 * state.U;
    ctx.beginPath();
    ctx.moveTo(this.ox, this.oy);
    const midX = (this.ox + this.x) * 0.5 + Math.sin(this.ph) * 3 * state.U;
    const midY = (this.oy + this.y) * 0.5 + Math.cos(this.ph) * 3 * state.U;
    ctx.quadraticCurveTo(midX, midY, this.x, this.y);
    ctx.stroke();
    ctx.restore();
  }

  drawShadow() {
    const shX = this.x + 2.5 * state.U + this.bob * 0.4 - this.tiltX * 1.5;
    const shY = this.y + 3.5 * state.U + this.bob * 0.6 - this.tiltY * 1.5;
    const r = Math.max(1, this.r * (1 + this.bob * 0.02));
    ctx.save();
    ctx.translate(shX, shY);
    ctx.rotate(this.rot);
    ctx.fillStyle = 'rgba(0, 45, 35, 0.26)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, r, this.notch, 6.283 - this.notch);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawBody(t) {
    const r = Math.max(1, this.r * (1 + this.bob * 0.025));
    const rInner = Math.max(0.1, r * 0.1);
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);

    // Lotus leaf body with cleft notch
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, r, this.notch, 6.283 - this.notch);
    ctx.closePath();

    // Lush radial gradient shading
    const radGrad = ctx.createRadialGradient(0, 0, rInner, 0, 0, r);
    radGrad.addColorStop(0, '#3ba85d');
    radGrad.addColorStop(0.65, '#248347');
    radGrad.addColorStop(0.92, '#186333');
    radGrad.addColorStop(1, '#114a25');
    ctx.fillStyle = radGrad;
    ctx.fill();

    // Leaf rim contour
    ctx.strokeStyle = '#0f4422';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Radiating veins
    ctx.strokeStyle = 'rgba(16, 75, 38, 0.55)';
    ctx.lineWidth = 0.9;
    const veinCount = 8;
    const startAng = this.notch + 0.15;
    const endAng = 6.283 - this.notch - 0.15;
    const step = (endAng - startAng) / (veinCount - 1);
    for (let k = 0; k < veinCount; k++) {
      const ang = startAng + k * step;
      const vx = Math.cos(ang) * r * 0.92;
      const vy = Math.sin(ang) * r * 0.92;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(vx * 0.5 + Math.sin(ang * 2) * 1.5, vy * 0.5, vx, vy);
      ctx.stroke();
    }

    // Dew droplets
    for (const b of this.beads) {
      const bx = Math.cos(b.a) * b.r + this.tiltX * 2 * state.U;
      const by = Math.sin(b.a) * b.r + this.tiltY * 2 * state.U;
      ctx.fillStyle = 'rgba(235, 255, 248, 0.72)';
      ctx.beginPath();
      ctx.arc(bx, by, b.s, 0, 6.283);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(bx - b.s * 0.3, by - b.s * 0.3, b.s * 0.35, 0, 6.283);
      ctx.fill();
    }

    // Blooming lotus flower
    if (this.fl) {
      const flScale = this.r * 0.48;
      ctx.save();
      // Outer petals
      const outerCount = 10;
      for (let k = 0; k < outerCount; k++) {
        ctx.save();
        ctx.rotate((6.283 / outerCount) * k + Math.sin(t * 0.0008 + this.ph) * 0.05);
        ctx.fillStyle = k % 2 ? '#ff9ebb' : '#ffb6cb';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(flScale * 0.4, -flScale * 0.25, flScale * 1.05, 0);
        ctx.quadraticCurveTo(flScale * 0.4, flScale * 0.25, 0, 0);
        ctx.fill();
        ctx.restore();
      }
      // Inner petals
      const innerCount = 8;
      for (let k = 0; k < innerCount; k++) {
        ctx.save();
        ctx.rotate((6.283 / innerCount) * k + 0.39);
        ctx.fillStyle = k % 2 ? '#f43f7e' : '#fb7185';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(flScale * 0.3, -flScale * 0.18, flScale * 0.75, 0);
        ctx.quadraticCurveTo(flScale * 0.3, flScale * 0.18, 0, 0);
        ctx.fill();
        ctx.restore();
      }
      // Golden stamen core
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(0, 0, flScale * 0.22, 0, 6.283);
      ctx.fill();
      ctx.fillStyle = '#ca8a04';
      for (let m = 0; m < 5; m++) {
        const ma = m * 1.25;
        ctx.fillRect(Math.cos(ma) * flScale * 0.1, Math.sin(ma) * flScale * 0.1, 1.5, 1.5);
      }
      ctx.restore();
    }

    ctx.restore();
  }
}
