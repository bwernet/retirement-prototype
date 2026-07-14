// Fetches Bricolage Grotesque 800 + Instrument Sans 400/500/600/400i (latin)
// from Google Fonts and writes babytalk-fonts.css with base64-embedded woff2
// so the artifact is fully self-contained. Mirrors build-fonts.mjs.
import fs from 'node:fs';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';
const cssUrl = 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@800&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap';
const css = await (await fetch(cssUrl, { headers: { 'User-Agent': UA } })).text();
const blocks = css.split('@font-face').slice(1);

const WANT = [
  { fam: 'Bricolage Grotesque', style: 'normal', weight: 800 },
  { fam: 'Instrument Sans', style: 'normal', weight: 400 },
  { fam: 'Instrument Sans', style: 'normal', weight: 500 },
  { fam: 'Instrument Sans', style: 'normal', weight: 600 },
  { fam: 'Instrument Sans', style: 'italic', weight: 400 },
];

let out = '';
for (const w of WANT) {
  const candidates = blocks.filter(b =>
    b.includes(`font-family: '${w.fam}'`) &&
    b.includes(`font-style: ${w.style}`) &&
    b.includes(`font-weight: ${w.weight}`));
  if (!candidates.length) throw new Error(`no block for ${w.fam} ${w.style} ${w.weight}`);
  const block = candidates[candidates.length - 1]; // latin subset is listed last
  const url = block.match(/url\((https:[^)]+\.woff2)\)/)[1];
  const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
  out += `@font-face{font-family:'${w.fam}';font-style:${w.style};font-weight:${w.weight};` +
         `src:url(data:font/woff2;base64,${buf.toString('base64')}) format('woff2');}\n`;
}
fs.writeFileSync('babytalk-fonts.css', out);
console.log(`Wrote babytalk-fonts.css (${(out.length / 1024).toFixed(0)} KB)`);
