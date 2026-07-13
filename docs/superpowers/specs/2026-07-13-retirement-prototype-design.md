# Retirement Income Interactive Prototype — Design

Date: 2026-07-13

## Goal

Turn a static marketing mockup into an interactive, high-craft prototype. Preserve
the visual design and iOS-native styling exactly; mimic the functionality. The
central "retirement score" bar and readouts must react live to changes made in the
input cards around the phone.

## Deliverable

A single self-contained `index.html` file (vanilla JS, SVG-drawn chart, no build
step). Also publishable as a shareable web Artifact. All assets — including the
font — embedded so it renders identically local or hosted.

## Layout (hand removed)

Recreate the full composition on a light backdrop:

- **Center:** an iPhone (notch/Dynamic Island + status bar `9:41`, signal/wifi/battery)
  showing the **Retirement Income** screen — legend, income chart, score bar,
  Retire / Money-lasts readout, page dots, explainer text, and a partially-visible
  "Retirement Date" card peeking up from the bottom.
- **Left rail:** Retirement Date, Spending, Net Worth.
- **Right rail:** Income, Social Security, Healthcare.
- Cards use iOS styling: rounded corners, soft shadows, pill `−/+` steppers,
  gray "High Impact" chips, blue link rows with chevrons, "IMPACT" callout boxes.
- **Responsive:** below a breakpoint the side cards stack under the phone so the
  phone stays the focal point and everything remains usable.

## Typography

- **DM Sans** throughout, embedded as base64 woff2 (Regular 400 + Medium 500 only).
- **Medium (500) is the strongest weight used** — headings, large numbers, and all
  emphasis top out at Medium. No 600/700 anywhere.
- Regular (400) for body, labels, secondary text.

## Interactivity — what is live

Every stepper recalculates the model and updates the center visuals together:

| Card | Control | Effect |
|------|---------|--------|
| Retirement Date | age `−/+` | retire earlier/later |
| Spending | monthly `−/+` | expense level |
| Net Worth | (shown; lightly adjustable) | starting savings |
| Income | added income `$/mo` `−/+`, duration `yrs` `−/+` | extra income + how long |
| Social Security | election age `−/+` | when guaranteed income starts |
| Healthcare | Medicare premium (shown; lightly adjustable) | expense once 65 |

Live-updating targets:
1. **Score bar** — gold marker at retirement age, green marker at money-runs-out age,
   on a Today→Age 95 timeline.
2. **Readout** — "Retire: NN" and "Money lasts until: NNy Mm".
3. **Income chart** — teal non-guaranteed income, purple guaranteed income, blue
   savings withdrawals, white sloping spending line — redrawn on every change.

## The model (plausible & reactive, transparent, tunable)

Year-by-year cash-flow simulation from retirement age forward:

- Start: savings = net worth.
- Each year:
  - income = Social Security (once age ≥ election age) + added income (for its set
    duration in years from retirement).
  - expenses = spending × 12, plus Medicare premium × 12 once age ≥ 65; grown each
    year by an inflation rate.
  - savings earns a modest annual return, then covers the shortfall
    (expenses − income). If income ≥ expenses, savings grows.
- The age at which savings first hits zero = the **score** ("money lasts until").
- Constants (return, inflation, SS benefit as a function of election age) tuned so
  the default state reads like the mockup (retire ~62, money lasts ~82y 5m).

Levers move it believably: retire later, spend less, add more income, or elect
Social Security later → money lasts longer.

## Chart integrity rules

The chart is rendered directly from the simulation output (not drawn decoratively),
which enforces these invariants:

- **Withdrawals never exceed spending:** post-retirement, each year's withdrawal is
  computed as `min(spending − other income, remaining savings)`, so the stacked bar
  (guaranteed income + withdrawals) can never rise above the white spending line.
- **Reducing spending redistributes withdrawals to later years:** smaller annual
  withdrawals deplete savings slower, so the blue area gets shorter but extends
  further right — visually showing the money lasting longer. The green
  "money lasts until" marker moves in lockstep.
- **Pre-retirement bars may exceed the spending line** (salary surplus being saved),
  matching the mockup.
- **Transitions:** bar heights and the depletion edge animate (~250ms ease-out) so
  changes read as money moving, not a redraw. The spending line renders on top; the
  blue area ends in a clean edge where savings run out.

## Non-goals (YAGNI)

- Not a financially rigorous / advice-grade calculator.
- No persistence, accounts, routing, or backend.
- No animation of the hand; the hand is removed.

## Testing / verification

- Manually drive each stepper and confirm score bar, readout, and chart all move in
  the believable direction and magnitude.
- Confirm default state matches the mockup's headline numbers.
- Confirm responsive stacking and that DM Sans (max weight 500) renders correctly.
