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

- Canvas: brand Dark `#02103A`, flat — NO dot grid (removed: visual activity
  without comprehension value). Pill radii, generous padding. Max content
  width ~760px.
- One expressive element only: the Lemon headline. Everything else is quiet.
- Type: **Bricolage Grotesque** weight 800 for the headline ONLY;
  **Instrument Sans** for everything else — labels, attributions, footer, and
  the quotes (italic, weight 400). The Georgia-serif verbatim
  convention shared with the Silvur artifact is CONSCIOUSLY DROPPED here (it
  competed with the headline for emotional emphasis); quotation marks,
  P-codes, and the footer disclosure carry the verbatim signal instead.
  Fonts subset and inlined at build time (same approach as `fonts.css` /
  `build-fonts.mjs`).
- Color roles: Lemon `#E9DA02` headline (soft pulse glow per beat); Lavender
  `#C2BAF1` typing cursor (functional, not decorative — no glow/text-shadow
  on quotes); Lavender-600 `#8373E3` attributions; muted blue-grays
  `#99A6C4` / `#8A97B5` for notification text; `#67708B` column label;
  footer `#8A97B5` (contrast raised from `#4D5878` — was hard to read).
- No Persimmon anywhere (reads as error state on this canvas).

## Structure (top to bottom)

1. **Headline (the thesis, the only expressive element):**
   `"It should know me."` — Lemon, Bricolage 800, ~40px, top of the artifact.
   Sub-line beneath (12.5px, `#8A97B5`): `One participant's words for what
   every participant was asking.` (Stands alone; names the thesis as the
   study's synthesis. Attribution P1 · new mom lives in the screen-reader
   list and spec, keeping the visible sub-line clean.)
2. **Two-column evidence area** beneath the headline:
   - **Left column** (~280px), labeled `WHAT THE APP SAID` (10.5px
     letterspaced, `#67708B`): compact notification cards *ping in*
     iOS-style (slide-down + slight overshoot, ~520ms) one per beat, muted
     blue-gray. Beat 4's card carries a small `WEEK 40` tag inside it — the
     timestamp is the irony and stays.
   - **Right column** (flexible), labeled `WHAT SHE FELT` (matching the left
     label): her real quote crossfades in whole (350ms), Instrument Sans
     italic 19px, with a blinking Lavender cursor as the ambient late-night
     cue; attribution fades in after. (A typing animation was prototyped and
     scan-tested against the crossfade; crossfade won — evidence must be
     readable at any moment a skimmer lands.)
   - Both columns have FIXED heights, pre-measured against the longest
     quote/notification per breakpoint — the artifact never changes height
     between beats.
3. **Footer** (single quiet row, `#8A97B5`, thin lavender rule above):
   left, the rigor stamp `RESEARCH SYNTHESIS · 8 DISCOVERY INTERVIEWS · 7
   PROTOTYPE TESTS`; right, the disclosure `App notifications are
   representative copy, reconstructed from participants' descriptions. All
   quotes are verbatim.` Rigor is evidence, not the message — it lives at
   the bottom.

Each completed beat pulses the headline glow once (~650ms) — evidence
visibly feeding the conclusion. Any still frame contains the complete
argument: thesis → app-said → she-asked. The animation rewards attention but
is never required.

## Content — call-and-response beats

Each beat pairs a notification with a typed quote on the SAME topic, so her
line reads as the deeper, anxious version of the thing the app just chirped
about. Two registers, two honesty rules:

- **Notifications are representative app copy** — realistic reconstructions
  anchored in participant reports and universal app tropes, NOT verbatim
  quotes. A permanent footnote inside the artifact discloses this.
- **No emoji anywhere in the notification cards.** BabyTalkGPT's own product
  tone uses emoji; the incumbent-app cards stay emoji-free so the contrast
  isn't muddied.
- **Typed quotes are strictly verbatim** (trimmed only).

| Beat | Topic | Notification (representative copy) | Typed quote (verbatim) | Attribution |
|---|---|---|---|---|
| 1 | movement | HER PREGNANCY APP · "Your baby is the size of a banana. Those little kicks are getting stronger!" | "Is she in fetal distress — or, because I had four donuts, is she just having a sugar party in there?" | P5 · 33 weeks · asked Reddit, very late at night |
| 2 | reassurance | HER PREGNANCY APP · "Halfway there — you've got this, mama!" | "Can I? Could I? Is it OK?" | P4 · first pregnancy · "every 30 minutes" |
| 3 | her real life | HER PREGNANCY APP · "You might be experiencing skin changes — try treating yourself to a spa day!" | "How am I supposed to keep working for six more months when my brain feels like mush?" | P7 · prototype interviews · describing the same app |
| 4 | the timeline | HER PREGNANCY APP · WEEK 40 · "Congratulations, mama! Is your little one here yet?" | "It was so demoralizing when I was 40 weeks along and all of the pregnancy apps were like, you should be done." | P2 · 40 weeks |
| — | | Standing thesis: "It should know me." | | P1 · new mom |

Beat evidence notes (what anchors each reconstruction):

- Beat 1: banana size-trope discussed verbatim by participants ("What does it
  mean that the fetus is the size of a banana? In what dimension?"); kicks
  copy is universal app boilerplate. Pairs with her movement anxiety.
- Beat 2: "you go, mama!" cheerleading language quoted by a participant as
  app copy she "personally hated"; rendered as a realistic encouragement push.
- Beat 3: one testing participant's own sentence split into its two halves —
  the spa-day app-speak and the real question are her verbatim contrast,
  hence "describing the same app." Notification kept as she phrased it.
- Beat 4: participant reported apps at 40 weeks asking whether she'd had the
  baby; rendered as the realistic congratulatory version (apps presume the
  birth). Her typed line is her fuller verbatim sentiment. The only typed
  line that isn't a question; it carries how the copy actually felt.
- Only evidenced weeks get week labels (beat 4). Others say
  `HER PREGNANCY APP` only.
- The week-35 dates quote was cut (weakest of the pool); it remains available
  to the case-study prose.
- **Artifact footnote (permanent, 10px, `#4D5878`):** "App notifications are
  representative copy, reconstructed from participants' descriptions of their
  apps. All typed quotes are verbatim."

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

- Per beat: notification pings in (520ms, cubic-bezier overshoot); after
  ~600ms the quote crossfades in whole (350ms); ~500ms later the attribution
  fades in and the headline pulses; hold ~3.4s (final beat ~4.2s); quote and
  notification fade out (320-380ms); next beat. Full cycle ≈ 25s.
- Starts only when scrolled into view (IntersectionObserver), cycles
  indefinitely while visible, pauses when offscreen.
- A small unobtrusive pause/play control (bottom corner) satisfies WCAG 2.2.2
  for auto-updating content.
- `prefers-reduced-motion`: no pulse, no cycling, no notification/crossfade
  animation — a static frame: headline, then beat 1 fully rendered in both
  columns (banana notification, donuts quote with attribution), footer. This
  static frame is also the design's five-second skim state.

## Accessibility

- All four quotes + attributions present in the DOM as a visually-hidden
  static list for screen readers; the animated region is `aria-hidden` (no
  `aria-live` churn). Cursor element is decorative.
- The pause/play control is keyboard-focusable with an aria-label.
- Contrast: all text ≥ 4.5:1 against the canvas (notification text ≈6.6:1).

## Responsive

- Max-width 760px, centered. Below ~560px the two columns stack
  (notification above quote — call before response), headline 40px → 28px,
  quote 19px → 17px, padding reduced; fixed slot heights re-measured per
  breakpoint so the iframe height stays stable at all times.
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
