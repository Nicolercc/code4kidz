# Code4Kidz (Monorepo)

Code4Kidz is a pnpm workspace monorepo with a frontend app and an API server.

## Repo structure

- **Workspace root**: this directory (contains `pnpm-workspace.yaml` and the root `package.json`)
- **Frontend**: `artifacts/code4kidz` (Vite + React)
- **Backend**: `artifacts/api-server` (Express)
- **Shared libs**: `lib/*`
- **Scripts**: `scripts/`

## Prerequisites

- **Node.js** (recent LTS recommended)
- **pnpm** (the repo enforces pnpm; `npm`/`yarn` installs will be rejected)

## Install (one time)

From the repo root:

```bash
pnpm install
```

## Run locally

### Frontend (`artifacts/code4kidz`)

```bash
cd artifacts/code4kidz
pnpm run dev
```

Useful commands:

- `pnpm run build`
- `pnpm run serve`
- `pnpm run typecheck`

### Backend (`artifacts/api-server`)

The API server requires `PORT`.

```bash
cd artifacts/api-server
export PORT=3001
pnpm run dev
```

Health check:

- `GET /api/healthz`

Useful commands:

- `pnpm run build` (outputs `dist/index.mjs`)
- `pnpm run start` (runs `node --enable-source-maps ./dist/index.mjs`)
- `pnpm run typecheck`

## Typecheck / build the whole monorepo

From the repo root:

```bash
pnpm run typecheck
pnpm run build
```

