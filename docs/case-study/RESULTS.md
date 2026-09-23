# Code4Kidz remediation: before and after

Evidence for every claim below is in this folder or in the commit named next to it. The "before" is the app as
prototyped (commit `395ae36`); the "after" is branch `chore/strip-scaffold` at `69c9148`.

## Accessibility: automated (axe-core 4.13, WCAG 2.1 A/AA + best practice)

Same script, same screens, same settings: `node scripts/a11y-report.mjs <dir>`.

| Screen | Before: rules / elements | After |
|---|---|---|
| Landing | 4 / 27 | 0 / 0 |
| Onboarding | 3 / 3 | 0 / 0 |
| Map | 4 / 7 | 0 / 0 |
| Lesson 1 intro | 4 / 9 | 0 / 0 |
| Lesson step | 6 / 16 | 0 / 0 |
| Lesson step, wrong answer shown | 6 / 16 | 0 / 0 |
| Lesson step, hint open | 6 / 18 | 0 / 0 |

Details: [`a11y-before/`](a11y-before/) and [`a11y-after/`](a11y-after/) (violations JSON, accessibility tree, screenshot
per screen). CI now fails if any of these screens regresses (`e2e/a11y.spec.ts`, desktop and phone).

## Accessibility: what a screen reader gets (the part axe cannot measure)

Lesson 1, step 1, with the hint open. From the accessibility trees in `*/lesson-1-hint-open.aria.yml`.

**Before**

```
- text: Not quite! Check the hint if you need help.        ← plain text, never announced
- button "💡 Need a hint?"
- button "Press space or tap to continue": "It starts with …"  ← the hint's name replaces its text; pressing it does nothing
- text: ✕ Keep trying... Live Preview                      ← present before the learner has typed anything
  (no main landmark, no heading, no named panels, editor has no name)
```

**After**

```
- banner: button "Exit", button "Turn sound effects on", "3 of 3 hearts left", "0 XP"
- main "Lesson 1: Say Hello to the Web! — Step 1 of 5"
  - heading level 1 (same text)
  - status: <Byte's current message, announced when it changes>
  - region "Instructions": …, button "Hide hint" [expanded], <the hint text itself>
  - region "Code editor": textbox "Your code"
  - region "Live preview": iframe
```

Keyboard: focus lands on **Continue** at the intro (Enter continues); the editor is three Tabs away; every control has a
visible focus ring (there were none). `Check my code` also works with Ctrl/Cmd+Enter.

Not yet done: a recording with a real screen reader (VoiceOver). The trees above are a machine proxy.

## Correctness

| Problem | Before | After | Commit |
|---|---|---|---|
| Streak-broken screen | white-screen crash ("Rendered more hooks") | shows and dismisses | `2e35b7b` |
| XP, hearts, review | steps never gave XP, hearts never lost, review never reachable (stale editor callback) | all work, covered by hook tests | `2e35b7b` |
| Answer checking | 29 of 123 test cases failed: warm-ups passed on "x", CSS steps passed on a single space, two bug-fix steps passed unfixed | 123 / 123 | `49cac03` |
| Onboarding | entering a topic skipped both celebration screens | shown | `f3985f9` |
| Streak | counted app opens, mixed UTC and local days, "gone for 0 days" | counts practice, local days, correct count, migrated saves | `d8478ed` |
| Sounds | every sound 404'd | synthesised tones | `b4fed31` |
| Early check race | a quick "Check my code" result was overwritten by the step prompt | kept | `69c9148` |

## Learning design (cognitive load)

- Pausing to think no longer counts as a mistake. Before, 2.5s of unfinished code counted, and every third cost a
  heart. Mistakes now count only when the learner presses **Check my code** (`2241e10`).
- Hints are available from the start instead of after two "mistakes".
- The warm-up's 60-second countdown (which turned red and then did nothing) is gone.
- Copy that wasn't true is fixed: no "millions of people will see it", and the preview's tab now really shows the
  page title as lesson 1 promises.

## Security

The preview iframe used `allow-scripts allow-same-origin`. Reproduced before the fix: a `<script>` typed into the lesson
editor renamed the app's tab and read its saved progress. After: `sandbox=""`; the same script does nothing
(`04c867b`).

## Responsive

At 375px the lesson screen was three ~125px columns under an overlapping header ([before](responsive/before-phone.png)).
Now phones get a header row, an Instructions / Code / Preview switcher and a stacked review screen, with no horizontal
overflow at 375, 768 or 1280px ([after](responsive/after-phone.png)). A full lesson plus review was completed at 375px.

## Performance

| | Before | After |
|---|---|---|
| JavaScript on first load (gzip) | 367 KB (one bundle) | 146 KB; the editor loads on the first lesson |
| Map: DOM subtrees torn down during 60 mouse moves | 180 | 0 |

## Tests

| | Before | After |
|---|---|---|
| Unit / component tests | 0 | 196 |
| End-to-end + axe (desktop and phone) | 0 | 12 |
| Lint (react-hooks rules) | not configured, 39 errors when added | 0 errors |
| CI | none | typecheck, lint, tests, build, e2e on every push and PR |
