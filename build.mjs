// Inlines fonts, model, and app into a single self-contained HTML file.
import fs from 'node:fs';

const html = fs.readFileSync('index.html', 'utf8');
const fonts = fs.readFileSync('fonts.css', 'utf8');
const model = fs.readFileSync('model.js', 'utf8').replace(/^export /gm, '');
const app = fs.readFileSync('app.js', 'utf8');

const IMPORT_LINE = `import { simulate, formatAge, formatMoney, clampInput, CONSTANTS as C, DEFAULT_INPUTS, INPUT_LIMITS } from './model.js';`;
if (!app.includes(IMPORT_LINE)) throw new Error('app.js import line drifted — update build.mjs');

// Replacer functions everywhere: string replacements would mangle `$'` etc.
const inlinedApp = app.replace(IMPORT_LINE, () => model + '\nconst C = CONSTANTS;');
let out = html
  .replace('<link rel="stylesheet" href="fonts.css">', () => `<style>\n${fonts}</style>`)
  .replace('<script type="module" src="app.js"></script>', () => `<script type="module">\n${inlinedApp}</script>`);

if (out.includes('href="fonts.css"') || out.includes('src="app.js"')) throw new Error('inline failed');
fs.mkdirSync('dist', { recursive: true });
fs.writeFileSync('dist/retirement-prototype.html', out);
console.log(`Wrote dist/retirement-prototype.html (${(out.length / 1024).toFixed(0)} KB)`);

// decision-web is a single page with inline script — only the font link needs inlining.
const web = fs.readFileSync('decision-web.html', 'utf8')
  .replace('<link rel="stylesheet" href="fonts.css">', () => `<style>\n${fonts}</style>`);
if (web.includes('href="fonts.css"')) throw new Error('decision-web inline failed');
fs.writeFileSync('dist/decision-web.html', web);
console.log(`Wrote dist/decision-web.html (${(web.length / 1024).toFixed(0)} KB)`);
