// the bow — model layer for the agentic wedding-marketplace concept.
// Whitelabeled: never reference the real client's brand anywhere in this file.

export const BRAND = {
  name: 'the bow',
  disclaimer: 'Concept prototype — not affiliated with any marketplace',
  cream: '#FBF1E6', ink: '#171719', card: '#FFFFFF',
  pink: '#FF3EB4',        // decorative pink — chips/segments/gradients only, NOT for white text fills
  // pinkCTA: #FF3EB4 darkened (HSL lightness 62.16% → 44.16%, -18 pts in 1-pt
  // steps, hue/sat unchanged) until contrast(white, color) >= 4.5 (Task 12).
  // White-on-pinkCTA contrast = 4.5967:1 — passes WCAG AA for normal text.
  // Used ONLY for filled buttons/badges carrying white text (composer send
  // button, chat badge, avatar initials) — pale-pink chips keep dark ink
  // text and decorative pinks (bars, gradients) are unaffected.
  pinkCTA: '#E1008A',
  pinkDeep: '#A50064', pinkPale: '#FBD9F2', bubble: '#FBD9F2',
  chipPink: '#FDD5F0', chipBlue: '#D9E7FD',
  labelPink: '#E5309B', labelOrange: '#E88A00', labelBlue: '#2F80ED', labelGreen: '#1F9D55',
  gold: '#F5A623', grayText: '#6B6B74', line: '#E8E0D6',
};

export const VENUES = [
  { id: 'willow', name: 'Willow Shore Lodge', priceK: '$7.2 k', quote: 7200,
    blurb: 'lakeside vows, glass-wall hall for rain',
    fit: 'Lakeside ceremony with a glass-walled hall for a beautiful rain backup.',
    rating: 4.5, reviews: 118, capacity: 200, setting: 'Lakefront lawn + pavilion',
    rainPlan: 'Covered pavilion', replied: true, access: 'full',
    accessLabel: 'Full access',
    accessQuote: 'Fully ADA-compliant across ceremony, reception, and restroom areas. Ramps and level paths throughout; elevator to upper level; accessible parking near both entrances.',
    availability: 'Available Sept 20, 2026', photo: 'willowHero' },
  { id: 'harborcrest', name: 'Harborcrest Pavilion', priceK: '$6.8 k', quote: 6800,
    blurb: 'open-air deck + vaulted interior, in-house catering from $85/guest',
    fit: 'Open-air deck with vaulted interior and in-house catering in your budget range.',
    rating: 4.3, reviews: 86, capacity: 175, setting: 'Waterfront deck',
    rainPlan: 'Vaulted interior hall', replied: true, access: 'none',
    accessLabel: 'No elevator to reception',
    accessQuote: 'The ceremony deck is ramp-accessible, but the indoor ballroom (used for receptions) is on the second floor with stair-only access. We\'re happy to provide staff assistance for guests using mobility devices, though there is no elevator on-site.',
    availability: 'Available Sept 20, 2026', photo: 'harborcrest' },
  { id: 'silverpines', name: 'Silver Pines Retreat', priceK: '$5.9 k', quote: 5900,
    blurb: 'meadow ceremony, rustic barn backup, BYO bar OK',
    fit: 'Meadow setting for your ceremony with a rustic barn and BYO bar option.',
    rating: 4.6, reviews: 74, capacity: 160, setting: 'Meadow + barn',
    rainPlan: 'Rustic barn', replied: true, access: 'partial',
    accessLabel: 'Partial access',
    accessQuote: 'The barn and restrooms are at grade level with wide doorways. The meadow ceremony site is reached by a 200-foot gravel path — wheelchairs can manage with assistance, and we can arrange a golf-cart shuttle on request.',
    availability: 'Available Sept 20, 2026', photo: 'silverpines' },
  { id: 'bluehorizon', name: 'Blue Horizon Club', priceK: '$9.1 k', quote: 9100,
    blurb: 'private dock photos, ballroom til 11 pm',
    fit: 'Rooftop ceremony that stays weather-proof without losing the view.',
    rating: 4.7, reviews: 92, capacity: 250, setting: 'Private rooftop terrace',
    rainPlan: 'Retractable canopy system', replied: true, access: 'full',
    accessLabel: 'Full access',
    accessQuote: 'All guest areas — including the rooftop terrace, restrooms, and ballroom — are fully accessible. Elevators connect all floors, flooring is smooth and level, and accessible parking is adjacent to the main entrance. The rooftop canopy closes automatically during rain.',
    availability: 'Unavailable Sept 20 · next open Sept 19', photo: 'bluehorizon' },
  { id: 'evergreen', name: 'Evergreen Point Estate', priceK: '$8.4 k', quote: 8400,
    blurb: 'manicured-lawn vows, 1930s mansion reception',
    fit: 'Garden vows with a grand 1930s mansion fallback if the weather turns.',
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
      // pre-quote placeholder for the biggest line item — keeps the projected
      // total realistically close to the goal ($38k vs $40k) until the real
      // quotes land; applyVenuePackage replaces it with the quoted actuals,
      // which is the moment the budget tips over the goal (author 2026-07-17)
      { label: 'Venue & catering', icon: '\u{1F3DB}️', amount: 14000, status: 'planned' },
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
  // the quoted actuals supersede the pre-quote estimate line:
  // 38,000 - 14,000 + 27,300 = 51,300 — the tip-over-goal moment
  n.items = n.items.filter(i => i.label !== 'Venue & catering');
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
    'My partner and I are considering [Venue Name] for our September 20 2026 wedding (about 150 guests). To ensure every family member can celebrate comfortably — especially those who use wheelchairs or other mobility aids — we’d love to confirm a few details:',
    '1. Ceremony & reception access – ramps, elevators, or grade-level paths to all primary spaces',
    '2. Restrooms – location and width of wheelchair-accessible stalls near each area',
    '3. Doorway & aisle clearances – minimum widths for entry points and dining layouts',
    '4. Parking / drop-off – number of accessible spots and distance to the main entrance',
    '5. Any additional considerations – floor surfaces, stage access, or policies we should know',
    'If you have photos, floor plans, or ADA documentation handy, that would be incredibly helpful. Happy to jump on a quick call if easier.',
    'Thank you for your time — I look forward to hearing from you!',
    'Best,\nTony & Carmella\n[Phone • Email]',
  ],
};

export const SCRIPT = {
  home: {
    // Rendered from markup, not chat. chips here model the suggestion rows + card CTAs.
    chips: [
      { label: 'Find perfect venues still available for my wedding dates', goto: 'venue-results' }, // PIN
      { label: 'Find places in my budget I could save', goto: 'venue-results' }, // PIN (redirect beat opener acknowledges)
      { label: 'Summarize the (4) vendor responses I’ve gotten', goto: 'venue-results' }, // PIN — pre-replies this redirects to search
      { label: 'Compare spaces', goto: 'venue-results' },
    ],
    match: ['venue', 'venues', 'lake', 'find', 'available', 'search'],
  },

  'venue-results': {
    thread: 'Accessible lake-view venues with indoor backup', // PIN
    userBubble: 'Tell me about the venues you found!', // PIN
    blocks: [
      { t: 'text', md: 'While you were offline, I cross-checked your 150-guest head-count, your $9 k venue cap, and your “must-have indoor backup” rule against every lake-view property within 30 mi. Then I pinged each venue’s live calendar to confirm they still hold **Saturday • Sept 20 2026**.\n\nHere are the five that cleared every filter — no last-minute surprises:' }, // PIN
      // author round 2026-07-17 (option D): the ranked card carousel IS the
      // list — rank badges + blurbs live on the cards, no separate text rows
      { t: 'carousel' },
      { t: 'text', md: '**Next moves (pick one or just tell me):**\n*(I’ll keep monitoring in case one books out — if availability changes you’ll get an alert.)*' }, // PIN
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
    // author round 2026-07-17: 'tell me more' is an explicit ask for why this
    // fits THEM — answered in chat; opening the card is free exploration and
    // opens the side panel instead. The two never happen at once.
    blocks: [{ t: 'text', md: 'Here’s why it stood out for you:\n\n• Your must-have indoor backup, solved — the terrace’s glass-walled ballroom keeps the lake in view, rain or shine\n• Seats 150 comfortably, so your whole list fits without rentals\n• **$7,200** quoted — $1,800 under your venue cap\n• BYO bar allowed, which keeps beverage costs in your control\n\nI’m holding **Sat · Sept 20 2026** with a 72-hour courtesy hold. Tap its card whenever you want the full profile.' }],
    chips: [
      { label: 'What Saturdays in September 2026 are still open besides the 20th?', goto: 'willow-saturdays' }, // PIN
      { label: 'I don’t see answers about wheelchair accessibility — ask all 5 venues', goto: 'accessibility-draft' },
    ],
    match: ['willow', 'tell me more', 'detail'],
  },

  'willow-saturdays': {
    thread: 'Accessible lake-view venues with indoor backup',
    userBubble: 'What Saturdays in September 2026 are still open besides the 20th?', // PIN
    blocks: [{ t: 'text', md: 'Willow Shore’s calendar shows two other open Saturdays that month: **Sept 5** and **Sept 26**. The 12th is booked and the 19th just went to a courtesy hold. Your 72-hour hold on the 20th is still active — want me to keep it?' }],
    chips: [
      { label: 'Keep my hold on the 20th', goto: 'accessibility-nudge' },
      { label: 'Ask all five about wheelchair accessibility', goto: 'accessibility-draft' },
    ],
    match: ['saturday', 'september', 'open dates'],
  },

  'accessibility-nudge': {
    thread: 'Accessible lake-view venues with indoor backup',
    blocks: [{ t: 'text', md: 'Done — the hold on **Sat · Sept 20 2026** stays active. One thing I noticed: none of the five listings answer your wheelchair-accessibility questions directly. Want me to ask all of them at once?' }],
    chips: [{ label: 'Yes — draft a message to all 5', goto: 'accessibility-draft' }],
    match: ['keep', 'hold'],
  },

  'accessibility-draft': {
    thread: 'Accessible lake-view venues with indoor backup',
    userBubble: 'I don’t see specific answers about wheelchair accessibility. Can you draft a message to all 5 asking about accessibility to all ceremony and reception spaces?', // PIN
    blocks: [
      { t: 'text', md: 'Absolutely — here’s a ready-to-send draft. I’ll personalize the bracketed fields with each venue’s name and coordinator contact, then dispatch all five messages the moment you give the word.' }, // PIN
      { t: 'draftPreview' },
      { t: 'text', md: 'Let me know if you’d like any tweaks before I hit send, or edit directly.' }, // PIN
    ],
    panel: 'composer',
    chips: [{ label: 'Looks good — send it', goto: 'messages-sent' }],
    match: ['wheelchair', 'accessibility', 'accessible', 'ada', 'mobility'],
  },

  'messages-sent': {
    thread: 'Accessible lake-view venues with indoor backup',
    blocks: [{ t: 'text', md: 'All {N} messages are on their way — personalized for each venue and coordinator. I’ll let you know the moment replies land, and I’ll keep watching availability in the meantime.' }], // {N} replaced at render with live recipient count (Task 9)
    effects: [{ e: 'interstitial', variant: 'sent' }, { e: 'homeState', state: 'responded' }],
    // the '3 days later' interstitial dismisses straight to the home dashboard
    // (author 2026-07-17) — no manual 'Back to home' tap
    chips: [],
    autoGoto: 'home-responded',
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
    blocks: [{ t: 'text', md: 'In this concept I’m focused on Tony & Carmella’s venue story — here’s what I can help with right now.' }],
    chips: [], // engine re-presents the current beat's chips after this text
    autoGoto: 'home',
  },

  'reply-summary': {
    thread: 'Vendor reply summary and accessibility comparison', // PIN
    userBubble: 'Summarize the replies to my vendor enquiry', // PIN
    blocks: [
      { t: 'text', md: 'Four venues replied to your accessibility note — here’s a quick summary of what each shared. You can click **View full reply** under any venue to read their full messages, see floor plans, or review photos they attached.' }, // PIN
      { t: 'replyCards' }, // renders the 4 replied venues from VENUES
      { t: 'recommendationHeading' },
    ],
    autoGoto: 'recommendation',
    chips: [],
    match: ['summarize', 'replies', 'vendor enquiry', 'compare'],
  },

  recommendation: {
    thread: 'Vendor reply summary and accessibility comparison',
    blocks: [
      { t: 'text', md: '**My Recommendation**\n\nIf full accessibility and an outdoor ceremony are top priorities:\n\n• **Willow Shore Lodge** – Ideal natural setting, accessible, and available.\n• **Blue Horizon Club** – Equally accessible and weather-proof, but one day earlier.\n\nWould you like me to hold those dates and request detailed quotes for both?' }, // PIN
    ],
    chips: [
      { label: 'Compare Willow Shore Lodge and Blue Horizon Club Side by side', goto: 'compare-side' }, // PIN
      { label: 'Hold Willow Shore Lodge', goto: 'hold-willow' }, // PIN
      { label: 'Hold Blue Horizon Club', goto: 'hold-blue' }, // PIN
    ],
    match: ['recommend', 'which one', 'best'],
  },

  'compare-side': {
    thread: 'Vendor reply summary and accessibility comparison',
    userBubble: 'Compare Willow Shore Lodge and Blue Horizon Club Side by side',
    blocks: [
      { t: 'comparison' }, // two-column block: date, setting, capacity, access, rain plan, quote
      { t: 'text', md: 'The real trade is the **date**: Willow Shore keeps your Sept 20, Blue Horizon means moving to Friday the 19th — and Friday venues in your area trend 20–30% cheaper, so there’s room to negotiate if you’re flexible.' },
    ],
    chips: [
      { label: 'Hold Willow Shore Lodge', goto: 'hold-willow' },
      { label: 'Hold Blue Horizon Club', goto: 'hold-blue' },
    ],
    match: ['side by side', 'compare'],
  },

  'hold-blue': {
    thread: 'Vendor reply summary and accessibility comparison',
    userBubble: 'Hold Blue Horizon Club',
    blocks: [{ t: 'text', md: 'One catch: Blue Horizon can’t do your date — their next opening is **Friday, September 19**. I can hold the 19th, but before you move your date for a venue, it’s worth deciding if Willow Shore gets you everything without the switch. Nothing is charged either way.' }],
    chips: [
      { label: 'Hold Willow Shore Lodge instead', goto: 'hold-willow' },
      { label: 'Compare them side by side', goto: 'compare-side' },
    ],
    match: ['blue horizon', 'hold blue'],
  },

  'hold-willow': {
    thread: 'Vendor reply summary and accessibility comparison',
    userBubble: 'Hold Willow Shore Lodge',
    blocks: [{ t: 'text', md: 'Done — your **72-hour courtesy hold** on Willow Shore Lodge for **Sat · Sept 20 2026** is confirmed with Maya, their events coordinator. It expires Thursday at 5 pm, nothing is charged, and you can release it anytime. While it’s active, want to look at what their $7,200 quote actually covers?' }],
    chips: [{ label: 'Break down what’s included in the quote', goto: 'quote-breakdown' }], // PIN
    match: ['hold willow', 'hold the date', 'willow shore'],
  },

  'quote-breakdown': {
    thread: 'Vendor reply summary and accessibility comparison',
    userBubble: 'Break down what’s included in the quote', // PIN
    blocks: [
      { t: 'text', md: 'Here’s what Willow Shore Lodge included in their estimate:\n\n• **Venue rental ($7,200)** – covers full-day use of ceremony lawn, pavilion, and reception hall, plus setup and teardown staff.\n• **Catering ($18,000)** – includes appetizers, entrée options for 150 guests, non-alcoholic beverages, linens, flatware, and serving staff. Alcohol packages are separate.\n• **Service fees & tax ($2,100)** – standard 10% service fee plus local tax on food and beverage.\n\nThe total of **$27,300** represents the core event cost, but add-ons like bar service, décor, or coordination would be additional as soon as they confirm.\n\nWould you like me to:\n\n• Add these details to your budget now,\n• Ask the venue for a more itemized quote, or\n• Estimate add-ons (like bar or rentals) to see the full picture?' }, // PIN
    ],
    chips: [
      { label: 'Add to my budget', goto: 'budget-added' }, // PIN
      { label: 'Ask the venue for a more itemized quote', goto: 'itemized-quote' }, // PIN
      { label: 'Estimate add-ons (like bar or rentals)', goto: 'estimate-addons' }, // PIN
    ],
    match: ['quote', 'included', 'breakdown', 'estimate'],
  },

  'itemized-quote': {
    thread: 'Vendor reply summary and accessibility comparison',
    userBubble: 'Ask the venue for a more itemized quote',
    blocks: [{ t: 'text', md: 'Sent — I asked Maya for a line-item version splitting rental, staffing, per-guest catering, and every fee. Venues usually turn these around in a day or two; I’ll flag it when it lands. Meanwhile, want the current numbers in your budget so you can see the whole picture?' }],
    chips: [{ label: 'Add to my budget', goto: 'budget-added' }],
    match: ['itemized'],
  },

  'estimate-addons': {
    thread: 'Vendor reply summary and accessibility comparison',
    userBubble: 'Estimate add-ons (like bar or rentals)',
    blocks: [{ t: 'text', md: 'Rough add-on ranges for a 125-guest evening at venues like Willow Shore:\n\n• **Bar service** – $2,800–$4,500 catered, or roughly half that if you use their BYO allowance\n• **Rentals** (lounge seating, heaters) – $600–$1,200\n• **Day-of coordination** – $1,500–$2,500\n\nNone of these are committed — they’re planning numbers. Want the core quote in your budget first so the add-ons have context?' }],
    chips: [{ label: 'Add to my budget', goto: 'budget-added' }],
    match: ['add-ons', 'bar', 'rentals'],
  },

  'budget-added': {
    thread: 'Vendor reply summary and accessibility comparison',
    userBubble: 'Add to my budget',
    blocks: [
      { t: 'text', md: 'I’ve added these amounts to your budget:\n\n• Venue: **$7,200**\n• Catering: **$18,000**\n• Fees & tax: **$2,100**\n\nYour total projected wedding cost is now **$51,300**, putting you **$11,300 over** your $40,000 target.\n\nWould you like me to:\n• Adjust your category allocations\n• Or recalculate other categories to stay balanced?' }, // PIN (numbers canonical per spec)
    ],
    panel: 'budget',
    effects: [{ e: 'budget', apply: 'package' }],
    chips: [
      { label: 'Rebalance existing budget', goto: 'rebalance' }, // PIN
      { label: 'Increase total budget', goto: 'goal-increase' }, // PIN
      { label: 'See cost saving ideas', goto: 'cost-ideas' }, // PIN
    ],
    match: ['budget', 'add to my budget'],
  },

  rebalance: {
    thread: 'Vendor reply summary and accessibility comparison',
    userBubble: 'Rebalance existing budget',
    blocks: [
      { t: 'text', md: 'Here’s what I can trim without touching anything you’ve booked:\n\n• **Catering** – switch plated dinner to chef stations and confirm your real 125 headcount: $18,000 → **$12,500**\n• **Service fees & tax** – recomputed on the smaller total: $2,100 → **$1,550**\n• **Dress / stationery / cake** – modest trims you flagged as flexible: −**$850**\n\nThat brings projected costs to **$44,400** — better, but honestly still **$4,400 over** your target. Trims alone can’t close the rest without cutting things you care about. Two real options:' },
    ],
    panel: 'budget',
    effects: [{ e: 'budget', apply: 'rebalance' }],
    chips: [
      { label: 'Raise my goal to $45k', goto: 'goal-increase' },
      { label: 'Restart the search with cheaper venues', goto: 'restart-search' },
    ],
    match: ['rebalance', 'adjust', 'allocations'],
  },

  'goal-increase': {
    thread: 'Vendor reply summary and accessibility comparison',
    userBubble: 'Raise my goal to $45k',
    blocks: [{ t: 'text', md: 'Updated — your goal budget is now **$45,000**, and with the rebalanced plan you’re **$600 under** it. I’ll warn you before anything pushes past the new target.\n\nThe hold on Willow Shore is still active. Want to see it in person before it expires?' }],
    panel: 'budget',
    effects: [{ e: 'budget', apply: 'goal' }],
    chips: [{ label: 'Set up a tour', goto: 'tour-offer' }],
    match: ['increase', 'raise', 'goal', '45'],
  },

  'cost-ideas': {
    thread: 'Vendor reply summary and accessibility comparison',
    userBubble: 'See cost saving ideas',
    blocks: [{ t: 'text', md: 'Three that fit your plans:\n\n• **Use Willow Shore’s BYO bar allowance** – typically saves couples $1,500–$2,500 versus a catered package\n• **Digital save-the-dates** – keeps stationery near $350\n• **Chef stations instead of plated dinner** – the single biggest lever at your headcount\n\nWant me to apply the ones that touch your budget?' }],
    panel: 'budget',
    chips: [{ label: 'Apply them — rebalance my budget', goto: 'rebalance' }],
    match: ['saving', 'cheaper', 'ideas'],
  },

  'restart-search': {
    thread: 'Vendor reply summary and accessibility comparison',
    userBubble: 'Restart the search with cheaper venues',
    blocks: [{ t: 'text', md: 'Fair — for reference, **Silver Pines Retreat** ($5,900) was the strongest budget option, though its meadow path is only partially wheelchair-friendly. Given your family’s needs, Willow Shore at the rebalanced **$44,400** with a $45k goal is the plan I’d stand behind. Your call — I can requery, or we keep momentum.' }],
    panel: 'budget',
    chips: [
      { label: 'Raise my goal to $45k and keep Willow Shore', goto: 'goal-increase' },
    ],
    match: ['restart', 'cheaper venues', 'silver pines'],
  },

  'tour-offer': {
    thread: 'Vendor reply summary and accessibility comparison',
    userBubble: 'Set up a tour',
    blocks: [
      { t: 'text', md: 'Maya has three openings while your hold is active:' },
      { t: 'slots' }, // Fri Oct 3 · 3:00 pm / Sat Oct 4 · 10:00 am / Sun Oct 5 · 1:00 pm
    ],
    chips: [
      { label: 'Fri Oct 3 · 3:00 pm', goto: 'tour-booked' },
      { label: 'Sat Oct 4 · 10:00 am', goto: 'tour-booked' },
      { label: 'Sun Oct 5 · 1:00 pm', goto: 'tour-booked' },
    ],
    match: ['tour', 'visit', 'see it'],
  },

  'tour-booked': {
    thread: 'Vendor reply summary and accessibility comparison',
    blocks: [{ t: 'text', md: 'Booked — you’re confirmed with Maya, and it’s on your calendar. Since accessibility is the deciding factor, I’ll send you a pocket checklist for the visit: doorway widths, the restroom nearest the pavilion, and the accessible-parking distance — so you can verify everything your family needs in person.' }],
    effects: [{ e: 'interstitial', variant: 'toured' }],
    chips: [{ label: 'Two weeks later…', goto: 'contract-flag' }],
    match: ['book the tour', 'friday', 'saturday', 'sunday'],
  },

  'contract-flag': {
    thread: 'Willow Shore Lodge — contract & booking',
    blocks: [{ t: 'text', md: 'Hope the tour sealed it — Maya sent the contract over this morning. One flag before you sign: the total came in at **$7,450** — $250 above the quoted $7,200, listed as a “peak Saturday fee.”\n\nThis is usually negotiable, and asking costs nothing. Want me to ask them to honor the original quote?' }],
    chips: [
      { label: 'Yes — negotiate it', goto: 'negotiate' },
      { label: 'It’s fine — proceed at $7,450', goto: 'proceed-asis' },
      { label: 'Show me the contract', goto: 'show-contract' },
    ],
    match: ['contract', 'negotiate', 'fee'],
  },

  'show-contract': {
    thread: 'Willow Shore Lodge — contract & booking',
    userBubble: 'Show me the contract',
    blocks: [{ t: 'contract', total: 'live' }], // renders from budget state + venueRental 7450
    chips: [
      { label: 'Yes — negotiate the $250 fee', goto: 'negotiate' },
      { label: 'It’s fine — proceed at $7,450', goto: 'proceed-asis' },
    ],
    match: ['show', 'contract'],
  },

  negotiate: {
    thread: 'Willow Shore Lodge — contract & booking',
    userBubble: 'Yes — negotiate it',
    blocks: [
      { t: 'text', md: 'Done — Maya confirmed they’ll **honor the $7,200 quote**, and she added a complimentary rehearsal hour on the Friday evening before. Here’s the exchange so you have the paper trail:' },
      { t: 'exchange' }, // collapsed 2-message summary: our ask → venue concession
      { t: 'contract', total: 'live' },
    ],
    effects: [{ e: 'negotiated', venueRental: 7200 }],
    chips: [{ label: 'Book Willow Shore Lodge', goto: 'book' }],
    match: ['negotiate', 'honor the quote'],
  },

  'proceed-asis': {
    thread: 'Willow Shore Lodge — contract & booking',
    userBubble: 'It’s fine — proceed at $7,450',
    blocks: [
      { t: 'text', md: 'Understood — proceeding at **$7,450**. The updated total is reflected below.' },
      { t: 'contract', total: 'live' },
    ],
    effects: [{ e: 'negotiated', venueRental: 7450 }],
    chips: [{ label: 'Book Willow Shore Lodge', goto: 'book' }],
    match: ['proceed', 'fine'],
  },

  book: {
    thread: 'Willow Shore Lodge — contract & booking',
    userBubble: 'Book Willow Shore Lodge',
    blocks: [{ t: 'text', md: 'Deposit paid: **$5,600**. Signing confirmed — sending you the countersigned copy now…' }],
    effects: [{ e: 'budget', apply: 'book' }, { e: 'stat', key: 'vendorsSaved', value: 13 }],
    autoGoto: 'booked-finale',
    chips: [],
    match: ['book it', 'sign'],
  },

  'booked-finale': {
    thread: 'Willow Shore Lodge — contract & booking',
    blocks: [{ t: 'text', md: 'It’s official — **Willow Shore Lodge is yours for September 20, 2026.** \u{1F389}\n\nYour deposit is in, the balance is split into two reminders I’ll surface when they’re due, and the rehearsal hour is on the calendar.\n\nHere’s what I’m watching next: catering tasting dates, the tent contingency if the forecast shifts, and your photographer shortlist. Go celebrate — I’ve got the rest.' }],
    panel: 'budget',
    chips: [{ label: 'Start over from the beginning', goto: 'home' }],
    match: [],
  },
};

// Non-content words never score on their own — beats like hold-willow carry
// "hold the date" in their match keys, and without this filter a stray "the"
// in any input would count as a hit. Phrase-bonus matching below still sees
// the full raw text, so multi-word keys like "tell me about" keep working.
const MATCH_STOPWORDS = new Set(['the', 'and', 'for', 'you', 'your', 'what', 'whats', 'with', 'like']);

export function matchInput(text, currentBeatId) {
  const words = text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').split(/\s+/)
    .filter(w => w.length > 2 && !MATCH_STOPWORDS.has(w));
  if (!words.length) return null;
  // Direct chip targets only: the whole graph is reachable from home, so a
  // wider net would let "book willow shore lodge" skip the entire story.
  const candidates = [...new Set((SCRIPT[currentBeatId]?.chips ?? []).map(c => c.goto))]
    .filter(id => id !== currentBeatId && id !== 'fallback');
  let best = null, bestScore = 0;
  for (const id of candidates) {
    const keys = (SCRIPT[id].match ?? []).join(' ').toLowerCase();
    let score = 0;
    for (const w of words) if (keys.includes(w)) score++;
    // phrase bonus: multi-word match keys that appear whole in the input
    for (const k of SCRIPT[id].match ?? []) {
      if (k.includes(' ') && text.toLowerCase().includes(k.toLowerCase())) score += 2;
    }
    if (score > bestScore) { bestScore = score; best = id; }
  }
  return bestScore >= 1 ? best : null;
}

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

// ---- evergreen dates (author 2026-07-17) -----------------------------------
// The wedding is always the third Saturday of whichever September makes the
// countdown closest to ~355 days, so the prototype never goes stale and the
// story's two date invariants hold by construction: the date is a Saturday
// (peak-Saturday fee, "Friday dates trend cheaper", Blue Horizon = the Friday
// before) and it's September in Columbus (lakeside venues, 76°/56°/20% rain).
// All source copy keeps the original screens' literal dates ("Sept 20 2026");
// liveDates() swaps them at render time, so the copy pins stay verbatim.

const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_MS = 86400000;

export function thirdSaturdayOfSeptember(year) {
  const sept1 = new Date(year, 8, 1);
  const firstSat = 1 + ((6 - sept1.getDay() + 7) % 7);
  return new Date(year, 8, firstSat + 14);
}

export const ordinal = n =>
  n + (n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][Math.min(n % 10, 4)] ?? 'th');

export function computeWedding(now = new Date()) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const candidates = [0, 1, 2].map(dy => thirdSaturdayOfSeptember(now.getFullYear() + dy))
    .map(d => ({ d, days: Math.round((d - today) / DAY_MS) }))
    .filter(c => c.days > 0);
  const pick = candidates.reduce((best, c) => Math.abs(c.days - 355) < Math.abs(best.days - 355) ? c : best);
  const W = pick.d, day = W.getDate(), year = W.getFullYear();
  const friday = new Date(year, 8, day - 1);

  // tour slots: the next Fri/Sat/Sun at least 2 days from today
  let fri = new Date(today.getTime() + (((5 - today.getDay() + 7) % 7) || 7) * DAY_MS);
  if ((fri - today) / DAY_MS < 2) fri = new Date(fri.getTime() + 7 * DAY_MS);
  const slot = d => `${DAYS_SHORT[d.getDay()]} ${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}`;

  // balance installments: ~45% and ~85% of the runway to the wedding
  const instD = f => new Date(today.getTime() + (W - today) * f);
  const m1 = instD(0.45), m2 = instD(0.85);
  const inst = m1.getFullYear() === m2.getFullYear()
    ? `${MONTHS_SHORT[m1.getMonth()]} & ${MONTHS_SHORT[m2.getMonth()]} ${m2.getFullYear()}`
    : `${MONTHS_SHORT[m1.getMonth()]} ${m1.getFullYear()} & ${MONTHS_SHORT[m2.getMonth()]} ${m2.getFullYear()}`;

  return {
    date: W, day, year, daysToGo: pick.days,
    chip: `${W.getMonth() + 1}/${day}/${String(year).slice(2)}`,               // 9/20/26
    story: `Sept ${day} ${year}`,                                              // Sept 20 2026
    long: `September ${day}, ${year}`,                                         // September 20, 2026
    longNC: `September ${day} ${year}`,                                        // September 20 2026 (composer)
    fridayLong: `September ${day - 1}, ${year}`,
    altOpen1: `Sept ${day - 14}`, altOpen2: `Sept ${day + 7}`,
    bookedOrd: ordinal(day - 7), holdOrd: ordinal(day - 1),
    dayOrd: ordinal(day),
    tourFri: slot(fri), tourSat: slot(new Date(fri.getTime() + DAY_MS)), tourSun: slot(new Date(fri.getTime() + 2 * DAY_MS)),
    installments: inst,
  };
}

export const WEDDING = computeWedding();

// swaps the source copy's canonical fallback dates for the live ones.
// Longest-match-first so partial strings never clobber longer ones.
export function liveDates(s, w = WEDDING) {
  return s
    .replace(/Saturday • Sept 20 2026/g, `Saturday • ${w.story}`)
    .replace(/Sat · Sept 20 2026/g, `Sat · ${w.story}`)
    .replace(/September 20, 2026/g, w.long)
    .replace(/September 20 2026/g, w.longNC)
    .replace(/September 2026/g, `September ${w.year}`)
    .replace(/Sept 20, 2026/g, `Sept ${w.day}, ${w.year}`)
    .replace(/Sept 20 2026/g, w.story)
    .replace(/9\/20\/26/g, w.chip)
    .replace(/\*\*Sept 5\*\* and \*\*Sept 26\*\*/g, `**${w.altOpen1}** and **${w.altOpen2}**`)
    .replace(/The 12th is booked and the 19th just went to a courtesy hold/g, `The ${w.bookedOrd} is booked and the ${w.holdOrd} just went to a courtesy hold`)
    .replace(/\*\*Friday, September 19\*\*/g, `**Friday, September ${w.day - 1}**`)
    .replace(/Friday the 19th/g, `Friday the ${w.holdOrd}`)
    .replace(/besides the 20th/g, `besides the ${w.dayOrd}`)
    .replace(/hold on the 20th/g, `hold on the ${w.dayOrd}`)
    .replace(/Fri Sept 19/g, `Fri Sept ${w.day - 1}`)
    .replace(/Fri Oct 3/g, w.tourFri)
    .replace(/Sat Oct 4/g, w.tourSat)
    .replace(/Sun Oct 5/g, w.tourSun)
    .replace(/toured Willow Shore on Oct 3/g, `toured Willow Shore on ${w.tourFri.slice(4)}`)
    .replace(/Apr & Aug 2026/g, w.installments)
    .replace(/355 days/g, `${w.daysToGo} days`)
    .replace(/355 DAYS/g, `${w.daysToGo} DAYS`)
    // generic tails — must run AFTER every longer variant above is consumed
    .replace(/September 20\b/g, `September ${w.day}`)
    .replace(/Sept 20\b/g, `Sept ${w.day}`)
    .replace(/Sept 19\b/g, `Sept ${w.day - 1}`);
}
