/* ==========================================================================
   AUDIO SYNTHESIS SYSTEM
   Procedural Web Audio Zen soundscape:
   - Flowing ambient water current drone
   - Flowing wind & gentle breeze gusts (LFO modulated)
   - Dynamic rain shower bed & water droplet patter
   - Garden fauna & bug sounds (night crickets, daytime cicadas, wing flutters)
   - Shishi-odoshi (bamboo water fountain strike)
   - Japanese Furin (wind chime resonance)
   - Water droplet plinks & feeding splashes
   ========================================================================== */

import { R } from '../core/config.js';
import { state } from '../core/state.js';

let ac = null;
let snd = false;
let master = null;

// Continuous ambient generator nodes
let waterNode = null;
let waterGain = null;

let windNode = null;
let windFilter = null;
let windGain = null;

let rainNode = null;
let rainFilter = null;
let rainGain = null;
let rainHighFilter = null;
let rainHighGain = null;

/**
 * Creates looped noise buffer for water, wind, and rain synthesis.
 */
function createNoiseBuffer(duration = 3.0) {
  if (!ac) return null;
  const buffer = ac.createBuffer(1, ac.sampleRate * duration, ac.sampleRate);
  const data = buffer.getChannelData(0);
  let lastOut = 0.0;
  // Pink-tinted smoothed noise for pleasant organic sound
  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1;
    data[i] = (lastOut * 0.75) + (white * 0.25);
    lastOut = data[i];
  }
  return buffer;
}

export function audioInit() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    ac = new AudioCtx();
    master = ac.createGain();
    master.gain.value = 0;
    master.connect(ac.destination);

    const noiseBuf = createNoiseBuffer(3.5);

    // 1. Filtered ambient water current drone (deep, calming flow)
    waterNode = ac.createBufferSource();
    waterNode.buffer = noiseBuf;
    waterNode.loop = true;

    const waterFilter = ac.createBiquadFilter();
    waterFilter.type = 'lowpass';
    waterFilter.frequency.value = 380;

    waterGain = ac.createGain();
    waterGain.gain.value = 0.04;

    waterNode.connect(waterFilter);
    waterFilter.connect(waterGain);
    waterGain.connect(master);
    waterNode.start();

    // 2. Flowing wind & garden breeze generator
    windNode = ac.createBufferSource();
    windNode.buffer = noiseBuf;
    windNode.loop = true;

    windFilter = ac.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.value = 320;
    windFilter.Q.value = 2.4;

    windGain = ac.createGain();
    windGain.gain.value = 0.022;

    windNode.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(master);
    windNode.start();

    // 3. Multi-layer rain shower soundscape
    rainNode = ac.createBufferSource();
    rainNode.buffer = noiseBuf;
    rainNode.loop = true;

    // Mid rain patter body
    rainFilter = ac.createBiquadFilter();
    rainFilter.type = 'bandpass';
    rainFilter.frequency.value = 2400;
    rainFilter.Q.value = 1.1;

    rainGain = ac.createGain();
    rainGain.gain.value = 0;

    // High rain spray / mist
    rainHighFilter = ac.createBiquadFilter();
    rainHighFilter.type = 'highpass';
    rainHighFilter.frequency.value = 4500;

    rainHighGain = ac.createGain();
    rainHighGain.gain.value = 0;

    rainNode.connect(rainFilter);
    rainFilter.connect(rainGain);
    rainGain.connect(master);

    rainNode.connect(rainHighFilter);
    rainHighFilter.connect(rainHighGain);
    rainHighGain.connect(master);

    rainNode.start();
  } catch (e) {
    ac = null;
  }
}

/**
 * Procedural water drop plink sound
 */
export function plink() {
  if (!snd || !ac) return;
  try {
    const o = ac.createOscillator();
    const g = ac.createGain();
    const t = ac.currentTime;

    o.type = 'sine';
    o.frequency.setValueAtTime(R(540, 960), t);
    o.frequency.exponentialRampToValueAtTime(320, t + 0.22);

    g.gain.setValueAtTime(0.065, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.26);

    o.connect(g);
    g.connect(master);
    o.start(t);
    o.stop(t + 0.28);
  } catch (e) {}
}

/**
 * Individual soft raindrop impact on pond surface
 */
export function rainDropPatter() {
  if (!snd || !ac) return;
  try {
    const o = ac.createOscillator();
    const g = ac.createGain();
    const t = ac.currentTime;

    o.type = 'sine';
    o.frequency.setValueAtTime(R(850, 1850), t);
    o.frequency.exponentialRampToValueAtTime(400, t + 0.045);

    g.gain.setValueAtTime(R(0.015, 0.038), t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);

    o.connect(g);
    g.connect(master);
    o.start(t);
    o.stop(t + 0.055);
  } catch (e) {}
}

/**
 * Garden Bug Sounds: Night/Dusk Cricket Chirps (3-4 delicate rhythmic pulses)
 */
export function cricketChirp() {
  if (!snd || !ac) return;
  try {
    const t = ac.currentTime;
    const baseFreq = R(4300, 4850);
    const pulseCount = Math.random() < 0.6 ? 3 : 4;

    for (let i = 0; i < pulseCount; i++) {
      const pt = t + i * 0.042;
      const o = ac.createOscillator();
      const g = ac.createGain();

      o.type = 'sine';
      o.frequency.setValueAtTime(baseFreq + R(-50, 50), pt);

      g.gain.setValueAtTime(0.0001, pt);
      g.gain.linearRampToValueAtTime(0.024, pt + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, pt + 0.034);

      o.connect(g);
      g.connect(master);
      o.start(pt);
      o.stop(pt + 0.038);
    }
  } catch (e) {}
}

/**
 * Garden Bug Sounds: Daytime Cicada & Katydid gentle summer trill
 */
export function cicadaTrill() {
  if (!snd || !ac) return;
  try {
    const t = ac.currentTime;
    const dur = R(0.8, 1.6);
    const o = ac.createOscillator();
    const g = ac.createGain();
    const tremolo = ac.createOscillator();
    const tremoloGain = ac.createGain();

    o.type = 'triangle';
    o.frequency.setValueAtTime(R(3800, 4300), t);
    o.frequency.linearRampToValueAtTime(R(4100, 4600), t + dur * 0.5);
    o.frequency.linearRampToValueAtTime(R(3700, 4200), t + dur);

    // Tremolo LFO for rapid insect wing resonance
    tremolo.frequency.setValueAtTime(R(18, 26), t);
    tremoloGain.gain.setValueAtTime(0.01, t);
    tremolo.connect(g.gain);

    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.016, t + dur * 0.25);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    o.connect(g);
    g.connect(master);

    o.start(t);
    tremolo.start(t);
    o.stop(t + dur);
    tremolo.stop(t + dur);
  } catch (e) {}
}

/**
 * Garden Bug Sounds: Dragonfly wing flutter when hovering or changing paths
 */
export function dragonflyFlutter() {
  if (!snd || !ac) return;
  try {
    const t = ac.currentTime;
    const dur = R(0.18, 0.35);
    const o = ac.createOscillator();
    const f = ac.createBiquadFilter();
    const g = ac.createGain();

    o.type = 'sawtooth';
    o.frequency.setValueAtTime(R(85, 130), t);

    f.type = 'lowpass';
    f.frequency.setValueAtTime(320, t);

    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.015, t + dur * 0.2);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    o.connect(f);
    f.connect(g);
    g.connect(master);

    o.start(t);
    o.stop(t + dur);
  } catch (e) {}
}

/**
 * Plays context-aware insect/fauna sounds based on time of day
 */
export function playBugSound() {
  if (!snd || !ac) return;
  if (state.timeOfDay === 'night' || state.timeOfDay === 'dusk') {
    // Crickets are especially active during serene twilight and night
    cricketChirp();
  } else {
    // Daytime features cicada trills or dragonfly wing flutters
    if (Math.random() < 0.55) {
      cicadaTrill();
    } else {
      dragonflyFlutter();
    }
  }
}

/**
 * Japanese Furin (wind chime) peaceful metallic resonance
 */
export function furinChime() {
  if (!snd || !ac) return;
  try {
    const t = ac.currentTime;
    const baseFreq = R(1400, 2200);

    [1, 1.48, 2.15].forEach((mult, idx) => {
      const o = ac.createOscillator();
      const g = ac.createGain();

      o.type = 'sine';
      o.frequency.setValueAtTime(baseFreq * mult, t);

      const amp = 0.035 / (idx + 1);
      g.gain.setValueAtTime(amp, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);

      o.connect(g);
      g.connect(master);
      o.start(t);
      o.stop(t + 1.9);
    });
  } catch (e) {}
}

/**
 * Shishi-odoshi (bamboo water fountain strike)
 */
export function bambooStrike() {
  if (!snd || !ac) return;
  try {
    const t = ac.currentTime;
    const o = ac.createOscillator();
    const g = ac.createGain();

    o.type = 'triangle';
    o.frequency.setValueAtTime(140, t);
    o.frequency.exponentialRampToValueAtTime(45, t + 0.15);

    g.gain.setValueAtTime(0.2, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    o.connect(g);
    g.connect(master);
    o.start(t);
    o.stop(t + 0.2);
  } catch (e) {}
}

/**
 * Dynamically updates flowing wind modulation, ambient water, and rain volume
 */
export function updateAudioState(now = performance.now()) {
  if (!ac) return;

  const t = now * 0.001;

  // 1. Flowing Wind modulation (subtle breathing gusts)
  if (windFilter && windGain) {
    const windFreq = 260 + Math.sin(t * 0.25) * 140 + Math.cos(t * 0.55) * 60;
    windFilter.frequency.setTargetAtTime(windFreq, ac.currentTime, 0.25);

    // Wind gust intensity swells naturally, increasing slightly in rain
    const baseWindGain = state.raining ? 0.035 : 0.02;
    const gust = Math.max(0, Math.sin(t * 0.18) * 0.015);
    const targetWindGain = snd ? (baseWindGain + gust) : 0;
    windGain.gain.setTargetAtTime(targetWindGain, ac.currentTime, 0.4);
  }

  // 2. Ambient Water flow volume
  if (waterGain) {
    const targetWater = snd ? (state.raining ? 0.05 : 0.038) : 0;
    waterGain.gain.setTargetAtTime(targetWater, ac.currentTime, 0.3);
  }

  // 3. Rain shower bed volume
  if (rainGain && rainHighGain) {
    const targetRainMid = (snd && state.raining) ? 0.048 : 0;
    const targetRainHigh = (snd && state.raining) ? 0.024 : 0;
    rainGain.gain.setTargetAtTime(targetRainMid, ac.currentTime, 0.25);
    rainHighGain.gain.setTargetAtTime(targetRainHigh, ac.currentTime, 0.25);
  }
}

export function toggleSound() {
  snd = !snd;
  if (snd && !ac) audioInit();
  if (ac) {
    master.gain.value = snd ? 1 : 0;
    if (snd && ac.resume) ac.resume();
  }
  updateAudioState();
  return snd;
}
