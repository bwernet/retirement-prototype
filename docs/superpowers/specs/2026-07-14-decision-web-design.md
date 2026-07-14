# Retirement Decision Web — Research Visualization — Design

Date: 2026-07-14

## Goal

An interactive visualization for the Silvur case study's Challenge/Approach section.
It must communicate, to a hiring manager skimming the portfolio, three research
findings at once:

1. Retirement decisions are an interconnected web — financial, emotional, and
   logistical — not independent choices.
2. Users kept re-opening decisions as life changed; retirement planning is
   cyclical, not linear.
3. Every existing tool answers one node in isolation and assumes a one-pass
   checklist. The connections — the thing users actually struggled with — fall
   in the gaps between tools. That gap became Silvur's product thesis.

## Deliverable

A single self-contained `decision-web.html` (vanilla JS, SVG, no build step
beyond font inlining), served locally via `serve.mjs`, built to
`dist/decision-web.html` by `build.mjs`, and embedded in the case study via
iframe with the same `postMessage` height-reporting pattern as the prototype
(message type `decision-web:height`).

## Visual language

Shares the app's DNA so the case study feels coherent, but reads as a research
artifact, not an app screen.

**Shared with the app:** DM Sans (400/500 only, via `fonts.css`), navy ink
`#27356B`, soft layered shadows, pill radii, an iOS-style segmented control.

**Distinct as research artifact:**
- Warm paper canvas `#FBFAF7` with a faint dot grid (synthesis-wall feel).
- Verbatim quotes set in a serif (Georgia stack) with a soft highlighter
  background — echoing the highlighted-transcript style of the original
  research slides.
- Uppercase letterspaced eyebrow: "Research synthesis" + sample stamp
  "8 facilitated interviews · ages 51–65".
- Participant codes, never names (see Anonymization).

**Palette for edge types** (deliberately adjacent to, not identical to, app
chart colors): financial `#1FA97C` solid · emotional `#E0785A` dashed ·
logistical `#8A97B5` dotted. Legend chips below the canvas.

## The two views (segmented control)

**"How people experience it" (default):** seven navy pill nodes arranged as a
constellation, connected by gently curved typed edges. Nodes with evidence of
re-evaluation carry a small gold `↻` badge. Fully legible with zero
interaction — this is the static-first requirement; most viewers never click.

**"How today's tools treat it":** nodes animate (~550ms ease) into a vertical
checklist — spine line, green checkmarks, muted italic tool label per node
("SSA — conflicting answers", "Google, from time to time", "nothing").
Edges fade out, `↻` badges hide, legend dims. The collapse animation itself is
the argument: tools flatten a living web into a one-pass sequence.

## Nodes (7) and evidence

Every node and every `↻` badge is backed by a real quote from the interviews.
Node hover/tap focuses its edges (others fade to ~15%) and swaps the quote
panel. `↻` only where re-opening is evidenced.

| Node | ↻ | Quote (verbatim, trimmed) | Attribution |
|---|---|---|---|
| When can we retire? | ✓ | "It's really weighing on us quite heavily right now… when, when, when are we going to be able to retire when we have all this student debt?" | P2 · 59 · married, 5+ yrs out |
| Social Security | ✓ | "I've been told conflicting things about if I will continue to get disability or have to switch to Social Security." | P1 · 60 · single, 3–5 yrs out |
| Medicare & healthcare | | "Which parts of Medicare do I need if I'm still working at 65?" | P6 · credit union member |
| Retirement income | | "What my income would be exactly… it's based on so many variants, you really don't know what you're getting." | P4 · 54 · married, 3–5 yrs out |
| Savings & investments | ✓ | "What are the strategies for your savings and investments in a down market?" | P5 · 56 · married, 1–2 yrs out |
| Family & debt | | "What happens to your bills, what happens to your student loans that you've had forever?" | P4 · 54 · married |
| Life after work | ✓ | "Thinking about it scares me… I'm scared I won't have people to talk to, I won't have money to do the things I wanna do, and that my life is gonna change." | shared in interviews |

Default quote (no node focused): "It's like information overload… so much
information that it makes it hard to look for the pieces that you want to look
for." — P3 · 65 · less than a year from retirement.

Edges (11), each typed fin/emo/log: family–retire, fear–retire, ss–health,
health–retire, income–ss, savings–income, savings–ss, fear–income,
income–retire, family–savings, fear–family.

## Quote panel

Below the canvas: white card, serif quote with highlighter mark, attribution
line in DM Sans muted. Fixed min-height so focus changes never reflow the page.
In tools view it states the linear framing ("One pass, in order, check the
box…") and, per hovered node, "The checklist marks X as done. Our participants
said it never stayed done."

## Closing caption

Small centered italic line inside the artifact so the conclusion travels with
it: "Every tool answered a box. No tool answered the lines between them — that
became Silvur's product thesis."

## Anonymization

Participant codes (P1–P6) with age/context only. No names anywhere in markup,
comments, or commit messages. Codes are NOT in the same order as the research
roster.

## Responsive & interaction details

- Desktop viewBox 960×460; below 700px, a compact relayout (viewBox 400×600,
  shortened labels) rather than uniform scaling, so labels stay legible.
- Touch: tap focuses a node, tap on canvas background clears; no hover
  dependence. Nodes keyboard-focusable (tabindex, Enter/Space), aria-labels.
- Legend chips are also filters: clicking "emotional" dims other edge types
  (click again to clear). Purely additive; default view is complete without it.
- `prefers-reduced-motion`: all transitions/animation disabled, views swap
  instantly.
- Height reported to parent frame on load, resize, and view toggle.

## Non-goals

- No third toggle state, no ambient/looping animation, no time scrubber.
- No data fabrication: no invented counts or percentages anywhere.
