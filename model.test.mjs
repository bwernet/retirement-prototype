import { test } from 'node:test';
import assert from 'node:assert/strict';
import { simulate, formatAge, formatMoney, clampInput, DEFAULT_INPUTS } from './model.js';

test('default scenario runs out roughly where the mockup says (~82)', () => {
  const { moneyLastsAge, ranOut } = simulate(DEFAULT_INPUTS);
  assert.equal(ranOut, true);
  assert.ok(moneyLastsAge > 79 && moneyLastsAge < 87, `got ${moneyLastsAge}`);
});

test('withdrawals never exceed the gap up to the spending line', () => {
  const { years } = simulate(DEFAULT_INPUTS);
  for (const y of years) {
    const gap = Math.max(0, y.spending - (y.nonGuaranteed + y.guaranteed));
    assert.ok(y.withdrawal <= gap + 1e-6, `age ${y.age}: withdrawal ${y.withdrawal} > gap ${gap}`);
  }
});

test('levers move the score in the believable direction', () => {
  const base = simulate(DEFAULT_INPUTS).moneyLastsAge;
  const withOverride = o => simulate({ ...DEFAULT_INPUTS, ...o }).moneyLastsAge ?? 95.01;
  assert.ok(withOverride({ monthlySpending: 5240 }) > base, 'spend less -> lasts longer');
  assert.ok(withOverride({ monthlySpending: 8000 }) < base, 'spend more -> runs out sooner');
  assert.ok(withOverride({ retirementAge: 66 }) > base, 'retire later -> lasts longer');
  assert.ok(withOverride({ addedIncomeMonthly: 2000 }) > base, 'more income -> lasts longer');
  assert.ok(withOverride({ netWorth: 1500000 }) > base, 'more savings -> lasts longer');
  assert.ok(withOverride({ ssElectionAge: 62 }) <= base, 'electing at 62 is worse than 67 (matches impact copy)');
});

test('reduced spending redistributes withdrawals to later years', () => {
  const lastWithdrawalAge = ys => Math.max(...ys.filter(y => y.withdrawal > 0).map(y => y.age));
  const a = simulate(DEFAULT_INPUTS).years;
  const b = simulate({ ...DEFAULT_INPUTS, monthlySpending: 5000 }).years;
  assert.ok(lastWithdrawalAge(b) > lastWithdrawalAge(a));
});

test('after money runs out, withdrawals are zero (clean cliff edge)', () => {
  const { years, moneyLastsAge } = simulate(DEFAULT_INPUTS);
  for (const y of years.filter(y => y.age > Math.ceil(moneyLastsAge))) {
    assert.equal(y.withdrawal, 0);
  }
});

test('formatters', () => {
  assert.equal(formatAge(82.42), '82y 5m');
  assert.equal(formatAge(83.999), '84y 0m');
  assert.equal(formatAge(null), '95y+');
  assert.equal(formatMoney(1093293), '$1,093,293');
});

test('clampInput respects limits', () => {
  assert.equal(clampInput('ssElectionAge', 75), 70);
  assert.equal(clampInput('ssElectionAge', 55), 62);
  assert.equal(clampInput('retirementAge', 50), 62);
});
