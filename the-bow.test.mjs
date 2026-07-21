// Content integrity for the-bow.html. Run: node the-bow.test.mjs
import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync('the-bow.html', 'utf8');
const modelJs = fs.readFileSync('bow-model.js', 'utf8');
const t = (name, fn) => { try { fn(); console.log('ok -', name); } catch (e) { console.error('FAIL -', name); throw e; } };

// Whitelabel guard lifted 2026-07-20: The Knot gave written OK to show the real
// brand, so the logo + nav icons are the client's actual marks and the wordmark's
// accessible name reads "the knot". The knot-absence assertion is retired; the
// brand is now permitted throughout the artifact.
t('brand: approved client wordmark present', () => {
  assert.ok(/id="wordmark"[^>]*aria-label="the knot"/.test(html));
});
t('disclaimer pill present', () => {
  assert.ok(html.includes('Concept prototype'));
});
t('story hooks: seek listener, stream drain, both anchors', () => {
  assert.ok(html.includes("d.bowStory === 'seek'"), 'storySeek message listener');
  assert.ok(html.includes('while (inFlight.size)'), 'seek-done drains in-flight streams');
  assert.ok(html.includes("storyAnchor = 'approval-send'"), 'approval anchor');
  assert.ok(html.includes("storyAnchor = 'access-evidence'"), 'evidence anchor');
});
t('story page: embeds dist, six chapters, fine-grained beats, scrub + anchors', () => {
  const story = fs.readFileSync('the-bow-story.html', 'utf8');
  assert.ok(story.includes('src="dist/the-bow.html"'), 'iframe loads the dist artifact');
  assert.equal((story.match(/chapter: '/g) || []).length, 6, 'six story chapters');
  assert.ok((story.match(/path: /g) || []).length >= 10, 'fine-grained beats');
  assert.ok(story.includes('scrub: true'), 'scroll-linked scrub beats');
  assert.ok(story.includes("anchor: 'approval-send'"));
  assert.ok(story.includes("anchor: 'access-evidence'"));
});
t('home dashboard pins', () => {
  assert.ok(html.includes('355 DAYS TO GO!'));
  assert.ok(html.includes('Hello Tony &amp; Carmella! What can I help with?'));
  assert.ok(html.includes('Some things I’ve gathered for you while you were gone:'));
  assert.ok(html.includes('Ask anything'));
});
t('proactive cards (fresh state)', () => {
  for (const s of [
    '5 lake-view venues still free on 9/20/26',
    '4 farm-to-table chefs within budget',
    'Pulled 7 desert-chic décor ideas',
    'Saved you $1,200 on catering',
    'Weather watch: 20% rain risk on your wedding date',
    '10 photographers free on 9/20/26',
  ]) assert.ok(html.includes(s), s);
});
t('responded-state card', () => {
  assert.ok(html.includes('4 venues responded to accessibility enquiry'));
  assert.ok(html.includes('Willow Shore Lodge, Harborcrest Pavilion, Silver Pines Retreat, and Blue Horizon Club have sent over their accommodations and floor plans'));
});
t('pinkCTA: :root custom property matches bow-model.js BRAND.pinkCTA (Task 12)', () => {
  const cssMatch = html.match(/--pink-cta:\s*(#[0-9A-Fa-f]{6})/);
  const jsMatch = modelJs.match(/pinkCTA:\s*'(#[0-9A-Fa-f]{6})'/);
  assert.ok(cssMatch, 'the-bow.html :root is missing --pink-cta');
  assert.ok(jsMatch, 'bow-model.js BRAND is missing pinkCTA');
  assert.equal(cssMatch[1].toUpperCase(), jsMatch[1].toUpperCase(),
    `CSS --pink-cta (${cssMatch[1]}) must equal BRAND.pinkCTA (${jsMatch[1]}) — they can't drift`);
});
t('white-text fills pass AA (pinkCTA + New! pill fill)', () => {
  const lum = h => { const [r, g, b] = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4); return .2126 * r + .7152 * g + .0722 * b; };
  const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + .05) / (y + .05); };
  for (const varName of ['--pink-cta', '--label-pink-fill']) {
    const m = html.match(new RegExp(varName + ':\\s*(#[0-9A-Fa-f]{6})'));
    assert.ok(m, `the-bow.html :root is missing ${varName}`);
    const ratio = contrast('#FFFFFF', m[1]);
    assert.ok(ratio >= 4.5, `white on ${varName} (${m[1]}) = ${ratio.toFixed(2)}:1 — below AA`);
  }
});
if (fs.existsSync('dist/the-bow.html')) {
  const dist = fs.readFileSync('dist/the-bow.html', 'utf8');
  console.log(`dist/the-bow.html: ${(Buffer.byteLength(dist, 'utf8') / 1024).toFixed(0)} KB`);
  // Whitelabel lifted 2026-07-20 (brand approved) — dist carries the real wordmark
  t('dist: approved client wordmark present', () => assert.ok(/aria-label="the knot"/.test(dist)));
  t('dist: self-contained', () => {
    assert.ok(!dist.includes('<link '), 'no external stylesheets');
    assert.ok(!/src="http/.test(dist), 'no external scripts/images');
    assert.ok(!/fetch\(/.test(dist), 'no runtime fetches');
    assert.ok(!/url\(https?:/.test(dist), 'no external CSS urls');
  });
  t('dist: fonts + photos inlined', () => {
    assert.ok(dist.includes('data:font/woff2'));
    assert.ok(dist.includes('data:image/'));
  });
  t('dist: SVG sprite survived', () => {
    assert.ok(dist.includes('id="i-piggy"'), 'piggy-bank sprite icon missing from dist');
  });
  t('dist: photos inlined as data URIs (>= 9)', () => {
    const count = (dist.match(/data:image\/jpeg/g) || []).length;
    assert.ok(count >= 9, `expected >= 9 data:image/jpeg occurrences, got ${count}`);
  });
}
console.log('the-bow.html content OK');
