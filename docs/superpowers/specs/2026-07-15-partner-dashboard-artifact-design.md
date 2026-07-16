# Partner Dashboard — Member Actions to Campaign — Interactive Artifact — Design

Date: 2026-07-15

## Goal

An interactive artifact for the Silvur case study's B2B/platform chapter. One
foreground argument, communicated in ~2 minutes:

**Member actions inside the platform became actionable benefit for the credit
union.** The dashboard translated retirement behaviors (calculator runs, score
inputs, path progress) into needs-framed segments a credit union marketing
lead could act on the same day — without analytics expertise.

Background (table stakes, never stated): the execution itself proves high
craft in B2B workflow design. The craft is demonstrated, not claimed.

The primary user portrayed is a credit union **marketing lead** — low
analytics maturity, concrete jobs (retain deposits, grow wealth-management
pipeline) — not a data analyst. That persona choice drives every design
decision in the artifact.

## Deliverable

A single self-contained `partner-dashboard.html` (vanilla JS, no build step
beyond font inlining), served via `serve.mjs`, built to
`dist/partner-dashboard.html` by `build.mjs`, embedded via iframe with
`postMessage` height reporting (message type `partner-dashboard:height`).
DM Sans 400/500 via `fonts.css`.

## Connective tissue with artifact 1

The dashboard is Lanternbay Credit Union's instance — the same fictional CU
the visitor configured in the brand-system artifact. Lanternbay's wordmark
sits in the sidebar under the silvur PARTNERS chrome. A hiring manager who saw
Lanternbay born from a logo and two colors now sees its marketing team acting
on member signals. Neither artifact argues the platform loop; seeing the same
CU in both carries it. The case-study prose stitches them explicitly.

No fictional personal names anywhere (consistent with anonymization rules):
the sidebar account area reads "Marketing · Lanternbay CU", not a fake person.

## Structure — one segment, end to end

A fixed-height dashboard stage showing three segment cards (mirroring the
shipped product's needs-framing):

1. **Direct Deposit: Social Security** — chip: Top Risk — **the hero**
2. Top Wealth Management Leads — chip: Top Opportunity — static
3. High Yield Savings Leads — chip: Top Opportunity — static

The artifact walks the hero card through three beats. Beats advance by
clicking the card / its primary action; a subtle step indicator (1–3) shows
progress. Fixed stage height — beats swap content, nothing reflows.

**Beat 1 — Signal.** The three cards as the marketing lead first sees them:
segment name, one-line meaning, member count, dollar context. Needs and
actions, not metrics. The hero card carries the affordance to expand.

**Beat 2 — Why (the heart of the artifact).** The hero expands into a
left-to-right provenance chain — the member-action → CU-benefit connection
made visible.

**Hard constraint (as shipped, confirmed): the platform could only report
member activity on the platform** — behavioral events and member-entered
inputs. No external banking data, no visibility into where deposits land.
Every link in every chain must be a platform event or a member-entered value.
The dashboard's craft was framing those signals in the CU's business terms
without claiming sight it didn't have.

> **What members did** (in the Silvur experience): ran the Social Security
> calculator; set or passed their election age; entered their benefit income
> in their retirement score →
> **What that means** (aggregated signal): 1,651 Lanternbay members are
> collecting — or about to start collecting — Social Security, ~$23M/yr in
> recurring benefit income identified →
> **Why Lanternbay cares** (business meaning): recurring federal deposits
> anchor a primary-banking relationship, and Lanternbay can't see where
> they land — which is exactly why these members are worth a campaign →
> **What to do**: a direct-deposit campaign to exactly these members.

All figures synthetic. Aggregate counts only — no fake individual member rows,
ever (privacy optics matter even in fiction). The provenance panel exists
because trust precedes action: a marketer won't run a campaign on a number
they can't see the reasoning behind.

**Beat 3 — Act.** "Export for campaign" opens a slide-over summary: audience
size, the fields included (member contact via the CU's system of record,
segment reason), and where it goes — the CU's existing email/direct-mail
tools. No fake file download; the outcome state IS the payoff. A one-line
annotation notes the deliberate scope decision: meet partners in their
existing MarTech rather than building a campaign engine inside the dashboard.

## Design-notes layer

A "Design notes" toggle overlays three numbered callouts (the explicit craft
evidence, off by default):

1. Segments are framed as needs + recommended actions, not metrics — designed
   for marketers, not analysts.
2. Provenance is one click away, never buried — and every signal is member
   activity on the platform. The insight earns trust by showing its
   reasoning and never claiming data it can't see.
3. The workflow ends in the partner's existing tools — platform scope was a
   design decision, not a limitation.

## Anti-generic rules (what keeps this from reading as analytics wallpaper)

- No date-range pickers, no filters, no search, no settings.
- No charts. If a number needs context, it gets a sentence, not a sparkline.
- No multi-page navigation; sidebar items beyond Campaign Segments are
  present-but-inert chrome, visually muted, never clickable-looking.
- One segment explored deeply beats ten segments browsable.

## Data honesty

- All counts, dollar figures, and member behaviors are synthetic. Footnote:
  "Credit union, members, and figures are fictional; segment logic is
  representative of the shipped product."
- Segment mechanics (verified 2026-07-15): platform-activity signals only —
  behavioral events and member-entered inputs. External banking data was NOT
  knowable and must never appear in a chain.

| Segment | Platform signals feeding it | CU benefit |
|---|---|---|
| Direct Deposit: Social Security | SS calculator use; election age set/passed; member-entered benefit income | Direct-deposit capture campaign |
| Top Wealth Management Leads | Retirement horizon 0–3 yrs (score inputs); member-entered investable assets ≥ threshold | Wealth-management pipeline |
| High Yield Savings Leads | Member-entered cash/savings balances in net-worth accounts | Deposit growth into HYS/certificates |

- No NCUA / Equal Housing marks (fictional artifact must not carry regulator
  insignia).

## Motion

Default is subtle, restrained, realistic. Beat transitions follow the
established rules: each beat's content arrives as one synchronized movement,
then stillness. Fixed stage height, no reflow. `prefers-reduced-motion`:
instant swaps. No count-up numbers, no ambient animation.

Story-serving exception (permitted where motion IS the argument): the Beat 2
provenance chain may draw left-to-right once — member action tracing through
to CU benefit — since that connection is the artifact's whole argument.

## Accessibility

All chrome ≥ AA contrast. Beat progression keyboard-operable (hero card and
export button are real buttons; slide-over traps focus, Esc closes). Step
changes announced via `aria-live=polite`. Design-notes callouts readable by
screen reader in document order.

## Responsive

The dashboard is desktop-native by nature. Below ~760px the stage scales down
via CSS transform to fit the viewport width (craft preserved, no bespoke
mobile dashboard layout — nobody is evaluating a responsive B2B dashboard
here). Height re-reported on load, resize, and beat change.

## Non-goals

- No free-form exploration, no live-data claims, no real member data.
- No campaign builder, no email composer — the workflow ends at the handoff.
- No dashboard "home" or other pages; Campaign Segments is the entire surface.
- No business outcome claims (conversion rates, revenue) — case-study prose
  carries any real figures.
- No fictional personal names, anywhere, including commits.

---

## Author revision — 2026-07-16 (supersedes: Structure, Anti-generic rules, Motion, honesty-line placement)

After reviewing the built artifact against the shipped product, the author
redirected the structure:

**1. The product frame must match the shipped silvur PARTNERS dashboard
faithfully** (reference: the real Campaign Segments screen). That means:
segment cards with chip + kebab, LEADS / TOTAL ASSETS (or ANNUAL DEPOSITS)
labeled rows with count pills, and a teal "Export Data" button per card; below
the cards, the **All Segments table** — header with kebab, "Date Range · All"
pill, "Filters" button, checkbox column, segment name + description rows,
Leads (with a mint "109 New!" pill on the first row), Assets, pink product
tags ("Wealth Management"), and a per-row Export button. Sidebar: logotype,
Home, Campaign Segments (active, chevron), All Segments sub-item, Support,
Settings, the Lanternbay lockup, and an account row (initials avatar +
"Marketing Team" + fictional team email — still no personal names). A
hamburger icon tops the main column.

**2. Product UI and explanation UI never mix.** The frame renders only what
the product would render, in product voice. All narration — the Signal → Why
→ Act story, the member-actions-to-benefit chain, the honesty framing — lives
OUTSIDE the frame in a **story rail** beneath it: three numbered clickable
beats that drive the product to the matching state (and stay in sync when the
visitor drives the product directly). Design-notes callouts also live outside
the frame; no badges inside the product.

**3. The segment detail screen is a data-heavy product screen**, not a story
chain: back link, chip + title + description header, stat tiles (LEADS 1,651 ·
ANNUAL DEPOSITS $23M · NEW THIS MONTH 87), a "Member signals" panel with
per-signal counts and proportion bars (Ran the Social Security calculator
1,204 · Set or passed their election age 1,651 · Entered Social Security
benefit income 1,455) with the in-product source note "Source: member
activity on the platform.", and a "Recommended campaign" panel (direct-deposit
switch) with Export Data. The four-part causal narrative moves to the story
rail's Why beat, which keeps the load-bearing honesty line ("Lanternbay can't
see where those deposits land").

**Anti-generic reframed:** the earlier "no filters/date pickers/tables" rule
gives way to faithfulness — that chrome now appears because the shipped
product had it, rendered as present-but-inert decoration (not focusable, not
clickable-looking beyond what the product showed). Still banned: charts the
product didn't have, fake file downloads, invented analytics, personal names,
regulator marks.

**Interactions that are live:** hero card → detail screen; every "Export
Data" button (cards, table rows, detail) opens the product-voice Export
dialog populated with that segment's name and lead count; Done/scrim/Esc
closes; story rail beats drive the same states. Everything else is inert
chrome.

**Motion:** screens morph in place (~200ms); the signal-proportion bars may
grow once on first entry to the detail screen (the data-native descendant of
the chain draw — once per entry from the home screen, never looping);
`prefers-reduced-motion`: instant.

**Later 2026-07-16:** the Design-notes layer was removed entirely (author) —
the cycling story captions carry all narration alone. Sidebar menu items must
each fit on one line (238px sidebar, nowrap).
