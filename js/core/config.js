/* ==========================================================================
   CONFIG & CONSTANTS
   Anatomical curves, traditional Japanese Koi varieties, and utilities.
   ========================================================================== */

// Math helpers
export const R = (a, b) => a + Math.random() * (b - a);

export const norm = a => {
  while (a > Math.PI) a -= 6.2832;
  while (a < -Math.PI) a += 6.2832;
  return a;
};

// Koi anatomy: 16 vertebrae spine
export const N = 16;

// Width taper profile from head (index 0) to tail (index 15)
export const PROFILE = [
  0.55, 0.80, 0.95, 1.00, 0.95, 0.86, 0.76, 0.66,
  0.56, 0.47, 0.39, 0.32, 0.26, 0.20, 0.15, 0.10
];

// Color definitions for Koi varieties
export const WH = '#f2efe2'; // Platinum white
export const RD = '#d6342a'; // Kohaku scarlet red
export const BK = '#1a1a1a'; // Sumi ink black
export const OR = '#e8742a'; // Tangerine orange
export const BL = '#3b82f6'; // Indigo blue (Asagi)
export const GL = '#facc15'; // Ginrin metallic gold

// Traditional Japanese Koi varieties (Kohaku, Sanke, Showa, Tancho, Asagi, Ginrin)
export const PALS = [
  { name: 'Kohaku', b: WH, p: [RD, RD, RD], isTancho: false, isGinrin: false },
  { name: 'Taisho Sanke', b: WH, p: [RD, BK, RD], isTancho: false, isGinrin: false },
  { name: 'Tancho', b: WH, p: [RD], isTancho: true, isGinrin: false }, // Pure white with single red crown
  { name: 'Orenji Ogon', b: OR, p: ['#f7b24a', WH], isTancho: false, isGinrin: true },
  { name: 'Asagi', b: '#93c5fd', p: ['#1e3a8a', '#ea580c'], isTancho: false, isGinrin: false }, // Blue net with orange trim
  { name: 'Showa Sanshoku', b: WH, p: [BK, RD, BK], isTancho: false, isGinrin: false },
  { name: 'Kinginrin', b: '#fef08a', p: [GL, WH, '#eab308'], isTancho: false, isGinrin: true } // Sparkling gold
];

// Pond bank flora colors
export const GR = ['#1e7a3a', '#2f9a44', '#49b84e', '#7ccf56', '#145c30', '#a6dd5f'];
export const FL = ['#ffd84a', '#ff8a3a', '#ff6fa3'];
