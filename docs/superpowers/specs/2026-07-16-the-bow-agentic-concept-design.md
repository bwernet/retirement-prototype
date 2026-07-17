# the bow — agentic wedding-marketplace concept (Experiments)

**Date:** 2026-07-16 · **Status:** Draft for author review

A semi-working, self-contained web prototype of an agent-first wedding-planning
marketplace, rebuilt from Beth's 9 prototype screens. Ships in the Experiments
section of her portfolio. The interaction model demonstrates five principles:
chat-to-collaboration, proactive by design, transparent autonomy, embedded in
the experience, empathy + efficiency.

## Locked decisions (author, 2026-07-16)

- **Interaction:** scripted storyline engine — no LLM, no server. Chips and
  free-typed input both advance scripted beats.
- **Scope:** full storyline arc. Acts 1–2 from the 9 screens; Act 3 (tour →
  negotiation → booking) extrapolated by us in the established visual language,
  author art-directs.
- **Shape:** guided free-play — one continuous session that feels like a live
  product. No chapter nav, no linear "next" affordance.
- **Time jump:** cinematic interstitial after messages are sent.
- **Framing:** drop straight into the product. Small corner pill carries the
  concept disclaimer and the reset control.
- **Branding: whitelabeled as "the bow."** The original prototype was created
  while advising The Knot on AI strategy (no NDA, but client-engagement
  discretion applies). Brand ships as a swappable token layer (name, wordmark
  SVG, palette) so the real brand can be restored in one commit if written
  permission is obtained later. Experiments copy: "an interaction-model concept
  developed while advising a leading wedding-planning marketplace on AI
  strategy."
- **Name collision check (2026-07-16):** "the bow" — no exact-name wedding
  business found (adjacent: Tie A Bow, Tied With a Bow, bow & arrow weddings —
  all distinct). Rejected for collisions: the toast, the garland, cordially,
  the vow (The Vow Wedding Hub), the sash, the veil. Runner-up cleared names:
  the toss, the ribbon.
- **Assets:** placeholder photography sourced by us (free-license, compressed,
  base64-embedded). No Knot assets anywhere.

## Files & rails

- `the-bow.html` — markup, CSS, view/render logic (inline module script).
- `bow-model.js` — pure, node-testable: `BRAND` tokens, `SCRIPT` beat graph,
  `VENUES`, `BUDGET` model + arithmetic, `matchInput()` keyword matcher.
- `the-bow.test.mjs` — node test suite (below).
- `bow-fonts.css` — base64-embedded free fonts (heading/body: a chunky
  grotesque approximating the prototype face, e.g. Figtree; exact face chosen
  at build). Wordmark is a custom SVG script "the bow" whose *w* tail loops
  into a small ribbon bow — no font dependency.
- `build.mjs` — new block inlining fonts + model into `dist/the-bow.html`
  (same drift-guard pattern as brand-system).
- Hosted on the existing GitHub Pages site; linked **full-page** from the
  Experiments section (it is a full-viewport app, not an iframe artifact).
  No postMessage height reporting needed.

## App shell

Persistent chrome in every state, matching the screens:

- **Left icon rail** (~80px): hamburger; AI (sparkle, active); Plan; Inspo;
  Guests; Vendors; Website; Registry. Bottom: chat bubble with badge "4",
  couple avatar photo.
- **Top bar:** wordmark left; right chip row — 📅 9/20/26 · 👥 125 guests ·
  📍 Columbus, OH · 🐷 **$17.5k spent | $40k budget**. The spent chip is live
  state; it changes only when money is actually committed (see budget model).
- **Main canvas layouts:** (1) home dashboard; (2) full-width chat thread with
  title bar + back arrow; (3) split: narrow chat rail left + side panel right
  (venue detail / message composer / budget overview), panel slides in;
  (4) full-screen interstitial.
- **Corner pill** (bottom-right, quiet): "Concept prototype — not affiliated
  with any marketplace · Restart". Restart resets all state to Beat 0.

## Storyline (beat graph)

State advances by chip click, matched free text, or panel CTA. Chat transcripts
accumulate per thread; back arrow returns to home with state preserved.

**Act 1 — Search & outreach** *(screens 4→3→2→1 of batch 1)*

- **B0 · Home, fresh state.** 355 days to go; stats strip (40k budget · 0
  vendors saved · 0 website visitors · 0 attending); "Hello Tony & Carmella!
  What can I help with?"; ask-anything input with three suggestion rows;
  6 proactive cards (venue / catering / inspiration / budget / logistics /
  vendors). Entry to B1: "Find perfect venues…" row, venue card "Compare
  spaces", or typed input.
- **B1 · Venue results thread** ("Accessible lake-view venues with indoor
  backup"): user bubble → agent streams the "While you were offline, I
  cross-checked your 150-guest head-count…" message → numbered 5-venue list
  with per-venue "Tell me more" chips → "Take a closer look" card carousel →
  "Next moves" block with monitoring note.
- **B2 · Venue detail panel** (Willow Shore Lodge): photo grid, "Free on
  9/20/26", 4.5 ★ 118 reviews, personalized quote $7,200 / 101–150 guests,
  About copy, "Why it's perfect" sidebar (5 bullets incl. 72-hour courtesy
  hold), follow-up question chips. Other venues' "Tell me more" produce a
  short in-chat summary + redirect (only Willow Shore gets a full panel).
- **B3 · Accessibility ask → composer.** User bubble ("I don't see specific
  answers about wheelchair accessibility…") → agent "Absolutely — here's a
  ready-to-send draft…" → composer panel: subject/body with token pills
  (Venue Name, Coordinator First Name), the 5-point accessibility checklist
  body verbatim, 5 recipient venue chips (removable), pink **Message (5)
  venues** button.
- **B4 · Send → interstitial.** Send confirmation beat, then full-screen
  interstitial: quiet, restrained ("Messages sent · I'll keep watch — 3 days
  later…" with a single subtle progress moment; no looping animation), then
  home in responded state.

**Act 2 — Replies & decision** *(screens 3→2→4→5→1 of batch 2)*

- **B5 · Home, responded state.** Venue card replaced by "4 venues responded
  to accessibility enquiry" + New! pill → "Summarize & compare". Other cards
  rotate (save-the-dates, Friday price trend).
- **B6 · Reply summary thread** ("Vendor reply summary and accessibility
  comparison"): intro line, then reply cards — Willow Shore ✅ Full access,
  quote $7,200, available Sept 20; Harborcrest 🚫 No elevator to reception,
  $6,800; Silver Pines ⚠️ partial (gravel paths — short extrapolated card);
  Blue Horizon ✅ full access rooftop, **unavailable Sept 20, next open
  Sept 19**. Each: View full reply (modal with full message) + Hold date.
- **B7 · My Recommendation:** Willow Shore vs Blue Horizon bullets, chips:
  Compare side by side / Hold Willow Shore Lodge / Hold Blue Horizon Club.
  (Compare produces a compact two-column comparison block in-chat.)
- **B8 · Hold Willow Shore.** Agent confirms the 72-hour courtesy hold
  (transparent: what a hold is, when it expires, nothing charged).
- **B9 · Quote breakdown** ("Break down what's included in the quote"):
  venue rental $7,200 / catering $18,000 / service fees & tax $2,100 →
  total **$27,300**; chips: Add to my budget / Ask for a more itemized
  quote / Estimate add-ons.
- **B10 · Add to budget → budget panel.** Budget Overview slides in (goal
  $40,000, projected bar, My budget items). Agent: "I've added these
  amounts…" with the over-budget framing and chips: Rebalance existing
  budget / Increase total budget / See cost saving ideas.
- **B11 · Rebalance works.** Rebalance: agent proposes specific trims
  (e.g. band→DJ-only, florist scope), items animate to new values, projected
  returns under $40k → this is the "embedded in the experience" payoff.
  Increase: goal moves to $52k with a gentle check-in. Cost ideas: 3 concrete
  ideas in-chat. All three converge on B12.

**Act 3 — Tour, negotiation, booking** *(extrapolated; author art-directs)*

- **B12 · Tour offer.** Agent: coordinator Maya has three slots → three
  time-slot chips → confirmation card (calendar-added state, what to look
  for during the visit re: accessibility — ties back to the family member).
- **B13 · Second interstitial** ("Two weeks later — you toured Willow Shore
  on Oct 3") → **contract beat:** contract came in at **$7,450** — $250 above
  quote (peak-Saturday fee). Transparent autonomy: agent asks permission
  before negotiating. On yes → short "working" beat → outcome: venue honors
  **$7,200** and adds rehearsal-hour access; "View the exchange" reveals a
  summarized thread (permission → ask → concession), never hidden.
- **B14 · Booking.** Contract summary card (total $27,300 · deposit **$5,600**
  due now · balance schedule) → "Book Willow Shore Lodge" → restrained
  celebration beat; header spent chip counts up **$17.5k → $23.1k**; vendors
  saved 0 → 1; budget bar's Paid segment grows; final agent message closes the
  loop (what it will keep monitoring next) + Start over affordance.
- **Fallback beat (any state):** unmatched typed input → in-character: "In
  this concept I'm focused on Tony & Carmella's venue story — here's what I
  can do right now" + current beat's chips. Never a dead end.

## Engine

- `SCRIPT` is a map of beats: `{ id, thread, userBubble?, blocks: [...],
  chips: [{label, goto}], panel?, effects?: [...], match: [keywords] }`.
  Blocks are typed (text / venueList / carousel / replyCard / recommendation /
  breakdown / comparison / contractCard / slots) and rendered by small view
  functions.
- Agent text streams word-by-word at a restrained pace with a typing
  indicator first; chips appear only after the stream completes. A
  skip-on-click affordance completes the stream instantly.
- `matchInput(text, state)` keyword-scores beats reachable from the current
  state (plus global entries like "budget"); below threshold → fallback beat.
- Effects mutate the single state object: header chips, budget model,
  interstitial trigger, home-state swap, stats strip.
- `prefers-reduced-motion`: streams render instantly, interstitial becomes a
  simple cross-fade, count-ups snap.

## Canonical budget model (normalizations — REVIEW CLOSELY)

The prototype's filler numbers don't reconcile; this model keeps the most
prominent figures exact and derives the rest. Semantics: **spent chip = paid +
booked. "Add to my budget" plans costs (projected moves); only booking moves
the spent chip.** This is itself a transparent-autonomy statement.

| Figure | Screens say | Canonical | Note |
|---|---|---|---|
| Goal budget | $40,000 | **$40,000** | kept |
| Venue package | 7,200 + 18,000 + 2,100 = $27,300 | **kept exactly** | arithmetic already true |
| Header spent, pre-booking | $17.5k | **$17,500** = paid $1,700 + booked $15,800 | kept; exact |
| Booked breakdown | "Booked $18,180" | **$15,800** = photographer 6,000 + videographer 5,000 + florist 3,300 + DJ 1,500 | derived so header is exact; florist 4,000→3,300; DJ counted as booked |
| Paid | $1,700 | **$1,700** (deposits) | kept |
| Remaining planned items | "Remaining (6)", 8 cards, sum $28,500 | **Remaining (5)** = dress 3,000 + tux 1,000 + cake 1,000 + hair & makeup 900 + stationery 600 = **$6,500**; big-ticket cards (photographer, videographer, florist, DJ) move to a **Booked** row of the same grid | the 28.5k grid double-counted booked vendors; band cut (DJ kept) |
| Projected after venue add | $51,519 | **$51,300** = 17,500 + 27,300 + 6,500 | −$219 from screen copy; buys exact arithmetic everywhere |
| Over goal | ↑$9,519 / "leaving $18,450 remaining" | **↑$11,300 over** | screen said both over AND remaining; canonical picks over |
| Budget bar | Paid/Booked/Est. remaining | 4 segments: Paid 1,700 · Booked 15,800 · **Quoted (venue, awaiting contract) 27,300** · Planned 6,500, with $40k marker | "Quoted" segment is new — makes the agent's pending commitment visible |
| Header spent, post-booking | $23.1k (on budget screen) | **$23,100** reached at B14 booking = 17,500 + deposit **$5,600** | her $23.1k relocates from the budget screen to the booking payoff — and lands exactly |
| Budget panel meta | Miami · 09/28/2026 · 101–125 | Columbus, OH · 9/20/26 · 125 | filler normalized |
| Responder list | home card names Evergreen; recommendation compares Blue Horizon | responders = Willow Shore, Harborcrest, Silver Pines, **Blue Horizon**; Evergreen never replies | realistic — one venue just doesn't answer |
| Rebalance outcome | — | trims total **−$6,900** → projected **$44,400**: catering plated→chef stations at the real 125 headcount 18,000→12,500 (−5,500); fees & tax recomputed 2,100→1,550 (−550); dress 3,000→2,500, stationery 600→350, cake 1,000→900 (−850). Agent is honest that trims alone can't close the gap and offers the fork: raise goal to **$45,000** (→ "$600 under your new target") or restart the search with under-$6k venues (redirects to Silver Pines mention, converges back) | amended 2026-07-16: the original "$39,800 via trims" was unreachable without silently cutting booked vendors — the honest fork is a better empathy+efficiency beat |

All other on-screen copy ships verbatim from the screens and is test-pinned.

## Visual system

- **Tokens (from screenshots):** cream canvas ≈ #FBF1E6; white cards, radii
  ~24/16; near-black ink; brand pink CTA ≈ #FF3EB4; user-bubble pink ≈
  #FBD9F2; chip gradient pink→blue; gradient focus ring on the ask-anything
  input; category label colors (VENUE pink, CATERING orange, INSPIRATION blue,
  BUDGET green, LOGISTICS orange, VENDORS pink, PAPER orange); budget-bar
  magentas (deep #A50064 / hot #FF3EB4 / pale #FBD9F2); star gold. Exact
  values sampled from the PNGs at build; all live in `BRAND`.
- **Emoji** (🐷 📅 ✅ 🚫 🎉 etc.) are part of this product's own voice — used
  exactly where the screens use them (status chips, stats strip, reply
  overviews, celebration). This is the product's brand, so the
  emoji-boundary rule from the Silvur artifacts does not restrict it.
- **Type:** one free chunky grotesque family, heavy for display ("Hello Tony
  & Carmella!"), regular/medium for body; base64-embedded.
- **Photos:** ~8 free-license images (lakeside venue hero, 4 gallery thumbs,
  2–3 alternate venue thumbs, couple avatar), compressed to ≤30KB each,
  base64; total page budget ≤ ~450KB.
- **Motion:** restrained per author taste — text streaming, panel slides,
  one count-up per act, single-play interstitials; nothing loops.

## Responsive

Desktop-first (the concept is a desktop product). Narrow (<760px): icon rail
collapses to a bottom bar or hamburger sheet; chat is full-screen; panels
become full-screen overlays with a close affordance; home cards stack. Fully
functional, not pixel-matched to the desktop screens.

## Accessibility (the story is literally about accessibility)

Keyboard: chips, cards, and panels tabbable in visual order; focus visible
(the gradient ring is already the design's focus language); panels trap focus
and restore it on close; streams announced via `aria-live="polite"` after
completion (not word-by-word). Reduced motion honored. Contrast: white-on-pink
CTA checked; if #FF3EB4 fails AA for its text size, darken stepwise (same rule
as the Silvur artifacts) and record the shipped value in `BRAND`.

## Tests (`the-bow.test.mjs`)

1. **Graph integrity:** every chip/goto target exists; every beat reachable
   from B0; only the final beat may dead-end; fallback defined for all states.
2. **Budget arithmetic:** every canonical figure above derived, not hardcoded
   twice — sums asserted (17,500; 27,300; 51,300; 44,400; 45,000; 23,100).
3. **Copy pins:** author-art-directed lines verbatim (the "While you were
   offline…" message, the composer body checklist, recommendation bullets,
   quote-breakdown lines, budget chat message with canonical numbers).
4. **Matcher:** "wheelchair accessibility" from B2 → B3; "budget" post-B9 →
   B10; gibberish → fallback; matcher never returns an unreachable beat.
5. **Brand layer:** no occurrence of the real client's name anywhere in
   `the-bow.html` / `bow-model.js` output; disclaimer pill text present.
6. **Build:** inline succeeds, no external network references in
   `dist/the-bow.html`.

## Out of scope

- Real LLM/chat backend; any server or analytics.
- Other nav destinations (Plan, Inspo, Guests, …) beyond hover/disabled
  affordances — clicking shows a quiet "not part of this concept" toast.
- Mobile pixel-parity with the desktop screens.
- The catering / décor / photographer proactive cards as working flows
  (their CTAs produce a short in-chat acknowledgment and return to the
  venue storyline).
