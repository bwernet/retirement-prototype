// Fetches DM Sans 400 + 500 (latin) from Google Fonts and writes fonts.css
// with base64-embedded woff2 so the prototype is fully self-contained.
//
// DM Sans is a variable font, so Google serves both weights as one woff2
// file. Picks that resolve to the same URL are grouped into a single
// @font-face with a font-weight range instead of duplicating the same
// payload per weight. Mirrors build-babytalk-fonts.mjs.
import fs from 'node:fs';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';
const cssUrl = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&display=swap';
const css = await (await fetch(cssUrl, { headers: { 'User-Agent': UA } })).text();
const blocks = css.split('@font-face').slice(1);

const WANT = [
  { fam: 'DM Sans', style: 'normal', weight: 400 },
  { fam: 'DM Sans', style: 'normal', weight: 500 },
];

// Resolve each want to its woff2 URL, then group picks that share a URL
// (family + style + url) so an identical file is only embedded once.
const groups = new Map(); // "fam|style|url" -> { fam, style, weights, url }
for (const w of WANT) {
  const candidates = blocks.filter(b =>
    b.includes(`font-family: '${w.fam}'`) &&
    b.includes(`font-style: ${w.style}`) &&
    b.includes(`font-weight: ${w.weight}`));
  if (!candidates.length) throw new Error(`no block for ${w.fam} ${w.style} ${w.weight}`);
  const block = candidates[candidates.length - 1]; // latin subset is listed last
  const url = block.match(/url\((https:[^)]+\.woff2)\)/)[1];
  const key = `${w.fam}|${w.style}|${url}`;
  if (!groups.has(key)) groups.set(key, { fam: w.fam, style: w.style, weights: [], url });
  groups.get(key).weights.push(w.weight);
}

// Minimal WOFF2 table-directory reader, just enough to list a file's table
// tags. 'fvar' is one of woff2's 63 well-known tags, so compliant encoders
// store it as a single flag byte rather than literal ASCII — a raw
// `buf.includes('fvar')` byte search is a false negative for real variable
// fonts. This walks the (uncompressed) header + directory to read the tags
// properly; no brotli decompression needed since the directory precedes the
// compressed table data. Spec: https://www.w3.org/TR/WOFF2/#table_dir_format
const WOFF2_KNOWN_TAGS = [
  'cmap', 'head', 'hhea', 'hmtx', 'maxp', 'name', 'OS/2', 'post', 'cvt ', 'fpgm',
  'glyf', 'loca', 'prep', 'CFF ', 'VORG', 'EBDT', 'EBLC', 'gasp', 'hdmx', 'kern',
  'LTSH', 'PCLT', 'VDMX', 'vhea', 'vmtx', 'BASE', 'GDEF', 'GPOS', 'GSUB', 'EBSC',
  'JSTF', 'MATH', 'CBDT', 'CBLC', 'COLR', 'CPAL', 'SVG ', 'sbix', 'acnt', 'avar',
  'bdat', 'bloc', 'bsln', 'cvar', 'fdsc', 'feat', 'fmtx', 'fvar', 'gvar', 'hsty',
  'just', 'lcar', 'mort', 'morx', 'opbd', 'prop', 'trak', 'Zapf', 'Silf', 'Glat',
  'Gloc', 'Feat', 'Sill',
];

function readUIntBase128(buf, pos) {
  let value = 0, n = 0;
  for (;;) {
    const byte = buf[pos]; pos++; n++;
    if (n === 1 && byte === 0x80) throw new Error('malformed UIntBase128 (leading zero)');
    if (value & 0xfe000000) throw new Error('malformed UIntBase128 (overflow)');
    value = (value << 7) | (byte & 0x7f);
    if ((byte & 0x80) === 0) return [value >>> 0, pos];
    if (n >= 5) throw new Error('malformed UIntBase128 (too long)');
  }
}

function woff2TableTags(buf) {
  if (buf.toString('ascii', 0, 4) !== 'wOF2') throw new Error('not a woff2 file');
  const numTables = buf.readUInt16BE(12);
  let pos = 48; // fixed-size WOFF2Header
  const tags = [];
  for (let i = 0; i < numTables; i++) {
    const flags = buf[pos]; pos += 1;
    const tagIndex = flags & 0x3f;
    let tag;
    if (tagIndex === 0x3f) { tag = buf.toString('ascii', pos, pos + 4); pos += 4; }
    else tag = WOFF2_KNOWN_TAGS[tagIndex];
    const xformVersion = (flags >> 6) & 0x3;
    let origLength;
    [origLength, pos] = readUIntBase128(buf, pos);
    // transformLength is present iff a non-null transform was applied.
    // glyf/loca: null transform is version 3. hmtx/others: null is version 0.
    const hasXformLength = (tag === 'glyf' || tag === 'loca') ? xformVersion !== 3 : xformVersion !== 0;
    if (hasXformLength) { let transformLength; [transformLength, pos] = readUIntBase128(buf, pos); }
    tags.push(tag);
  }
  return tags;
}

const fetched = new Map(); // url -> Buffer, so a shared URL is only fetched once
let out = '';
for (const { fam, style, weights, url } of groups.values()) {
  if (!fetched.has(url)) {
    fetched.set(url, Buffer.from(await (await fetch(url)).arrayBuffer()));
  }
  const buf = fetched.get(url);
  weights.sort((a, b) => a - b);
  const weightDecl = weights.length > 1
    ? `${weights[0]} ${weights[weights.length - 1]}`
    : `${weights[0]}`;

  // A static-weight file can't render a weight *range* — confirm a
  // multi-weight group actually resolved to a variable font (has an
  // fvar table) before the CSS claims that range.
  if (weights.length > 1 && !woff2TableTags(buf).includes('fvar')) {
    throw new Error(`${fam} ${style} ${weightDecl}: multi-weight group but no fvar table found in ${url}`);
  }

  out += `@font-face{font-family:'${fam}';font-style:${style};font-weight:${weightDecl};` +
         `src:url(data:font/woff2;base64,${buf.toString('base64')}) format('woff2');}\n`;
}
fs.writeFileSync('fonts.css', out);
console.log(`Wrote fonts.css (${(out.length / 1024).toFixed(0)} KB)`);
