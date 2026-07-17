// Content integrity for the-bow.html. Run: node the-bow.test.mjs
import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync('the-bow.html', 'utf8');
const t = (name, fn) => { try { fn(); console.log('ok -', name); } catch (e) { console.error('FAIL -', name); throw e; } };

t('whitelabel: client name absent', () => {
  assert.ok(!/knot/i.test(html));
});
t('disclaimer pill present', () => {
  assert.ok(html.includes('Concept prototype — not affiliated with any marketplace'));
});
t('home dashboard pins', () => {
  assert.ok(html.includes('355 DAYS TO GO!'));
  assert.ok(html.includes('Hello Tony &amp; Carmella! What can I help with?'));
  assert.ok(html.includes('Some things I’ve gathered for you while you were gone:'));
  assert.ok(html.includes('Ask anything'));
});
t('proactive cards (fresh state)', () => {
  for (const s of [
    '5 lake-view venues still free on 9/20/26',
    '4 farm-to-table chefs within budget',
    'Pulled 7 desert-chic décor ideas',
    'Saved you $1,200 on catering',
    'Weather watch: 20% rain risk on your wedding date',
    '10 photographers free on 9/20/26',
  ]) assert.ok(html.includes(s), s);
});
t('responded-state card', () => {
  assert.ok(html.includes('4 venues responded to accessibility enquiry'));
  assert.ok(html.includes('Willow Shore Lodge, Harborcrest Pavilion, Silver Pines Retreat, and Blue Horizon Club have sent over their accommodations and floor plans'));
});
console.log('the-bow.html content OK');
