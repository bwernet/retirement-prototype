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

The dashboard is Harborlight Credit Union's instance — the same fictional CU
the visitor configured in the brand-system artifact. Harborlight's wordmark
sits in the sidebar under the silvur PARTNERS chrome. A hiring manager who saw
Harborlight born from a logo and two colors now sees its marketing team acting
on member signals. Neither artifact argues the platform loop; seeing the same
CU in both carries it. The case-study prose stitches them explicitly.

No fictional personal names anywhere (consistent with anonymization rules):
the sidebar account area reads "Marketing · Harborlight CU", not a fake person.

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
made visible:

> **What members did** (in the Silvur experience): ran the Social Security
> calculator; set an election age; indicated benefits are (or will be)
> deposited at another institution →
> **What that means** (aggregated signal): 1,651 Harborlight members collecting
> or about to collect Social Security, with recurring federal deposits landing
> elsewhere →
> **Why Harborlight cares** (business meaning): ~$23M/yr in annual deposits at
> stake — retention risk if the primary-banking relationship sits elsewhere →
> **What to do**: a direct-deposit switch campaign to exactly these members.

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
2. Provenance is one click away, never buried — the insight must earn trust
   before it asks for action.
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
- The segment mechanics table below must be verified against how the real
  product actually derived segments before build — if a chain link (e.g.,
  "deposited at another institution") wasn't knowable in the real system, the
  chain must change. **[VERIFY WITH BETH]**

| Segment | Member behaviors feeding it (to verify) | CU benefit |
|---|---|---|
| Direct Deposit: Social Security | SS calculator use, election age set, benefit-deposit destination | Deposit retention / direct-deposit switch |
| Top Wealth Management Leads | Retirement horizon 0–3 yrs (score inputs), investable assets threshold | Wealth-management pipeline |
| High Yield Savings Leads | Cash balances earning little interest (net-worth accounts) | Deposit growth into HYS/certificates |

- No NCUA / Equal Housing marks (fictional artifact must not carry regulator
  insignia).

## Motion

Beat transitions follow the established rules: each beat's content arrives as
one synchronized movement, then stillness. Fixed stage height, no reflow.
`prefers-reduced-motion`: instant swaps. No count-up numbers, no ambient
animation.

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
