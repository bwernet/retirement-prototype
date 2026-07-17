// the bow — model layer for the agentic wedding-marketplace concept.
// Whitelabeled: never reference the real client's brand anywhere in this file.

export const BRAND = {
  name: 'the bow',
  disclaimer: 'Concept prototype — not affiliated with any marketplace',
  cream: '#FBF1E6', ink: '#171719', card: '#FFFFFF',
  pink: '#FF3EB4',        // CTA fill; Task 12 verifies AA for its text size, darkens if needed
  pinkDeep: '#A50064', pinkPale: '#FBD9F2', bubble: '#FBD9F2',
  chipPink: '#FDD5F0', chipBlue: '#D9E7FD',
  labelPink: '#E5309B', labelOrange: '#E88A00', labelBlue: '#2F80ED', labelGreen: '#1F9D55',
  gold: '#F5A623', grayText: '#6B6B74', line: '#E8E0D6',
};

export const VENUES = [
  { id: 'willow', name: 'Willow Shore Lodge', priceK: '$7.2 k', quote: 7200,
    blurb: 'lakeside vows, glass-wall hall for rain',
    rating: 4.5, reviews: 118, capacity: 200, setting: 'Lakefront lawn + pavilion',
    rainPlan: 'Covered pavilion', replied: true, access: 'full',
    accessLabel: 'Full access',
    accessQuote: 'Fully ADA-compliant across ceremony, reception, and restroom areas. Ramps and level paths throughout; elevator to upper level; accessible parking near both entrances.',
    availability: 'Available Sept 20, 2026', photo: 'willowHero' },
  { id: 'harborcrest', name: 'Harborcrest Pavilion', priceK: '$6.8 k', quote: 6800,
    blurb: 'open-air deck + vaulted interior, in-house catering from $85/guest',
    rating: 4.3, reviews: 86, capacity: 175, setting: 'Waterfront deck',
    rainPlan: 'Vaulted interior hall', replied: true, access: 'none',
    accessLabel: 'No elevator to reception',
    accessQuote: 'The ceremony deck is ramp-accessible, but the indoor ballroom (used for receptions) is on the second floor with stair-only access. We\'re happy to provide staff assistance for guests using mobility devices, though there is no elevator on-site.',
    availability: 'Available Sept 20, 2026', photo: 'harborcrest' },
  { id: 'silverpines', name: 'Silver Pines Retreat', priceK: '$5.9 k', quote: 5900,
    blurb: 'meadow ceremony, rustic barn backup, BYO bar OK',
    rating: 4.6, reviews: 74, capacity: 160, setting: 'Meadow + barn',
    rainPlan: 'Rustic barn', replied: true, access: 'partial',
    accessLabel: 'Partial access',
    accessQuote: 'The barn and restrooms are at grade level with wide doorways. The meadow ceremony site is reached by a 200-foot gravel path — wheelchairs can manage with assistance, and we can arrange a golf-cart shuttle on request.',
    availability: 'Available Sept 20, 2026', photo: 'silverpines' },
  { id: 'bluehorizon', name: 'Blue Horizon Club', priceK: '$9.1 k', quote: 9100,
    blurb: 'private dock photos, ballroom til 11 pm',
    rating: 4.7, reviews: 92, capacity: 250, setting: 'Private rooftop terrace',
    rainPlan: 'Retractable canopy system', replied: true, access: 'full',
    accessLabel: 'Full access',
    accessQuote: 'All guest areas — including the rooftop terrace, restrooms, and ballroom — are fully accessible. Elevators connect all floors, flooring is smooth and level, and accessible parking is adjacent to the main entrance. The rooftop canopy closes automatically during rain.',
    availability: 'Unavailable on September 20 — next open date: September 19, 2026', photo: 'bluehorizon' },
  { id: 'evergreen', name: 'Evergreen Point Estate', priceK: '$8.4 k', quote: 8400,
    blurb: 'manicured-lawn vows, 1930s mansion reception',
    rating: 4.4, reviews: 65, capacity: 180, setting: 'Manicured lawn + mansion',
    rainPlan: '1930s mansion ballroom', replied: false, access: null,
    accessLabel: null, accessQuote: null, availability: null, photo: 'evergreen' },
];

// ---- Budget ----------------------------------------------------------------
// Semantics: spent = paid + booked. "Add to my budget" fills `quoted` (projected
// moves); only booking moves paid/spent. Projected = paid + booked + quoted + planned.

export function initialBudget() {
  return {
    goal: 40000, paid: 1700,
    depositAgainstQuoted: 0,
    items: [
      { label: 'Photographer', icon: '\u{1F4F7}', amount: 6000, status: 'booked' },
      { label: 'Videographer', icon: '\u{1F3A5}', amount: 5000, status: 'booked' },
      { label: 'Florist', icon: '\u{1F33A}', amount: 3300, status: 'booked' },
      { label: 'DJ', icon: '\u{1F3B6}', amount: 1500, status: 'booked' },
      { label: 'Wedding dress', icon: '\u{1F470}', amount: 3000, status: 'planned' },
      { label: 'Tuxedo or suit', icon: '\u{1F935}', amount: 1000, status: 'planned' },
      { label: 'Cake & desserts', icon: '\u{1F370}', amount: 1000, status: 'planned' },
      { label: 'Hair & makeup', icon: '\u{1F484}', amount: 900, status: 'planned' },
      { label: 'Stationery', icon: '✉️', amount: 600, status: 'planned' },
    ],
    quoted: [], // venue package lands here at add-to-budget
    get spent() { return this.paid + this.items.filter(i => i.status === 'booked').reduce((s, i) => s + i.amount, 0); },
    get projected() {
      return this.paid - this.depositAgainstQuoted
        + this.items.reduce((s, i) => s + i.amount, 0)
        + this.quoted.reduce((s, i) => s + i.amount, 0);
    },
  };
}

const clone = b => Object.assign(Object.create(Object.getPrototypeOf(b), Object.getOwnPropertyDescriptors(b)), {
  items: b.items.map(i => ({ ...i })), quoted: b.quoted.map(i => ({ ...i })),
});

export function applyVenuePackage(b) {
  const n = clone(b);
  n.quoted = [
    { label: 'Venue rental', icon: '\u{1F3DB}️', amount: 7200 },
    { label: 'Catering', icon: '\u{1F37D}️', amount: 18000 },
    { label: 'Service fees & tax', icon: '\u{1F9FE}', amount: 2100 },
  ];
  return n;
}

export function applyRebalance(b) {
  const n = clone(b);
  n.quoted.find(i => i.label === 'Catering').amount = 12500;
  n.quoted.find(i => i.label === 'Service fees & tax').amount = 1550;
  n.items.find(i => i.label === 'Wedding dress').amount = 2500;
  n.items.find(i => i.label === 'Stationery').amount = 350;
  n.items.find(i => i.label === 'Cake & desserts').amount = 900;
  return n;
}

export function applyGoalIncrease(b) { const n = clone(b); n.goal = 45000; return n; }

export function applyBooking(b, venueRental) {
  const n = clone(b);
  n.quoted.find(i => i.label === 'Venue rental').amount = venueRental;
  n.paid += 5600; // flat deposit
  // Deposit is paid *against* the quoted package: move 5,600 of quoted into paid
  // without double-counting — represent by tracking depositAgainstQuoted.
  n.depositAgainstQuoted = 5600;
  return n;
}

export const fmtMoney = n => '$' + n.toLocaleString('en-US');
export const fmtK = n => {
  const k = n / 1000;
  return '$' + (Number.isInteger(k) ? k : k.toFixed(1)) + 'k';
};

export const COMPOSER = {
  subject: 'Accessibility details for [Venue Name] on September 20 2026', // PIN
  greeting: 'Hi [Coordinator First Name],', // PIN
  body: [ // PIN — every line verbatim from the screen
    "My partner and I are considering [Venue Name] for our September 20 2026 wedding (about 150 guests). To ensure every family member can celebrate comfortably — especially those who use wheelchairs or other mobility aids — we'd love to confirm a few details:",
    '1. Ceremony & reception access – ramps, elevators, or grade-level paths to all primary spaces',
    '2. Restrooms – location and width of wheelchair-accessible stalls near each area',
    '3. Doorway & aisle clearances – minimum widths for entry points and dining layouts',
    '4. Parking / drop-off – number of accessible spots and distance to the main entrance',
    '5. Any additional considerations – floor surfaces, stage access, or policies we should know',
    'If you have photos, floor plans, or ADA documentation handy, that would be incredibly helpful. Happy to jump on a quick call if easier.',
    'Thank you for your time — I look forward to hearing from you!',
    "Best,\nTony & Carmella\n[Phone • Email]",
  ],
};

export const SCRIPT = {
  home: {
    // Rendered from markup, not chat. chips here model the suggestion rows + card CTAs.
    chips: [
      { label: 'Find perfect venues still available for my wedding dates', goto: 'venue-results' }, // PIN
      { label: 'Find places in my budget I could save', goto: 'venue-results' }, // PIN (redirect beat opener acknowledges)
      { label: 'Summarize the (4) vendor responses I\'ve gotten', goto: 'venue-results' }, // PIN — pre-replies this redirects to search
      { label: 'Compare spaces', goto: 'venue-results' },
    ],
    match: ['venue', 'venues', 'lake', 'find', 'available', 'search'],
  },

  'venue-results': {
    thread: 'Accessible lake-view venues with indoor backup', // PIN
    userBubble: 'Tell me about the venues you found!', // PIN
    blocks: [
      { t: 'text', md: "While you were offline, I cross-checked your 150-guest head-count, your $9 k venue cap, and your \"must-have indoor backup\" rule against every lake-view property within 30 mi. Then I pinged each venue's live calendar to confirm they still hold **Saturday • Sept 20 2026**.\n\nHere are the five that cleared every filter — no last-minute surprises:" }, // PIN
      { t: 'venueList' }, // renders VENUES rows with per-venue "Tell me more" chips
      { t: 'text', md: '**Take a closer look:**' }, // PIN
      { t: 'carousel' },
      { t: 'text', md: "**Next moves (pick one or just tell me):**\n*(I'll keep monitoring in case one books out — if availability changes you'll get an alert.)*" }, // PIN
    ],
    chips: [
      { label: 'Tell me more about Willow Shore Lodge', goto: 'willow-detail' },
      { label: 'Ask all five about wheelchair accessibility', goto: 'accessibility-draft' },
    ],
    match: ['tell me about', 'venues you found', 'lake view'],
  },

  'willow-detail': {
    thread: 'Accessible lake-view venues with indoor backup',
    userBubble: 'Tell me more about Willow Shore Lodge',
    blocks: [{ t: 'text', md: "Here's the full picture on Willow Shore Lodge — I've opened it alongside so you can dig in." }],
    panel: 'venue',
    chips: [
      { label: 'What Saturdays in September 2026 are still open besides the 20th?', goto: 'willow-saturdays' }, // PIN
      { label: "I don't see answers about wheelchair accessibility — ask all 5 venues", goto: 'accessibility-draft' },
    ],
    match: ['willow', 'tell me more', 'detail'],
  },

  'willow-saturdays': {
    thread: 'Accessible lake-view venues with indoor backup',
    userBubble: 'What Saturdays in September 2026 are still open besides the 20th?', // PIN
    blocks: [{ t: 'text', md: "Willow Shore's calendar shows two other open Saturdays that month: **Sept 5** and **Sept 26**. The 12th is booked and the 19th just went to a courtesy hold. Your 72-hour hold on the 20th is still active — want me to keep it?" }],
    panel: 'venue',
    chips: [
      { label: 'Keep my hold on the 20th', goto: 'accessibility-nudge' },
      { label: 'Ask all five about wheelchair accessibility', goto: 'accessibility-draft' },
    ],
    match: ['saturday', 'september', 'open dates'],
  },

  'accessibility-nudge': {
    thread: 'Accessible lake-view venues with indoor backup',
    blocks: [{ t: 'text', md: "Done — the hold on **Sat · Sept 20 2026** stays active. One thing I noticed: none of the five listings answer your wheelchair-accessibility questions directly. Want me to ask all of them at once?" }],
    panel: 'venue',
    chips: [{ label: 'Yes — draft a message to all 5', goto: 'accessibility-draft' }],
    match: ['keep', 'hold'],
  },

  'accessibility-draft': {
    thread: 'Accessible lake-view venues with indoor backup',
    userBubble: "I don't see specific answers about wheelchair accessibility. Can you draft a message to all 5 asking about accessibility to all ceremony and reception spaces?", // PIN
    blocks: [
      { t: 'text', md: "Absolutely — here's a ready-to-send draft. I'll personalize the bracketed fields with each venue's name and coordinator contact, then dispatch all five messages the moment you give the word." }, // PIN
      { t: 'draftPreview' },
      { t: 'text', md: "Let me know if you'd like any tweaks before I hit send, or edit directly." }, // PIN
    ],
    panel: 'composer',
    chips: [{ label: 'Looks good — send it', goto: 'messages-sent' }],
    match: ['wheelchair', 'accessibility', 'accessible', 'ada', 'mobility'],
  },

  'messages-sent': {
    thread: 'Accessible lake-view venues with indoor backup',
    blocks: [{ t: 'text', md: "All {N} messages are on their way — personalized for each venue and coordinator. I'll let you know the moment replies land, and I'll keep watching availability in the meantime." }], // {N} replaced at render with live recipient count (Task 9)
    effects: [{ e: 'interstitial', variant: 'sent' }, { e: 'homeState', state: 'responded' }],
    chips: [{ label: 'Back to home', goto: 'home-responded' }],
    match: ['send', 'message the venues'],
  },

  'home-responded': {
    chips: [
      { label: 'Summarize & compare', goto: 'reply-summary' },
      { label: 'Summarize the replies to my vendor enquiry', goto: 'reply-summary' }, // PIN
    ],
    match: ['replies', 'responded', 'summarize', 'compare'],
  },

  fallback: {
    blocks: [{ t: 'text', md: "In this concept I'm focused on Tony & Carmella's venue story — here's what I can help with right now." }],
    chips: [], // engine re-presents the current beat's chips after this text
    autoGoto: 'home',
  },

  // TASK 3 replaces this stub
  'reply-summary': { blocks: [], chips: [{ label: 'TEMP', goto: 'home' }] },
};

export function reachableBeats(fromId) {
  const seen = new Set([fromId]);
  const queue = [fromId];
  while (queue.length) {
    const beat = SCRIPT[queue.shift()];
    for (const c of beat?.chips ?? []) if (!seen.has(c.goto)) { seen.add(c.goto); queue.push(c.goto); }
    if (beat?.autoGoto && !seen.has(beat.autoGoto)) { seen.add(beat.autoGoto); queue.push(beat.autoGoto); }
  }
  return [...seen];
}
