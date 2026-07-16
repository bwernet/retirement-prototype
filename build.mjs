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

// babytalk-question is a single page with inline script — only the font link needs inlining.
const btFonts = fs.readFileSync('babytalk-fonts.css', 'utf8');
const bt = fs.readFileSync('babytalk-question.html', 'utf8')
  .replace('<link rel="stylesheet" href="babytalk-fonts.css">', () => `<style>\n${btFonts}</style>`);
if (bt.includes('href="babytalk-fonts.css"')) throw new Error('babytalk-question inline failed');
fs.writeFileSync('dist/babytalk-question.html', bt);
console.log(`Wrote dist/babytalk-question.html (${(bt.length / 1024).toFixed(0)} KB)`);

// brand-system imports brand-model.js — inline both fonts and model.
const brandModel = fs.readFileSync('brand-model.js', 'utf8').replace(/^export /gm, '');
const BRAND_IMPORT = `import { PRESETS, NEUTRALS, deriveRoles, deriveSecondary } from './brand-model.js';`;
const brandSrc = fs.readFileSync('brand-system.html', 'utf8');
if (!brandSrc.includes(BRAND_IMPORT)) throw new Error('brand-system import line drifted — update build.mjs');
const brand = brandSrc
  .replace('<link rel="stylesheet" href="fonts.css">', () => `<style>\n${fonts}</style>`)
  .replace(BRAND_IMPORT, () => brandModel);
if (brand.includes('href="fonts.css"') || brand.includes("from './brand-model.js'")) throw new Error('brand-system inline failed');
fs.writeFileSync('dist/brand-system.html', brand);
console.log(`Wrote dist/brand-system.html (${(brand.length / 1024).toFixed(0)} KB)`);
