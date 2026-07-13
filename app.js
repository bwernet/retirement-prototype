import { simulate, formatAge, formatMoney, clampInput, CONSTANTS as C, DEFAULT_INPUTS, INPUT_LIMITS } from './model.js';

const state = { ...DEFAULT_INPUTS };

const ICONS = {
  calc: `<svg class="row-icon" width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="1" width="14" height="16" rx="2" stroke="#27356B" stroke-width="1.4"/><rect x="4.5" y="3.5" width="9" height="3.5" rx="1" fill="#B3A0EE"/><circle cx="6" cy="10.5" r="1" fill="#27356B"/><circle cx="9" cy="10.5" r="1" fill="#27356B"/><circle cx="12" cy="10.5" r="1" fill="#27356B"/><circle cx="6" cy="13.5" r="1" fill="#27356B"/><circle cx="9" cy="13.5" r="1" fill="#27356B"/><circle cx="12" cy="13.5" r="1" fill="#27356B"/></svg>`,
  cross: `<svg class="row-icon" width="22" height="22" viewBox="0 0 22 22"><circle cx="11" cy="11" r="11" fill="#E5484D"/><path d="M9.2 5h3.6v4.2H17v3.6h-4.2V17H9.2v-4.2H5V9.2h4.2z" fill="#fff"/></svg>`,
};

const RAILS = {
  left: [
    { title: 'Retirement Date', chip: 'High Impact', rows: [
      { type: 'stepper', key: 'retirementAge', label: 'You plan to retire at age:',
        fmt: v => v, sub: v => `in ${C.baseYear + v - C.currentAge}` },
      { type: 'impact', text: 'Average members add up to 3-4 years to their score each year they delay retirement.' },
    ]},
    { title: 'Spending', chip: 'High Impact', rows: [
      { type: 'stepper', key: 'monthlySpending', label: 'Current spending',
        fmt: formatMoney, sub: () => 'in per month' },
      { type: 'link', text: 'Detailed spending' },
      { type: 'impact', text: 'Average members add up to 2-3 years to their score each $250 a month they reduce spending.' },
    ]},
    { title: 'Net Worth', rows: [
      { type: 'stepper', key: 'netWorth', label: 'Current net worth',
        fmt: formatMoney, sub: () => 'in 8 accounts' },
      { type: 'link', text: 'Edit accounts' },
    ]},
  ],
  right: [
    { title: 'Income', chip: 'High Impact', rows: [
      { type: 'stepper', key: 'addedIncomeMonthly', label: 'Add Income in Retirement',
        fmt: formatMoney, sub: () => 'per month' },
      { type: 'stepper', key: 'addedIncomeYears', label: 'You plan to make this for:',
        fmt: v => `${v} years`, sub: v => `until ${C.baseYear + (state.retirementAge - C.currentAge) + v}` },
      { type: 'link', text: 'Edit current income' },
      { type: 'impact', text: 'Average members can add up to 3-4 years to their score for each additional $1000/month of income in retirement.' },
    ]},
    { title: 'Social Security', rows: [
      { type: 'stepper', key: 'ssElectionAge', label: 'Your election age',
        fmt: v => v, sub: v => `in ${C.baseYear + v - C.currentAge}` },
      { type: 'link', text: 'Social Security Calculator', icon: 'calc' },
      { type: 'impact', text: 'The average member adds 1-2 years to their score by electing at 67 instead of 62.' },
    ]},
    { title: 'Healthcare', rows: [
      { type: 'stepper', key: 'medicareMonthly', label: 'Medicare Premiums', icon: 'cross',
        fmt: formatMoney, sub: () => `per month starting in ${C.baseYear + C.medicareStartAge - C.currentAge}` },
      { type: 'link', text: 'Medicare Calculator', icon: 'calc' },
    ]},
  ],
};
// The phone's bottom sheet mirrors the Retirement Date card (same key -> stays in sync).
const SHEET_CARD = { title: 'Retirement Date', chip: 'High Impact', rows: [RAILS.left[0].rows[0]] };

const ROWCFG = {}; // key -> stepper row config (for updateInputs)

function rowHTML(r) {
  if (r.type === 'stepper') {
    ROWCFG[r.key] = r;
    const icon = r.icon ? ICONS[r.icon] : '';
    return `<div class="row stepper-row">
      <div class="row-label">${icon}${r.label}</div>
      <button class="step" data-key="${r.key}" data-dir="-1" aria-label="decrease">&minus;</button>
      <div class="val"><span class="val-big" data-val="${r.key}"></span><span class="val-sub" data-sub="${r.key}"></span></div>
      <button class="step" data-key="${r.key}" data-dir="1" aria-label="increase">+</button>
    </div>`;
  }
  if (r.type === 'link') {
    const icon = r.icon ? ICONS[r.icon] : '';
    return `<div class="row link-row">${icon ? `<span>${icon}${r.text}</span>` : `<span>${r.text}</span>`}<span class="chev">&#8250;</span></div>`;
  }
  if (r.type === 'impact') {
    return `<div class="row impact">
      <span class="impact-tag"><svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#2D6FD3" stroke-width="1.5"><path d="M1 9L9 1M4 1h5v5"/></svg>IMPACT:</span>
      <span class="impact-text">${r.text}</span>
    </div>`;
  }
}

function cardHTML(card) {
  return `<section class="card">
    <div class="card-head"><h2 class="card-title">${card.title}</h2>${card.chip ? `<span class="chip">${card.chip}</span>` : ''}</div>
    ${card.rows.map(rowHTML).join('')}
  </section>`;
}

document.getElementById('rail-left').innerHTML = RAILS.left.map(cardHTML).join('');
document.getElementById('rail-right').innerHTML = RAILS.right.map(cardHTML).join('');
document.getElementById('sheet').innerHTML = cardHTML(SHEET_CARD);

function updateInputs() {
  for (const [key, row] of Object.entries(ROWCFG)) {
    document.querySelectorAll(`[data-val="${key}"]`).forEach(el => { el.textContent = row.fmt(state[key]); });
    document.querySelectorAll(`[data-sub="${key}"]`).forEach(el => { el.textContent = row.sub(state[key]); });
  }
}
/* ---------- live rendering ---------- */
const SVGNS = 'http://www.w3.org/2000/svg';
const AGES = Array.from({ length: C.endAge - C.currentAge + 1 }, (_, i) => C.currentAge + i);
const CH = { w: 344, h: 160, top: 12 };
let chartBars, spendLine, hoverZones, ageMarkers;

function initChart() {
  const svg = document.getElementById('chart');
  const bw = CH.w / AGES.length;
  chartBars = AGES.map((_, i) => {
    const g = {};
    for (const part of ['green', 'purple', 'blue']) {
      const r = document.createElementNS(SVGNS, 'rect');
      r.setAttribute('x', (i * bw + 1).toFixed(2));
      r.setAttribute('width', (bw - 2).toFixed(2));
      r.setAttribute('y', CH.h); r.setAttribute('height', 0);
      r.setAttribute('class', `bar bar-${part}`);
      svg.appendChild(r); g[part] = r;
    }
    return g;
  });
  spendLine = document.createElementNS(SVGNS, 'polyline');
  spendLine.setAttribute('class', 'spend-line');
  svg.appendChild(spendLine); // appended last so the white line renders on top

  // Always-visible markers at the top of the two retirement-year bars, plus
  // invisible hover targets that fade in the corresponding label.
  hoverZones = {}; ageMarkers = {};
  for (const id of ['note-retire', 'note-gary']) {
    const marker = document.createElementNS(SVGNS, 'rect');
    marker.setAttribute('class', 'age-marker');
    marker.setAttribute('width', 3); marker.setAttribute('height', 8);
    marker.setAttribute('rx', 1.5);
    svg.appendChild(marker);
    ageMarkers[id] = marker;

    const zone = document.createElementNS(SVGNS, 'rect');
    zone.setAttribute('class', 'hover-zone');
    zone.setAttribute('y', 0); zone.setAttribute('height', CH.h);
    zone.setAttribute('width', (bw * 3).toFixed(2)); // 3 columns wide, easy to hit
    svg.appendChild(zone);
    const note = document.getElementById(id);
    zone.addEventListener('mouseenter', () => note.classList.add('show'));
    zone.addEventListener('mouseleave', () => note.classList.remove('show'));
    hoverZones[id] = zone;
  }
}

function agePct(age) {
  return ((age - C.currentAge) / (C.endAge - C.currentAge)) * 100;
}

// Places one annotation set — bar-top marker, hover zone, and label pill.
// The pill sits just above its bar with the tail pointing at the marker;
// when clamped at a chart edge, the tail shifts to keep pointing at the bar.
function placeAnnotation(id, age, text, sim, yPix, bw) {
  const i = age - C.currentAge;
  const y = sim.years[i];
  const stackTop = yPix(y.nonGuaranteed + y.guaranteed + y.withdrawal);
  const chartEl = document.getElementById('chart');
  const sx = chartEl.clientWidth / CH.w, sy = chartEl.clientHeight / CH.h;
  const cxSvg = (i + 0.5) * bw;

  const marker = ageMarkers[id];
  marker.setAttribute('x', (cxSvg - 1.5).toFixed(2));
  marker.setAttribute('y', (stackTop - 12).toFixed(2));
  hoverZones[id].setAttribute('x', ((i - 1) * bw).toFixed(2));

  const note = document.getElementById(id);
  note.textContent = text;
  const rawX = 24 + cxSvg * sx; // 24 = chart-wrap side padding
  const half = note.offsetWidth / 2 + 4;
  const clampedX = Math.min(Math.max(rawX, 24 + half), 24 + chartEl.clientWidth - half);
  note.style.left = `${clampedX.toFixed(1)}px`;
  note.style.setProperty('--tail-dx', `${(rawX - clampedX).toFixed(1)}px`);
  const top = 30 + (stackTop - 12) * sy - note.offsetHeight - 7; // 30 = chart-wrap top padding
  note.style.top = `${top.toFixed(1)}px`;
  return { note, top, x: clampedX };
}

function updateChart(sim) {
  const yMax = Math.max(...sim.years.map(y =>
    Math.max(y.spending, y.nonGuaranteed + y.guaranteed + y.withdrawal))) * 1.06;
  const yPix = v => CH.h - (v / yMax) * (CH.h - CH.top);
  sim.years.forEach((y, i) => {
    let acc = 0;
    for (const [part, val] of [['green', y.nonGuaranteed], ['purple', y.guaranteed], ['blue', y.withdrawal]]) {
      const yTop = yPix(acc + val), yBot = yPix(acc);
      chartBars[i][part].setAttribute('y', yTop.toFixed(2));
      chartBars[i][part].setAttribute('height', Math.max(0, yBot - yTop).toFixed(2));
      acc += val;
    }
  });
  const bw = CH.w / AGES.length;
  spendLine.setAttribute('points',
    sim.years.map((y, i) => `${((i + 0.5) * bw).toFixed(2)},${yPix(y.spending).toFixed(2)}`).join(' '));
  const a = placeAnnotation('note-retire', state.retirementAge, `You retire at ${state.retirementAge}`, sim, yPix, bw);
  const b = placeAnnotation('note-gary', C.garyRetiresAt, `Gary retires at ${C.garyRetiresAt}`, sim, yPix, bw);
  // If the two pills would collide, lift Gary's clear of the retire pill.
  if (Math.abs(a.x - b.x) < (a.note.offsetWidth + b.note.offsetWidth) / 2 + 8 &&
      Math.abs(a.top - b.top) < 26) {
    b.note.style.top = `${(Math.min(a.top, b.top) - 28).toFixed(1)}px`;
  }
}

function updateScore(sim) {
  const lasts = sim.moneyLastsAge ?? C.endAge;
  const retireDot = document.getElementById('score-retire');
  const lastsDot = document.getElementById('score-lasts');
  retireDot.style.left = `${agePct(state.retirementAge)}%`;
  retireDot.textContent = state.retirementAge;
  lastsDot.style.left = `${agePct(lasts)}%`;
  lastsDot.textContent = Math.floor(lasts);
  document.getElementById('readout-retire').textContent = state.retirementAge;
  document.getElementById('readout-lasts').textContent = formatAge(sim.moneyLastsAge);
}

function renderAll() {
  updateInputs();
  const sim = simulate(state);
  updateChart(sim);
  updateScore(sim);
}

initChart();
renderAll();

/* ---------- interactivity ---------- */
document.body.addEventListener('click', e => {
  const btn = e.target.closest('.step');
  if (!btn) return;
  const key = btn.dataset.key;
  const next = clampInput(key, state[key] + Number(btn.dataset.dir) * INPUT_LIMITS[key].step);
  if (next === state[key]) return;
  state[key] = next;
  renderAll();
});
window.addEventListener('resize', () => renderAll()); // keeps pixel-positioned chart notes aligned
