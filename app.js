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
updateInputs();
