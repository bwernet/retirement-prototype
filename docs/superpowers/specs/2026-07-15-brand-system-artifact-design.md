# White-Label Brand System — Interactive Artifact — Design

Date: 2026-07-15

## Goal

An interactive artifact for the Silvur case study's platform/white-label chapter.
It must communicate, to a hiring manager in ~90 seconds, one argument:

**The entire intake from a new credit union partner was a logo and two brand
colors — and that was the achievement.** Spinning up a safe, usable, accessible
member experience from two hex codes only works because the design system was
architected around a deliberate constraint: the two brand colors get exactly
three jobs — background, headline, primary CTA — and every other surface is
reduced to a neutral system engineered to work beside any brand. The design
work is the seam: which few roles brand color may take, guardrails for when a
color can't safely do its job, and a neutral system strong enough to carry
the rest.

The artifact demonstrates interaction design craft and systems thinking. It
carries no business metrics — those live in the case study prose.

## Deliverable

A single self-contained `brand-system.html` (vanilla JS, no build step beyond
font inlining), served locally via `serve.mjs`, built to
`dist/brand-system.html` by `build.mjs`, embedded in the case study via iframe
with the established `postMessage` height-reporting pattern (message type
`brand-system:height`). DM Sans 400/500 via `fonts.css`, same as the other
artifacts.

## Layout — three linked zones

Left to right, the layout itself is the data flow: partner input → member
experience → what the system guaranteed.

**1. Partner intake rail (left).** Eyebrow: "What a new partner sent us."
Three fictional credit union preset cards, each showing exactly what a real
partner sent — a wordmark and two color chips with hex values. Below them, a
"Try any color" custom swatch (see Custom color). Selecting a preset is the
primary interaction.

**2. Member phone (center).** The mobile home moment: CU wordmark in the
header, Retirement Score chip, "Top priority for you" card, and an action-plan
progress card. Re-renders under the selected brand. All copy is representative
reconstruction of the shipped product (disclosed in footnote). The phone is
NOT a tappable app — no interior interactions.

**3. Derivation panel (right).** Eyebrow: "What the system did with it." Two
stacked sections mirroring how the shipped system actually worked — the two
brand colors were given exactly three jobs, and everything else went neutral:

- **The three brand roles**, each with a live-computed WCAG contrast ratio:
  - `brand/background` — the hero/header band. The system picks on-background
    text (white or ink) by contrast against the brand fill.
  - `brand/headline` — headline color on white; darkened stepwise until
    ≥ 4.5:1 when the raw color fails (the Sunwise yellow case), shown with an
    "adjusted" badge and before → after swatches and ratios.
  - `brand/CTA` — primary button fill with on-CTA text chosen by contrast;
    when neither white nor ink can reach 4.5:1 on the brand fill, the CTA
    falls back to a neutral fill so the action never sacrifices legibility.
    **[VERIFY WITH BETH]** whether the real rule was adjust-the-color or
    fall-back-to-neutral (the ICCU instance's neutral dark CTAs suggest the
    latter); the artifact must show the rule that actually shipped.
- **Reduced to neutral — works with every brand** — the rest of the UI as a
  fixed list: body text, cards, borders, icons, secondary buttons, the score
  gradient (semantic, member-facing trust), success/warning/error states,
  typography, spacing. This is the seam: three brand-owned roles vs a
  neutral, platform-owned system.

All ratios are computed at runtime with real WCAG relative-luminance math —
numbers are measured, not claimed. The artifact self-verifies its own
accessibility argument.

## The three presets

Chosen to span difficulty, so the derivation visibly earns its keep:

| Credit union (fictional) | Colors sent | Why it's in the set |
|---|---|---|
| Harborlight Credit Union | navy `#1E3A5F` + teal `#1FA98C` | Well-behaved: most tokens pass raw. Establishes the baseline. |
| Sunwise Credit Union | yellow `#FFC93C` + warm gray `#6E6A5E` | Hostile: yellow fails headline contrast on white (~1.6:1). The system darkens it for headlines, keeps raw yellow where it can work (background band with ink text), and exercises the CTA guardrail. This is the money moment. |
| Ember Valley Credit Union | burgundy `#6B1F2F` + dusty rose `#C98A8A` | Dark brand: exercises tints and white on-color text; proves the system isn't tuned to light brands. |

Names must be collision-checked against real credit unions before publishing;
"Federal" is deliberately avoided in fictional names so no charter is implied.
Wordmarks are simple text/SVG lockups (no fabricated logo art).

## Custom color

One native color input, restyled: "Try any color." Selecting it switches the
wordmark to a neutral "Anytown Credit Union" and fills the three brand roles
from the single chosen primary (the secondary auto-derived — deterministic
lightness/hue shift; exact recipe an implementation detail). This is the
evidence interaction for arbitrary input: whatever the visitor picks, the
member phone stays legible and the panel shows which roles took the color
raw, which were adjusted, and which fell back — and why. No second color
input, no logo upload.

## Motion

Per established artifact motion rules: preset switch triggers ONE synchronized
crossfade (~450ms) across phone and derivation panel — everything arrives
together, then stillness. Fixed heights everywhere; nothing reflows.
`prefers-reduced-motion`: instant swap. No ambient or looping animation.

## Framing copy (inside the artifact)

- Opening line (top): "The entire intake from a new credit union partner: a
  logo and two brand colors."
- Closing caption (bottom, small italic): "Two colors, three jobs —
  background, headline, CTA. Everything else was reduced to a neutral system
  that had to work beside any brand that arrived."
- Footnote: "Credit unions shown are fictional; member data is synthetic; app
  copy is a representative reconstruction of the shipped product."

## Accessibility of the artifact itself

Non-negotiable: an artifact arguing "the system guarantees contrast" cannot
ship a contrast failure. All artifact chrome ≥ AA. Preset cards and the color
input keyboard-operable (tab order, Enter/Space, visible focus). Brand switch
announced via `aria-live=polite` ("Now showing Sunwise Credit Union; headline
color adjusted for contrast"). Derivation ratios rendered as text, not color-only.

## Responsive

Below ~760px the three zones stack: intake rail (horizontal preset row) →
phone → derivation panel. Phone remains the focal point. Height re-reported on
load, resize, and preset switch.

## Non-goals

- No product-catalog or content configuration — that was not how the real
  platform worked, and inventing it would misrepresent the system.
- No logo upload, no secondary color picker, no dark mode, no saved states.
- No dashboard content (that is artifact 2's job).
- No business metrics, partner counts, or outcome claims.
- No tappable app interior; the phone is a rendering target, not a prototype.
