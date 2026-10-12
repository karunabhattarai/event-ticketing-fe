# Event Ticketing — Frontend

React + TypeScript SPA for browsing events and buying tickets, talking to the [backend API](../event-booking-backend).

## Stack

- React 18, TypeScript, Vite
- React Router, TanStack Query
- React Hook Form + Zod (forms/validation)
- Tailwind CSS
- Vitest + Testing Library + MSW for tests

## Prerequisites

- Node.js 20+
- Yarn 4 (via Corepack — `corepack enable`)
- Backend API running (see `event-booking-backend/README.md`)

## Setup

```bash
yarn install
cp .env.example .env
# set VITE_API_BASE_URL to your backend URL
yarn dev
```

Vite dev server runs on `http://localhost:5173` by default.

## Environment variables

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | base URL of the backend API (e.g. `http://localhost:3000`) |

## Scripts

| Command | Description |
|---|---|
| `yarn dev` | start Vite dev server |
| `yarn build` | typecheck (`tsc -b`) and build production bundle to `dist/` |
| `yarn test` | run Vitest suite |

## Testing

Tests use Vitest + Testing Library with MSW for mocking API calls (`tests/setup.ts`).

```bash
yarn test
```
