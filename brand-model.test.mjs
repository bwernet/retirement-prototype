import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hexToRgb, rgbToHex, relativeLuminance, contrast, rgbToHsl, hslToRgb, darken } from './brand-model.js';

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
