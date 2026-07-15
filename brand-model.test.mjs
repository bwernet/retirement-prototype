import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hexToRgb, rgbToHex, relativeLuminance, contrast, rgbToHsl, hslToRgb, darken, NEUTRALS, SCORE, PRESETS, onColorFor, darkenUntil, deriveRoles, deriveSecondary } from './brand-model.js';

test('hex round-trips', () => {
  assert.deepEqual(hexToRgb('#1E3A5F'), [30, 58, 95]);
  assert.equal(rgbToHex([30, 58, 95]), '#1E3A5F');
  assert.equal(rgbToHex(hexToRgb('#FFC93C')), '#FFC93C');
});

test('WCAG anchors', () => {
  assert.ok(Math.abs(relativeLuminance('#FFFFFF') - 1) < 1e-9);
  assert.ok(Math.abs(relativeLuminance('#000000')) < 1e-9);
  assert.ok(Math.abs(contrast('#FFFFFF', '#000000') - 21) < 0.01);
  assert.ok(Math.abs(contrast('#000000', '#FFFFFF') - 21) < 0.01, 'order-independent');
});

test('known ratios from the spec palette', () => {
  const near = (a, b, tol = 0.05) => assert.ok(Math.abs(a - b) < tol, `${a} !~ ${b}`);
  near(contrast('#FFC93C', '#FFFFFF'), 1.54);  // Sunwise yellow fails on white
  near(contrast('#1E3A5F', '#FFFFFF'), 11.50); // Harborlight navy passes big
  near(contrast('#6E6E7D', '#FFFFFF'), 5.01);  // gray2 is text-safe
  near(contrast('#9D9DA8', '#FFFFFF'), 2.68);  // gray3 is NOT text-safe
});

test('hsl round-trips and darken lowers lightness', () => {
  const hsl = rgbToHsl(hexToRgb('#1FA98C'));
  assert.equal(rgbToHex(hslToRgb(hsl)), '#1FA98C');
  const darker = darken('#FFC93C', 0.1);
  assert.ok(relativeLuminance(darker) < relativeLuminance('#FFC93C'));
  assert.equal(darken('#000000', 0.1), '#000000', 'floor at black');
});

test('darkenUntil: hostile yellow darkens to pass, with visible steps', () => {
  const fix = darkenUntil('#FFC93C', '#FFFFFF', 4.5);
  assert.equal(fix.adjusted, true);
  assert.ok(contrast(fix.color, '#FFFFFF') >= 4.5);
  assert.ok(fix.steps.length > 3, 'multiple visible steps for the motion');
  const ok = darkenUntil('#1E3A5F', '#FFFFFF', 4.5);
  assert.equal(ok.adjusted, false);
  assert.equal(ok.color, '#1E3A5F');
  assert.equal(ok.steps.length, 0);
});

test('onColorFor picks the higher-contrast text color', () => {
  assert.equal(onColorFor('#1E3A5F').color, NEUTRALS.white);
  assert.equal(onColorFor('#FFC93C').color, NEUTRALS.gray1);
});

test('Harborlight: every role passes raw, nothing flagged', () => {
  const p = PRESETS.find(p => p.id === 'harborlight');
  const r = deriveRoles(p.primary, p.secondary);
  assert.deepEqual(r.flagged, []);
  assert.equal(r.headline.adjusted, false);
  assert.equal(r.background.onColor, NEUTRALS.white);
  assert.equal(r.cta.onColor, NEUTRALS.gray1, 'teal CTA takes ink text');
  assert.ok(r.cta.ratio >= 4.5);
});

test('Sunwise: headline adjusted + flagged; band keeps raw yellow with ink text; gray CTA passes', () => {
  const p = PRESETS.find(p => p.id === 'sunwise');
  const r = deriveRoles(p.primary, p.secondary);
  assert.deepEqual(r.flagged, ['headline']);
  assert.equal(r.headline.adjusted, true);
  assert.ok(r.headline.rawRatio < 4.5 && r.headline.ratio >= 4.5);
  assert.equal(r.background.fill, '#FFC93C', 'band keeps the raw brand color');
  assert.equal(r.background.onColor, NEUTRALS.gray1);
  assert.equal(r.cta.adjusted, false);
  assert.equal(r.cta.onColor, NEUTRALS.white);
});

test('Ember Valley: dark band takes white text, rose CTA takes ink text, nothing flagged', () => {
  const p = PRESETS.find(p => p.id === 'embervalley');
  const r = deriveRoles(p.primary, p.secondary);
  assert.deepEqual(r.flagged, []);
  assert.equal(r.background.onColor, NEUTRALS.white);
  assert.equal(r.cta.onColor, NEUTRALS.gray1);
});

test('every role always ends >= 4.5:1, for arbitrary hostile input', () => {
  for (const hex of ['#F2F2F7', '#FFFF00', '#00FF00', '#888888', '#FFFFFF']) {
    const r = deriveRoles(hex, hex);
    assert.ok(r.headline.ratio >= 4.5, `headline ${hex}`);
    assert.ok(r.background.ratio >= 4.5, `background ${hex}`);
    assert.ok(r.cta.ratio >= 4.5, `cta ${hex}`);
  }
});

test('deriveSecondary is deterministic and CTA-usable', () => {
  const a = deriveSecondary('#1E3A5F');
  assert.equal(a, deriveSecondary('#1E3A5F'));
  const r = deriveRoles('#1E3A5F', a);
  assert.ok(r.cta.ratio >= 4.5);
});

test('fill roles darken as a last resort when no text color passes, and flag with display labels', () => {
  // #338899 sits in the dead zone: neither white nor ink reaches 4.5:1 on it.
  const r = deriveRoles('#338899', '#338899');
  assert.equal(r.background.adjusted, true);
  assert.equal(r.cta.adjusted, true);
  assert.equal(r.background.onColor, NEUTRALS.white, 'darkened fill takes white text');
  assert.ok(r.background.ratio >= 4.5);
  assert.ok(r.cta.ratio >= 4.5);
  assert.deepEqual(r.flagged, ['background', 'headline', 'CTA'], 'display labels, CTA uppercase');
});
