# Revenue Dashboard UI

Next.js frontend for the Revenue Dashboard. It renders the weekly revenue, labour and covers view, the period and year-over-year insight tabs, PNG export, and the admin screens used to manage metrics and events.

The API runs in a separate repository. Start it on port 4000 before you start this app.

## Stack

| Concern    | Choice                                                        |
| ---------- | ------------------------------------------------------------- |
| Framework  | Next.js 16 with the App Router, React 19 and Turbopack        |
| Styling    | Tailwind CSS 4 and shadcn/ui components on Base UI primitives |
| Charts     | Recharts 3                                                    |
| Dates      | date-fns                                                      |
| PNG export | html-to-image, loaded only when the export button is pressed  |
| Tests      | Vitest                                                        |

## Prerequisites

- Node.js 20.19 or newer
- pnpm
- The API running at `http://localhost:4000`

## Run locally

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open http://localhost:3000. The app redirects to `/login`. The API seed creates the demo admin account:

| Email                 | Password    |
| --------------------- | ----------- |
| `admin@revenue.local` | `admin1234` |

## Environment variables

| Variable | Default | Used by | Purpose |
| --- | --- | --- | --- |
| `API_URL` | `http://localhost:4000` | server | Fetches made while rendering on the server |
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | browser | Login, logout and client-side refetches |

`NEXT_PUBLIC_API_URL` must match the API `CORS_ORIGIN`, which defaults to `http://localhost:3000`. The browser sends the session cookie directly to the API.

## Routes

| Route | Access | Description |
| --- | --- | --- |
| `/` | session | Weekly dashboard with KPI cards, chart, comparison toggle and insight tabs |
| `/login` | public | Sign in with the demo admin account |
| `/admin` | session | Create, edit and delete daily metrics and chart events |

Both protected routes check the session on the server before they fetch data. Anonymous visitors go to `/login`.

## Features

- Week navigation with previous, next and “This week” controls.
- Series toggles for POS revenue, Eatclub revenue and labour cost.
- KPI cards for total revenue, average per day and total covers, each with the previous period and percent change.
- Event markers above the day they happened.
- PNG export of the card. The export omits the toggle row and keeps the chart legend.
- Four insight tabs: period comparison, year-over-year, budget performance and performance score.
- Admin tables for the selected week, including days without data.

The previous period is always part of the dashboard payload. The comparison toggle changes rendering only, which keeps the layout stable and avoids a request on every press.

## Performance score

The score is a weighted view of three signals:

- Revenue against the weekly budget: 50%
- Labour cost against a 30% target ratio: 30%
- Covers change against the previous period: 20%

The formula and its unit tests live in [`lib/score.ts`](lib/score.ts) and [`tests/score.test.ts`](tests/score.test.ts).

## Admin

`/admin` lists every day in the selected week, including days without a row. Saving a day replaces the whole day. Events support create, edit and delete, and both destructive actions use a confirmation dialog.

All admin requests use the same session cookie as the dashboard. The API rejects requests without a valid session even when someone calls the endpoint outside the UI.

## Tests and checks

```bash
pnpm test        # Vitest unit tests
pnpm typecheck   # TypeScript
pnpm lint        # ESLint
pnpm build       # production build
```

The unit tests cover date ranges, number and currency formatting, the performance score and the join between the current and previous series. Browser checks for login, navigation, admin CRUD and export were run manually with Playwright and are not committed.

## Scripts

| Script            | What it does                      |
| ----------------- | --------------------------------- |
| `pnpm dev`        | Start Next.js in development mode |
| `pnpm build`      | Production build                  |
| `pnpm start`      | Serve the production build        |
| `pnpm test`       | Run the Vitest suite once         |
| `pnpm test:watch` | Run Vitest in watch mode          |
| `pnpm lint`       | ESLint                            |
| `pnpm typecheck`  | TypeScript without emitting       |
| `pnpm format`     | Prettier over the source          |

## Project structure

```text
app/
  page.tsx               dashboard page with parallel session and data fetch
  login/page.tsx         sign-in page
  admin/page.tsx         admin page
  loading.tsx            route-level skeleton
  error.tsx              runtime error boundary
  not-found.tsx          404 page
components/
  dashboard/             chart, KPI card, period navigation, insight tabs, export
  admin/                 metric and event tables, dialogs
  ui/                    shadcn/ui primitives
lib/
  api/                   typed client, server fetcher, DTOs
  period.ts              week ranges and range formatting
  score.ts               performance score formula
tests/                   Vitest unit tests
```

## Notes

- The session cookie is httpOnly and shared across ports on `localhost`, so the Next.js server can validate the session the browser received from the API.
- The interface defaults to the light theme. Press `d` to toggle dark mode.
- The chart scrolls horizontally on narrow screens.
- The selected week and active tab are not in the URL. A reload returns to the current week.

## Related documentation

- [Root project README](../README.md)
- [API README](../revenue-dashboard-api/README.md)
