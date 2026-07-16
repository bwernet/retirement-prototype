// Pure color/derivation logic for the white-label brand-system artifact.
// Mirrors the shipped Silvur white-label rules: partner primary -> background +
// headline, partner secondary -> CTA; failing colors darken stepwise + flag.

export function hexToRgb(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = [...h].map(c => c + c).join('');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex([r, g, b]) {
  return '#' + [r, g, b].map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('').toUpperCase();
}

export function relativeLuminance(hex) {
  const [r, g, b] = hexToRgb(hex).map(v => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a, b) {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

export function rgbToHsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h, s, l];
}

export function hslToRgb([h, s, l]) {
  if (s === 0) { const v = l * 255; return [v, v, v]; }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const f = t => {
    t = ((t % 1) + 1) % 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [f(h + 1 / 3) * 255, f(h) * 255, f(h - 1 / 3) * 255];
}

export function darken(hex, dl) {
  const [h, s, l] = rgbToHsl(hexToRgb(hex));
  return rgbToHex(hslToRgb([h, s, Math.max(0, l - dl)]));
}

export const NEUTRALS = {
  gray1: '#161D24', gray2: '#6E6E7D', gray3: '#9D9DA8', gray4: '#E2E2E5', gray5: '#F2F2F7',
  white: '#FFFFFF',
  errorText: '#E15255', errorBg: '#F8D5D5',
  announcementBg: '#FDEBC7', accentBlue: '#1C5C98',
};

export const SCORE = {
  gradient: ['#F69835', '#F4C355', '#529D40'],
  statuses: ['#1E8404', '#7EB52C', '#FFBA2C', '#FF8201'],
};

export const PRESETS = [
  { id: 'lanternbay', name: 'Lanternbay Credit Union', primary: '#1E3A5F', secondary: '#15806B' },
  { id: 'embervalley', name: 'Ember Valley Credit Union', primary: '#6B1F2F', secondary: '#C98A8A' },
  { id: 'sunwise', name: 'Sunwise Credit Union', primary: '#FFC93C', secondary: '#6E6A5E' },
];

export function onColorFor(fill) {
  const w = contrast(fill, NEUTRALS.white);
  const k = contrast(fill, NEUTRALS.gray1);
  return w >= k ? { color: NEUTRALS.white, ratio: w } : { color: NEUTRALS.gray1, ratio: k };
}

// Guaranteed to terminate (lightness floor at black), and guaranteed to REACH
// `target` only when `against` is light (all shipped uses pass white).
export function darkenUntil(hex, against, target = 4.5) {
  let color = hex;
  const steps = [];
  while (contrast(color, against) < target) {
    const next = darken(color, 0.02);
    if (next === color) break; // black floor
    color = next;
    steps.push(color);
  }
  return { color, adjusted: color !== hex, steps };
}

// The shipped rule: a fill keeps the partner's raw color and the TEXT adapts;
// only when no text color can pass does the fill itself darken (then flag).
function fillRole(rawFill) {
  let fill = rawFill, adjusted = false;
  let on = onColorFor(fill);
  if (on.ratio < 4.5) {
    fill = darkenUntil(fill, NEUTRALS.white, 4.5).color;
    adjusted = true;
    on = { color: NEUTRALS.white, ratio: contrast(fill, NEUTRALS.white) };
  }
  return { fill, raw: rawFill, adjusted, onColor: on.color, ratio: on.ratio };
}

export function deriveRoles(primary, secondary) {
  const background = fillRole(primary);
  const h = darkenUntil(primary, NEUTRALS.white, 4.5);
  const headline = {
    color: h.color, raw: primary, adjusted: h.adjusted, steps: h.steps,
    ratio: contrast(h.color, NEUTRALS.white), rawRatio: contrast(primary, NEUTRALS.white),
  };
  const cta = fillRole(secondary);
  // flagged holds human-readable role labels for prose/announcements
  // ('CTA' is an acronym, always uppercase) — NOT the object keys above.
  const flagged = [];
  if (background.adjusted) flagged.push('background');
  if (headline.adjusted) flagged.push('headline');
  if (cta.adjusted) flagged.push('CTA');
  return { background, headline, cta, flagged };
}

export function deriveSecondary(primary) {
  const [h, s] = rgbToHsl(hexToRgb(primary));
  return rgbToHex(hslToRgb([(h + 0.42) % 1, Math.max(0.35, Math.min(0.75, s)), 0.32]));
}
