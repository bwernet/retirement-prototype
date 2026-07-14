// Content-integrity checks for the research artifact. Guards the spec's
// honest-reporting rules: verbatim quotes exact, codes-only attribution,
// no emoji, required labels and disclosures present.
import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync('babytalk-question.html', 'utf8');

// Verbatim quotes — exact, typographic punctuation included.
const QUOTES = [
  '“Is she in fetal distress, or — because I had four donuts that day — is she just having a sugar party in there?”',
  '“Can I? Could I? Is it OK?”',
  '“How am I supposed to keep working for six more months when my brain feels like mush?”',
  '“It was so demoralizing when I was 40 weeks along and each day was ticking by, and all of the pregnancy apps were like, you should be done.”',
  '“It should know me.”',
];
for (const q of QUOTES) assert.ok(html.includes(q), `missing verbatim quote: ${q.slice(0, 40)}…`);

// Representative notification copy — exact, emoji-free.
const NOTES = [
  'Your baby is the size of a banana. Those little kicks are getting stronger!',
  'Halfway there — you’ve got this, mama!',
  'You might be experiencing skin changes — try treating yourself to a spa day!',
  'Congratulations, mama! Is your little one here yet?',
];
for (const n of NOTES) assert.ok(html.includes(n), `missing notification copy: ${n.slice(0, 40)}…`);

// Attributions — codes only.
const ATTRS = [
  'P5 · 33 weeks · asked Reddit, very late at night',
  'P4 · first pregnancy · “every 30 minutes”',
  'P7 · prototype interviews · describing the same app',
  'P2 · 40 weeks',
  'P1 · new mom',
];
for (const a of ATTRS) assert.ok(html.includes(a), `missing attribution: ${a}`);

// No emoji anywhere in the artifact.
assert.equal(/\p{Extended_Pictographic}/u.test(html), false, 'artifact must contain no emoji');

// Labels, sub-line, footer.
assert.ok(html.includes('What her apps said'), 'left column label');
assert.ok(html.includes('What she felt'), 'right column label');
assert.ok(html.includes('One participant’s words for what every participant was asking.'), 'headline sub-line');
assert.ok(html.includes('Research synthesis · 8 discovery interviews · 7 prototype tests'), 'rigor stamp');
assert.ok(html.includes('App notifications are representative copy, reconstructed from participants’ descriptions. All quotes are verbatim.'), 'disclosure');
assert.ok(html.includes('WEEK 40'), 'beat 4 week tag');

// One expressive voice: no serif families anywhere.
assert.equal(/Georgia|Times/i.test(html), false, 'no serif font families');

// Script invariants (Task 3+): behavior hooks the spec requires.
assert.ok(html.includes("babytalk-question:height"), 'height postMessage type string');
assert.ok(html.includes('IntersectionObserver'), 'visibility gating');
assert.ok(html.includes('prefers-reduced-motion'), 'reduced-motion gate in script');
assert.ok(html.includes('aria-pressed'), 'pause button state handling');
console.log('babytalk-question content-integrity: all checks passed');
