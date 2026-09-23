# Code4Kidz

A browser-based HTML/CSS course for kids aged 7–10. The learner picks a topic they love, and every lesson builds a real webpage about it in a live editor, guided by a robot mascot called Byte.

> **Status:** prototype under active remediation. It was prototyped with Replit Agent from my product and curriculum specs. I'm now auditing and re-engineering it by hand (tests, accessibility, correctness). See the commit history from `chore/strip-scaffold` onward.

## Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · Zustand (persisted to localStorage) · CodeMirror 6 · Framer Motion · React Router

There is no backend. Progress lives in the browser.

## Run locally

Requires Node 20+ and pnpm 9+.

```bash
pnpm install
pnpm dev          # http://localhost:5173
```

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Start the dev server |
| `pnpm build` | Typecheck, then build to `dist/` |
| `pnpm preview` | Serve the production build |
| `pnpm typecheck` | Run TypeScript with no emit |

## Deploy

`vercel.json` rewrites every path to `index.html` so client-side routes work on refresh. Build command `pnpm build`, output directory `dist`.
