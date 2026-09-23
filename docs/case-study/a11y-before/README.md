# Accessibility baseline (before remediation)

Captured on 2026-09-23 at commit `48471c5` with `node scripts/a11y-report.mjs docs/case-study/a11y-before`
(axe-core 4.13, WCAG 2.1 A/AA + best practices, 1280×800, reduced motion on).

See [SUMMARY.md](SUMMARY.md) for violation counts. For each screen, `*.axe.json` lists the violations,
`*.aria.yml` is the accessibility tree assistive tech receives, and `*.png` shows what a sighted user sees.

## What the numbers miss

axe checks structure. It can't tell whether a screen reader user *learns what happened*. The accessibility trees show
problems no rule flags:

- **The hint is unreadable.** With the hint open (`lesson-1-hint-open.aria.yml`) the hint is exposed as
  `button "Press space or tap to continue"`. The `aria-label` from `useTapGate` replaces the hint text as the
  accessible name, and pressing the "button" does nothing.
- **Feedback is silent.** "Not quite! Check the hint if you need help." appears as plain text with no live region,
  so it's not announced. Passing a step is shown only by colour, a slide-in bar, and a sound.
- **"✕ Keep trying..." is always present**, even before the kid types, because the result bar is only moved
  off-screen.
- **No structure.** Lesson screens have no `main` landmark and no `h1`, and the three panels (instructions, editor,
  preview) aren't labelled, so there's nothing to jump between.
- **The intro splash is one giant button** whose label replaces the lesson title and intro, with the Back button
  nested inside it (`nested-interactive`).

The preview iframe is excluded from the scan: its content is the learner's own code, not app UI.

These trees are a machine proxy. A VoiceOver recording is still needed for the case study.
