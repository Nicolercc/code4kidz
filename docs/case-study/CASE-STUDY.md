# Case study: Code4Kidz

> Draft for my portfolio. Every claim links to the commit or file that shows it.

**Role:** Frontend Engineer · UX & Accessibility. The concept came from a collaborator; I built the frontend, structured the lesson flow, and did the engineering remediation described here.
**Stack:** React 19, TypeScript, Zustand, CodeMirror 6, Vitest, Playwright, axe-core.

## The idea

Kids aged 7–10 bounce off coding when the first thing they type is abstract. Code4Kidz starts from what the child
already loves. They pick a topic ("Dinosaurs"), and every lesson builds a real webpage about it. Six lessons take them
from `<html>` to styled headings, lists and images. Each lesson mixes four kinds of step: write new code, fix Byte's
bug, find a bug, and "make it yours". A mascot, Byte, carries the instructions and the feedback.

The concept came from a collaborator who brought me in to build the frontend. I researched and structured the lesson flow and
copy, and prototyped it quickly with Replit Agent. That got a convincing demo on screen, but I didn't trust it, so I audited it the way a senior reviewer would.

## What the audit found

The prototype *looked* finished. Underneath:

- **The answer checks didn't check the answer.** I wrote a test for every step (the starter code must fail, a correct
  answer must pass, near-misses must fail). **29 of 123 cases failed**
  ([before](validators-before.txt)). The "make your heading a colour" step passed when I typed a single space, because
  the check read the preview's *default* styles rather than the learner's CSS.
- **Core loops were silently broken.** The code editor kept a stale callback from its first render, so steps never
  awarded XP, hearts were never lost, and the mistake-review screen could never appear
  ([`2e35b7b`](../../src/components/Editor.tsx)). Onboarding skipped its two celebration screens for every new learner.
- **It was inaccessible where it mattered most.** On the lesson screen, a screen reader user could type code but
  never hear whether it worked. The hint was hidden behind an `aria-label` reading "Press space or tap to continue",
  on a "button" that did nothing ([accessibility tree before](a11y-before/lesson-1-hint-open.aria.yml)).
- **It punished thinking.** Pausing for 2.5 seconds with unfinished code counted as a mistake, and every third one cost
  a heart.

## The accessibility story

**Before:** 3–6 axe violations on every screen. On the lesson screen there were no landmarks, no headings, and pass/fail
was shown only by colour, a sliding bar and a sound.

**What I changed and why** (`e4cf8c1`):

1. **One tutor channel.** Byte already "talks" to every learner, so I made that the screen reader's channel too: a
   single `role="status"` region carries every message. On phones the instructions panel can be hidden, and hidden
   live regions go silent, so the status lives outside every panel (`0270d9f`).
2. **Content stays content.** The tap-to-continue pattern put `role="button"` and an `aria-label` on whole text blocks,
   which replaced the text for assistive tech. Now pointer users can still tap anywhere, and a real, auto-focused
   **Continue** button is the keyboard and screen reader path. Five of the seven "continue" gates did nothing at all; I
   deleted them.
3. **Structure you can navigate:** a `main` whose `h1` names the lesson and step, three labelled regions (instructions,
   editor, preview), a named editor, a real hint disclosure (`aria-expanded`), hearts as text ("2 of 3 hearts left"),
   and a visible focus ring everywhere (there was none).

**After:** 0 axe violations on every screen, enforced in CI on desktop and phone
([results](RESULTS.md), [`e2e/a11y.spec.ts`](../../e2e/a11y.spec.ts)). Writing the end-to-end tests caught three more
real issues, including warm-up text that failed contrast on a screen my first report never scanned.

## Engineering decisions worth discussing

- **Validators became pure functions of the learner's code** (`49cac03`). Reading computed styles from the preview
  iframe was untestable and wrong. Reading the learner's own `<style>` rules, using the browser's CSS parser to drop
  invalid declarations, is deterministic and testable. It also meant the app no longer needed to look inside the
  preview, so I could lock that iframe down completely.
- **A sandbox escape, closed** (`04c867b`). `allow-scripts` plus `allow-same-origin` let code typed into the editor
  reach the app. I reproduced it (a typed `<script>` read the saved progress), then set `sandbox=""`.
- **A lesson state machine with owned timers** (`dbc5743`). The lesson page had around 15 unmanaged timers, so leaving
  mid-celebration still advanced the lesson. I split it into a pure reducer (unit-tested transitions), a `useTimers`
  hook that cancels everything on unmount, and a `useLessonMachine` hook tested with fake timers. I did this refactor
  *without* behaviour changes, then changed the fail model in a separate commit.
- **A fairer fail model** (`2241e10`). Checking on pause can now only *pass* a step. A mistake counts only when the
  learner presses "Check my code". Hints are available from the start.
- **Streaks in local calendar days** (`d8478ed`). The original mixed local and UTC dates and counted app opens. Now the
  rules are pure functions over `YYYY-MM-DD` keys, with DST and month-edge tests, and a versioned store migration so
  existing saves convert.

## Outcomes

| | Before | After |
|---|---|---|
| axe violations per screen | 3–6 | 0 |
| Answer-check test cases failing | 29 / 123 | 0 / 123 |
| Automated tests | 0 | 198 unit/component + 12 end-to-end |
| First-load JavaScript (gzip) | 367 KB | 146 KB |
| Usable at 375px | no | yes: a full lesson and review completed |

## What I'd do next

- Test with VoiceOver and, ideally, with kids and a teacher. The accessibility evidence so far is automated plus
  accessibility-tree snapshots.
- Offer narration as an opt-in "Read to me" button. I removed the auto-playing text-to-speech because it talked over
  screen readers and was on by default.
- Build lessons 7–10, which the map currently shows as placeholders.

## What I learned

A polished demo can hide a product that doesn't do its core job. The most useful move was writing tests that describe
what the *learner* should experience (the starter fails, the right answer passes, pausing is not a mistake) and letting
them tell me where the prototype was wrong.
