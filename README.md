# Revenue Dashboard — UI

Next.js frontend for the Revenue Dashboard coding challenge. It renders the
weekly revenue, labour and covers view, the period/year-over-year insight tabs,
PNG export, and the admin screens used to manage the underlying data.

> The API lives in a separate repository (`revenue-dashboard-api`). Run both
> together — the UI needs the API on port 4000.

## Tech stack

| Concern    | Choice                                             |
| ---------- | -------------------------------------------------- |
| Framework  | Next.js 16 (App Router, React 19, Turbopack)       |
| Styling    | Tailwind CSS 4 + shadcn/ui (Base UI primitives)    |
| Charts     | Recharts 3                                         |
| Dates      | date-fns                                           |
| PNG export | html-to-image                                      |

## Prerequisites

- Node.js 20.19+, 22.12+ or 24+
- pnpm
- The API running at `http://localhost:4000` (see its README for setup)

## Quick start

```bash
# 1. Install dependencies
pnpm install

# 2. Point the UI at the API
cp .env.example .env.local

# 3. Start the dev server
pnpm dev
```

Open <http://localhost:3000>. You will be redirected to `/login`; the API seed
creates the demo admin account:

| Email                 | Password    |
| --------------------- | ----------- |
| `admin@revenue.local` | `admin1234` |

## Environment variables

| Variable              | Default                 | Used by | Purpose                                   |
| --------------------- | ----------------------- | ------- | ----------------------------------------- |
| `API_URL`             | `http://localhost:4000` | server  | Server-side fetches while rendering       |
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | browser | Client refetches and login/logout calls   |

`NEXT_PUBLIC_API_URL` must match the API's `CORS_ORIGIN` (default
`http://localhost:3000`), because the browser sends the session cookie directly
to the API.

## Routes

| Route    | Access    | Description                                                        |
| -------- | --------- | ------------------------------------------------------------------ |
| `/`      | session   | Weekly dashboard: KPI cards, chart, compare toggle, insight tabs   |
| `/login` | public    | Sign in with the demo admin account                                |
| `/admin` | session   | Create/edit/delete daily metrics and chart events                  |

Both protected routes are guarded on the server; anonymous visitors are
redirected to `/login` before any data is fetched.

## What the dashboard does

- **Week navigation** — previous/next week and a “This week” shortcut.
- **Series toggles** — POS revenue, Eatclub revenue and labour cost, with the
  previous period shown as translucent bars.
- **KPI cards** — total revenue, average per day and total covers, each with the
  previous-period value and percent delta.
- **Event markers** — positive/negative events rendered above the matching day.
- **Compare to Previous** — turns the comparison period on or off.
- **Export PNG** — downloads the card (controls excluded) using `html-to-image`.
- **Insight tabs** — Period Comparison, Year-over-Year (lazy loaded from
  `/api/dashboard/year-over-year`), Budget Performance and Performance Score.

The performance score is intentionally simple and explainable: 50% revenue vs
the weekly budget, 30% labour efficiency (30% of revenue is the target) and 20%
covers momentum. The formula lives in [`lib/score.ts`](lib/score.ts).

## Admin

`/admin` lists every day of the selected week, including days without a row
(“No data”), and the events in that week. Metrics are upserted per day with
`PUT /api/admin/metrics/:date`; events use the `POST`/`PATCH`/`DELETE` event
endpoints. All requests are authenticated by the same session cookie as the
dashboard.

## Scripts

| Script            | What it does                    |
| ----------------- | ------------------------------- |
| `pnpm dev`        | Start Next.js in dev mode       |
| `pnpm build`      | Production build                |
| `pnpm start`      | Serve the production build      |
| `pnpm lint`       | ESLint                          |
| `pnpm typecheck`  | TypeScript without emitting     |
| `pnpm format`     | Prettier over the source        |

## Project structure

```
app/
  page.tsx               # dashboard (server page + client screen)
  login/page.tsx         # login page
  admin/page.tsx         # admin page
  error.tsx              # friendly runtime error boundary
components/
  dashboard/             # chart, KPI card, period nav, insight tabs, export
  admin/                 # metrics/events tables and dialogs
  ui/                    # shadcn/ui primitives
lib/
  api/                   # typed client, server fetcher, DTOs
  period.ts              # week ranges and formatting
  score.ts               # performance score formula
```

## Notes

- The session cookie is `httpOnly` and shared across ports on `localhost`, so
  the Next.js server can validate the same session the browser received from
  the API.
- The app defaults to the light theme (press `d` to toggle dark mode).
- Chart data refreshes on week/compare changes; the page header shows an
  “updating” indicator while a refetch is in flight.
