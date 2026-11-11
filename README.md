# Code4Kidz

## Try the live demo

[Open Lesson 1](https://code4kidz-six.vercel.app/lesson/1). In the first exercise, enter `<p>Robots</p>` and select **Check my code** to see Byte’s retry feedback. Replace it with `<html></html>` and check again to advance. The live preview renders the code separately from the lesson’s validation.

A browser-based HTML and CSS course for kids aged 7–10. The learner picks something they love (dinosaurs, space, their
dog), and every lesson builds a real webpage about it in a live code editor, guided by a robot called Byte.

**Live demo:** https://code4kidz-six.vercel.app

[![CI](https://github.com/Nicolercc/code4kidz/actions/workflows/ci.yml/badge.svg)](https://github.com/Nicolercc/code4kidz/actions/workflows/ci.yml)

![Code4Kidz Lesson 1, step 1 of 5. The mission says to type <html></html>. The editor holds <p>Robots</p>, Byte says "Not quite! Open the hint if you need help.", a red bar under the editor says "Keep trying...", and the live preview shows the word Robots. Three hearts and 0 XP remain.](docs/images/code4kidz-lesson1-feedback.jpg)

## Try it in a minute: Lesson 1

1. **Open [Lesson 1](https://code4kidz-six.vercel.app/lesson/1).** On a first visit the app asks for a topic first (the screenshots use "Robots"), then drops you into the lesson.
2. **Type `<p>Robots</p>` and press *Check my code*.** The preview renders the word, but the step asks for the page container, so the answer is rejected: Byte says *Not quite!* and the editor shows *Keep trying…*. Pausing to think never counts as a mistake; only pressing *Check my code* does.
3. **Replace it with `<html></html>` and check again.** The step passes, you earn 1 XP, and the lesson moves to step 2 (add a `<head>`).

The check reads the code you typed, not the rendered preview. That's why a page that *looks* right can still be the wrong answer for the step. See [how the validators work](#how-it-works).

<img src="docs/images/code4kidz-lesson1-pass.jpg" width="640" alt="After typing <html></html> and checking: Lesson 1 is on step 2 of 5, 1 XP is shown, and Byte explains that the head is like the brain of your Robots page. The new mission asks for <head></head> inside the html tags.">

## How this was built

The Code4Kidz concept came from a collaborator who brought me in to build the frontend. I implemented the learning experience
and researched and structured the lesson flow (six lessons; write, fix a bug, find a bug and make-it-yours steps; topic
personalisation; Byte's copy), using Replit Agent for rapid AI-assisted prototyping. I then audited that prototype
and re-engineered it. The commit history from `chore/strip-scaffold`
onward is that work, one concern per commit, each with the evidence it was tested on.

What the audit found and what changed (with before/after numbers) is in
**[docs/case-study/RESULTS.md](docs/case-study/RESULTS.md)**. The short version:

- **Accessibility:** 0 axe violations on every screen (was 3–6 each). Feedback is announced to screen readers, the hint
  is readable, every control is reachable and visibly focused by keyboard. CI enforces it.
- **Correctness:** the answer checks now verify the task (29 of 123 cases used to fail), plus fixes for a white-screen
  crash, XP that was never awarded, and onboarding screens that were always skipped.
- **Learning design:** pausing to think is never counted as a mistake; hints are always available.
- **Phones:** the lesson screen works at 375px.

## How it works

```
src/
  data/lessons/      Six lessons as typed data: copy (with {topic}), starter code and a validator per step.
                     index.ts is the single registry (lookup, unlock order, copy resolution).
  utils/validator.ts  validate(step, code, topic): a pure function of the learner's code. CSS checks read the
  utils/htmlChecks.ts learner's own <style> rules (via the browser's CSS parser), not the rendered preview.
  lesson/attempt.ts   Pure reducer for one attempt at a step (editing / passed / failed) and the XP and heart rules.
  lesson/streak.ts    Pure daily-streak rules on local calendar days.
  hooks/useLessonMachine.ts  Drives a step: loads it, checks code after a pause (can only pass), "Check my code"
                     (can count a mistake), plays the pass/fail sequence. All timing goes through useTimers,
                     which cancels everything on unmount.
  store/gameStore.ts  Zustand, persisted to localStorage with a versioned migration. Progress only; per-step state
                     lives in the lesson machine.
  pages/, components/ React screens. The preview runs the learner's code in a fully sandboxed iframe (sandbox="").
```

There is no backend: progress lives in the browser.

**Stack:** React 19, TypeScript, Vite, Tailwind CSS v4, Zustand, CodeMirror 6, Framer Motion, React Router.
**Tests:** Vitest + Testing Library (unit and component), Playwright + axe-core (end-to-end and accessibility).

## Run it

Requires Node 20+ and pnpm 9+.

```bash
pnpm install
pnpm dev            # http://localhost:5173
```

| Command | What it does |
|---|---|
| `pnpm check` | Typecheck, lint, unit tests, build (what CI's first job runs) |
| `pnpm test` | Unit and component tests |
| `pnpm e2e` | Playwright end-to-end and axe tests on desktop and phone (builds and serves the app) |
| `pnpm build` / `pnpm preview` | Production build to `dist/`, and serve it |
| `node scripts/a11y-report.mjs <dir>` | axe violations, accessibility tree and screenshot per screen (needs `pnpm preview` running) |

## Deploy

Any static host. `vercel.json` rewrites every path to `index.html` so client-side routes survive a refresh.
Build command `pnpm build`, output directory `dist`.

## Known gaps

- The accessibility work has been verified with axe and accessibility-tree snapshots, not yet with a recording from a
  real screen reader.
- Lessons 7–10 and "Level 2: JavaScript" on the map are placeholders.
- "Share achievement" on the completion screen shares a link that only works on the learner's own device.
