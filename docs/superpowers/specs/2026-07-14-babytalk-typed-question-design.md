# BabyTalk "It should know me" — Research Synthesis Story Beat — Design

Date: 2026-07-14

## Goal

A single storytelling beat for the BabyTalkGPT case study's Challenge/Discovery
section. It makes one argument, feelable in five seconds: pregnancy apps push
cheerful, generic, baby-centric template content while her real questions go
somewhere else — and every one of those questions amounts to the same sentence,
"It should know me."

It deliberately does NOT carry the whole case study: product decisions,
outcomes, and the solution are handled by the surrounding prose and the product
prototype embed. This artifact is the problem beat only.

## Deliverable

A single self-contained `babytalk-question.html` (vanilla JS, HTML/CSS, no
build step beyond font inlining), served locally via `serve.mjs`, built to
`dist/babytalk-question.html` by `build.mjs`, and embedded in the case study
via iframe with the same `postMessage` height-reporting pattern as the other
artifacts (message type `babytalk-question:height`).

## Visual language

Dark canvas — the register of the finding (these questions live late at night)
and a deliberate contrast with both the Silvur artifact's warm paper and the
surrounding case-study page.

- Canvas: brand Dark `#02103A` with a faint dot grid (`#0a1d52`, 22px), pill
  radii, generous padding. Max content width ~720px.
- Type: **Bricolage Grotesque** (thesis only, weight 800) + **Instrument
  Sans** (eyebrow, labels, attributions) as the web stand-ins for GT Flexa;
  **Georgia serif italic** for verbatim participant quotes — the
  portfolio-wide "a participant said this" convention shared with Silvur.
  Fonts subset and inlined at build time (same approach as `fonts.css` /
  `build-fonts.mjs`).
- Color roles: Lavender `#C2BAF1` typing cursor and quote glow
  (`rgba(194,186,241,0.4)` text-shadow); Lavender-600 `#8373E3` eyebrow +
  attributions; Lemon `#E9DA02` thesis (with soft pulse glow); muted blue-grays
  `#99A6C4` / `#8A97B5` for the app-notification text (contrast-checked ≈6.6:1
  on canvas — reviewed and approved); `#4D5878` for the divider label.
- No Persimmon anywhere (reads as error state on this canvas).

## Structure (top to bottom)

1. **Eyebrow stamp:** `RESEARCH SYNTHESIS · 8 DISCOVERY INTERVIEWS · 7
   PROTOTYPE TESTS` — both studies named because quotes come from both.
2. **Notification slot** (fixed min-height): app notifications *ping in*
   iOS-style (slide-down + slight overshoot, ~520ms) one per beat, muted
   blue-gray styling. Their job is to read as cheerful, generic, and
   irrelevant — the artifact recreates the experience of being told something
   that doesn't feel relevant or deep enough.
3. **Divider label:** `MEANWHILE, WHAT SHE WAS ASKING —` (keeps the two
   tracks parallel; the pairs are thematic, not literal dialogue).
4. **Typing area** (fixed min-height so nothing reflows): after each
   notification lands, her real question types out beneath it, serif italic,
   blinking Lavender cursor; participant attribution fades in after.
5. **Standing thesis** (always visible, separated by a thin lavender rule):
   `"It should know me."` in Lemon Bricolage 800, with sub-line
   `P1 · new mom — one participant's words for what every participant was
   asking.` The sub-line must stand alone without any surrounding context —
   it names the thesis as the synthesis of the study. Each completed beat pulses the thesis glow once (~650ms) —
   evidence visibly feeding the conclusion.

Any still frame contains the complete argument: irrelevant notification → real
question → thesis. The animation rewards attention but is never required.

## Content — call-and-response beats (all participant-evidenced)

| Beat | Notification (app-speak, as participants reported it) | Typed question | Attribution |
|---|---|---|---|
| 1 | HER PREGNANCY APP · "Your baby is the size of a banana 🍌" | "Is she in fetal distress — or, because I had four donuts, is she just having a sugar party in there?" | P5 · 33 weeks · asked Reddit, very late at night |
| 2 | HER PREGNANCY APP · "You go, mama!" | "Can I? Could I? Is it OK?" | P4 · first pregnancy · "every 30 minutes" |
| 3 | HER PREGNANCY APP · "You might be experiencing skin changes — try treating yourself to a spa day!" | "How am I supposed to keep working for six more months when my brain feels like mush?" | P7 · prototype interviews · describing the same app |
| 4 | HER PREGNANCY APP · WEEK 40 · "You should be done. Did you have your baby?" | "It was so demoralizing when I was 40 weeks along and all of the pregnancy apps were like, you should be done." | P2 · 40 weeks |
| — | Standing thesis: "It should know me." | | P1 · new mom |

Beat evidence notes:

- Banana size-trope: participants discussed it verbatim ("What does it mean
  that the fetus is the size of a banana? In what dimension?").
- "You go, mama!": quoted by a participant as app language she "personally
  hated."
- Beat 3 is one testing participant's own sentence split into its two halves —
  the spa-day app-speak and the real question are her verbatim contrast, hence
  the attribution "describing the same app."
- Beat 4 is one participant's moment split into its two halves, like beat 3:
  the notification is the app copy she reported, and the typed line is her
  fuller verbatim sentiment about it, trimmed only at the tail (the
  notification card already carries "Did you have your baby?"). No
  celebratory emoji — nothing beyond what she reported. It's the only typed
  line that isn't a question; it carries how the app-speak actually felt.
- Only weeks that are evidenced get week labels (beat 4). Others say
  `HER PREGNANCY APP` only.
- The week-35 dates quote was cut in this revision (weakest of the pool);
  it remains available to the case-study prose.

Honest-reporting constraints:

- The WebMD/non-viable story is excluded (secondhand in the synthesis notes,
  not verbatim).
- "very late at night" is the participant's own phrasing — no invented clock
  times ("2am" appears nowhere in the artifact).
- No fabricated counts, percentages, or composite narratives. The four
  questions are attributed to their real (coded) speakers; two share a speaker
  and that is shown, not hidden.

## Anonymization

Participant codes only (P1, P4, P5, P7…), with context descriptors (weeks,
pregnancy number, study phase). No real names anywhere in markup, comments,
file names, or commit messages. Codes are NOT in the same order as the
research roster.

## Animation behavior

- Per beat: notification pings in (520ms, cubic-bezier overshoot), holds
  ~1.1s, then the question types: ~26ms/char with ±40ms jitter; +220ms pause
  at commas and em-dashes, +150ms at terminal punctuation. Attribution fades
  in 300ms after the quote completes; thesis pulses; hold ~2.3s (final beat
  ~3.2s); notification exits (320ms fade-up); next beat. Full cycle ≈ 40s.
- Starts only when scrolled into view (IntersectionObserver), cycles
  indefinitely while visible, pauses when offscreen.
- A small unobtrusive pause/play control (bottom corner) satisfies WCAG 2.2.2
  for auto-updating content.
- `prefers-reduced-motion`: no typing, no pulse, no cycling, no notification
  animation — a static frame showing beat 1 fully rendered (banana
  notification, donuts question with attribution) and the thesis. This static
  frame is also the design's five-second skim state.

## Accessibility

- All four quotes + attributions present in the DOM as a visually-hidden
  static list for screen readers; the animated region is `aria-hidden` (no
  `aria-live` churn). Cursor element is decorative.
- The pause/play control is keyboard-focusable with an aria-label.
- Contrast: all text ≥ 4.5:1 against the canvas (notification text ≈6.6:1).

## Responsive

- Max-width 720px, centered. Below ~480px: typed quote 22px → 18px, thesis
  34px → 26px, padding reduced; min-heights adjusted per breakpoint so the
  iframe height stays stable (no per-character height chatter).
- Height reported to parent on load and resize only — content height is
  constant by design.

## Case-study placement

Embedded in the Challenge section, directly after the prose that names the
three research gaps. The prose states the findings; the artifact makes the
reader feel them. The product prototype embed later in the page answers the
thesis ("Ask anything…" input) — the two embeds bookend the argument the same
way the Silvur page's do.

## Non-goals

- No coverage map, territories, kill-list, or roadmap content (explored and
  rejected as overloaded — see brainstorm history).
- No play-once finale; the thesis is standing, the evidence cycles.
- No real names, no invented data, no clock times.
- No segmented-control view toggle (that's the Silvur artifact's move).
