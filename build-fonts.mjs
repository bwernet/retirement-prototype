// Fetches DM Sans 400 + 500 (latin) from Google Fonts and writes fonts.css
// with base64-embedded woff2 so the prototype is fully self-contained.
import fs from 'node:fs';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';
const cssUrl = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&display=swap';
const css = await (await fetch(cssUrl, { headers: { 'User-Agent': UA } })).text();
const blocks = css.split('@font-face').slice(1);

let out = '';
for (const weight of [400, 500]) {
  const candidates = blocks.filter(b => b.includes(`font-weight: ${weight}`));
  const block = candidates[candidates.length - 1]; // latin subset is listed last
  const url = block.match(/url\((https:[^)]+\.woff2)\)/)[1];
  const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
  out += `@font-face{font-family:'DM Sans';font-style:normal;font-weight:${weight};` +
         `src:url(data:font/woff2;base64,${buf.toString('base64')}) format('woff2');}\n`;
}
fs.writeFileSync('fonts.css', out);
console.log(`Wrote fonts.css (${out.length} bytes)`);
