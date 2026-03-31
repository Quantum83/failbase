// ============================================
// FAILBASE THEME — change these 4 variables
// to restyle the entire app instantly
// ============================================

export const theme = {
  // 1. Page background & card surfaces
  // 2. Accent / primary action color (buttons, links, active states)
  // 3. Warm highlight color (banners, badges, featured moments)
  // 4. Dark base (text, nav, headers)

  bg: "#FBF5EC",
  accent: "#4e6646",
  highlight: "#dc7243",
  dark: "#5e445a",

  // Derived values — these auto-calculate from the 4 above, no need to touch
  get accentLight() {
    return this.accent + "22";
  },
  get highlightLight() {
    return this.highlight + "22";
  },
  get border() {
    return "#DDD8D2";
  },
  get sand() {
    return "#EFE9E3";
  },
  get muted() {
    return "#7A736C";
  },
  get red() {
    return "#C0392B";
  },
};

// Example palettes to try — just copy values into the 4 variables above:
//
// Forest & Ember (default):
//   bg: '#F9F8F6', accent: '#6F8F72', highlight: '#F2A65A', dark: '#2C2C2C'
//
// Default:
//    bg: "#FBF5EC" ,accent: "#4e6646", highlight: "#dc7243", dark: "#5e445a",
//
// Ocean & Coral:
//   bg: '#F4F8FA', accent: '#2E86AB', highlight: '#E84855', dark: '#1A1A2E'
//
// Lavender & Gold:
//   bg: '#F8F7FF', accent: '#7B6FA0', highlight: '#D4A017', dark: '#2D2D44'
//
// Desert & Rust:
//   bg: '#FAF7F2', accent: '#C4763A', highlight: '#E8C547', dark: '#2C1810'
