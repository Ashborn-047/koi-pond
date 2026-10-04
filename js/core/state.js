/* ==========================================================================
   SIMULATION STATE
   Shared reactive state, dimensions, and collections.
   ========================================================================== */

export const cv = document.getElementById('c');
export const ctx = cv.getContext('2d');

export const state = {
  // Viewport dimensions
  W: window.innerWidth,
  H: window.innerHeight,
  w: 0,
  h: 0,
  PX: 2,
  U: 1, // Responsive unit scale
  vig: null, // Radial vignette gradient

  // Entity collections
  fish: [],
  foods: [],
  ripples: [],
  schools: [],
  pads: [],
  petals: [],
  leaves: [],
  stones: [],       // Underwater river stones & moss
  dragonflies: [],  // Daytime hovering dragonflies
  fireflies: [],    // Night glowing fireflies

  // Interaction, Weather & Time of Day
  ptr: null,
  ptrStillTime: 0,  // How long pointer is stationary (for koi petting)
  timeOfDay: 'day', // 'day' | 'dusk' | 'night'
  raining: false,
  zenMode: false,   // Zen slow-motion meditation
  nextPetalTime: 0
};
