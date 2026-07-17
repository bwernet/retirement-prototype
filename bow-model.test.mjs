import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  BRAND, VENUES, initialBudget, applyVenuePackage, applyRebalance,
  applyGoalIncrease, applyBooking, fmtMoney, fmtK, SCRIPT, reachableBeats,
  matchInput,
} from './bow-model.js';

test('brand layer', () => {
  assert.equal(BRAND.name, 'the bow');
  assert.ok(BRAND.disclaimer.includes('Concept prototype'));
  assert.ok(!JSON.stringify(BRAND).toLowerCase().includes('knot'));
});

test('venues', () => {
  assert.equal(VENUES.length, 5);
  const ids = VENUES.map(v => v.id);
  assert.deepEqual(ids, ['willow', 'harborcrest', 'silverpines', 'bluehorizon', 'evergreen']);
  const willow = VENUES.find(v => v.id === 'willow');
  assert.equal(willow.name, 'Willow Shore Lodge');
  assert.equal(willow.quote, 7200);
  assert.equal(willow.rating, 4.5);
  assert.equal(willow.reviews, 118);
  assert.equal(willow.replied, true);
  assert.equal(VENUES.find(v => v.id === 'evergreen').replied, false);
});

test('initial budget: committed 17,500 exactly', () => {
  const b = initialBudget();
  assert.equal(b.goal, 40000);
  assert.equal(b.paid, 1700);
  const booked = b.items.filter(i => i.status === 'booked');
  assert.equal(booked.reduce((s, i) => s + i.amount, 0), 15800);
  assert.equal(b.paid + 15800, 17500);
  const planned = b.items.filter(i => i.status === 'planned');
  assert.equal(planned.reduce((s, i) => s + i.amount, 0), 6500);
  assert.equal(planned.length, 5);
  assert.equal(b.spent, 17500);
  assert.equal(b.projected, 24000); // 17,500 + 6,500 (no venue yet)
});

test('venue package: projected 51,300, over 11,300', () => {
  const b = applyVenuePackage(initialBudget());
  assert.equal(b.quoted.reduce((s, i) => s + i.amount, 0), 27300);
  assert.equal(b.projected, 51300);
  assert.equal(b.projected - b.goal, 11300);
  assert.equal(b.spent, 17500, 'spent chip must NOT move at add-to-budget');
});

test('rebalance: −6,900 → 44,400', () => {
  const b = applyRebalance(applyVenuePackage(initialBudget()));
  assert.equal(b.projected, 44400);
  assert.equal(b.quoted.find(i => i.label === 'Catering').amount, 12500);
  assert.equal(b.quoted.find(i => i.label === 'Service fees & tax').amount, 1550);
  assert.equal(b.items.find(i => i.label === 'Wedding dress').amount, 2500);
  assert.equal(b.items.find(i => i.label === 'Stationery').amount, 350);
  assert.equal(b.items.find(i => i.label === 'Cake & desserts').amount, 900);
});

test('goal increase: $600 under', () => {
  const b = applyGoalIncrease(applyRebalance(applyVenuePackage(initialBudget())));
  assert.equal(b.goal, 45000);
  assert.equal(b.goal - b.projected, 600);
});

test('booking: spent 23,100 on both negotiation branches', () => {
  const base = applyRebalance(applyVenuePackage(initialBudget()));
  const honored = applyBooking(base, 7200);
  assert.equal(honored.spent, 23100);
  assert.equal(honored.paid, 1700 + 5600);
  assert.equal(honored.projected, 44400);
  const unhonored = applyBooking(base, 7450);
  assert.equal(unhonored.spent, 23100, 'deposit is flat — spent identical');
  assert.equal(unhonored.projected, 44650);
});

test('formatting', () => {
  assert.equal(fmtMoney(1700), '$1,700');
  assert.equal(fmtK(17500), '$17.5k');
  assert.equal(fmtK(23100), '$23.1k');
  assert.equal(fmtK(40000), '$40k');
});

test('graph integrity', () => {
  const ids = Object.keys(SCRIPT);
  for (const [id, beat] of Object.entries(SCRIPT)) {
    for (const chip of beat.chips ?? []) {
      assert.ok(ids.includes(chip.goto), `${id} chip "${chip.label}" -> missing beat ${chip.goto}`);
    }
  }
  const reached = reachableBeats('home');
  for (const id of ids) {
    if (id === 'fallback') continue;
    assert.ok(reached.includes(id), `beat ${id} unreachable from home`);
  }
  // only the finale dead-ends
  for (const [id, beat] of Object.entries(SCRIPT)) {
    if (id === 'booked-finale') continue;
    assert.ok((beat.chips ?? []).length > 0 || beat.autoGoto, `beat ${id} dead-ends`);
  }
});

test('Act 1 copy pins', () => {
  assert.ok(SCRIPT['venue-results'].blocks[0].md.startsWith(
    'While you were offline, I cross-checked your 150-guest head-count'));
  assert.ok(SCRIPT['venue-results'].blocks[0].md.includes('**Saturday • Sept 20 2026**'));
  assert.equal(SCRIPT['venue-results'].userBubble, 'Tell me about the venues you found!');
  assert.ok(SCRIPT['accessibility-draft'].userBubble.startsWith(
    'I don’t see specific answers about wheelchair accessibility.'));
  assert.ok(SCRIPT['accessibility-draft'].blocks[0].md.startsWith(
    'Absolutely — here’s a ready-to-send draft.'));
});

test('Act 2/3 copy pins', () => {
  assert.ok(SCRIPT['reply-summary'].blocks[0].md.startsWith(
    'Four venues replied to your accessibility note'));
  assert.ok(SCRIPT['recommendation'].blocks[0].md.includes('**Willow Shore Lodge**'));
  assert.ok(SCRIPT['recommendation'].blocks[0].md.includes(
    'Equally accessible and weather-proof, but one day earlier.'));
  assert.ok(SCRIPT['quote-breakdown'].blocks[0].md.includes('**$27,300**'));
  assert.ok(SCRIPT['budget-added'].blocks[0].md.includes('**$51,300**'));
  assert.ok(SCRIPT['budget-added'].blocks[0].md.includes('**$11,300 over**'));
  assert.ok(SCRIPT['goal-increase'].blocks[0].md.includes('$600 under'));
  assert.ok(SCRIPT['contract-flag'].blocks[0].md.includes('**$7,450**'));
  assert.equal(SCRIPT['booked-finale'].chips.length, 1);
  assert.equal(SCRIPT['booked-finale'].chips[0].goto, 'home');
});

test('graph has no stubs', () => {
  assert.ok(!JSON.stringify(SCRIPT).includes('TEMP'));
});

test('permission-first negotiation', () => {
  const labels = SCRIPT['contract-flag'].chips.map(c => c.label);
  assert.ok(labels.some(l => l.includes('negotiate')), 'agent asks before negotiating');
  assert.ok(labels.some(l => l.toLowerCase().includes('proceed')));
});

test('matcher', () => {
  assert.equal(matchInput('what about wheelchair accessibility?', 'willow-detail'), 'accessibility-draft');
  assert.equal(matchInput('tell me about the venues you found', 'home'), 'venue-results');
  assert.equal(matchInput('hold willow shore', 'recommendation'), 'hold-willow');
  assert.equal(matchInput('xyzzy plugh', 'home'), null);
  // never returns an unreachable beat: booking flow not reachable from home
  assert.equal(matchInput('book willow shore lodge', 'home'), null);
  // regression: stopwords alone must not score ("the" appears in hold-willow's
  // "hold the date" match key and used to count as a hit)
  assert.equal(matchInput("what's the weather like", 'recommendation'), null);
});
