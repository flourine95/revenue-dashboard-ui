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

## Setup

The API must be running on port 4000 before the app will load any data. Start it first, following the [API README](https://github.com/flourine95/revenue-dashboard-api).

You also need:

- Node.js 20.19+, 22.12+ or 24+ (22 LTS recommended)
- pnpm 12.11.2: `corepack enable && corepack prepare pnpm@12.11.2 --activate`

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open http://localhost:3000. The app redirects to `/login`, where the demo admin account from the API seed works:

| Email                 | Password    |
| --------------------- | ----------- |
| `admin@revenue.local` | `admin1234` |

## Environment variables

| Variable | Default | Used by | Purpose |
| --- | --- | --- | --- |
| `API_URL` | `http://localhost:4000` | server | Fetches made while rendering on the server |
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | browser | Login, logout and client-side refetches |

If you change `NEXT_PUBLIC_API_URL`, change `CORS_ORIGIN` in the API `.env` to the origin the browser loads the app from. Without that, sign-in fails because the browser blocks the cross-origin request.

## Routes

| Route | Access | Description |
| --- | --- | --- |
| `/` | session | Weekly dashboard with KPI cards, chart, comparison toggle and insight tabs |
| `/login` | public | Sign in with the demo admin account |
| `/admin` | session | Create, edit and delete daily metrics and chart events |

Both protected routes check the session on the server before they fetch data. Anonymous visitors go to `/login`.

## Features

- Week navigation with previous, next and "This week" controls.
- Series toggles for POS revenue, Eatclub revenue and labour cost.
- KPI cards for total revenue, average per day and total covers, each with the previous period and percent change.
- Event markers above the day they happened.
- The y-axis holds the reference 0.75k grid, so two weeks can be compared by eye. It grows only when a busier week would clip.
- PNG export of the card, without the toggle row but with the chart legend.
- Four insight tabs: period comparison, year-over-year, budget performance and performance score.
- Admin tables for the selected week, including days without data.

The previous period always arrives with the dashboard payload. The comparison toggle changes only what the chart draws, so pressing it costs no request and moves nothing on the page.

## Performance score

The score is a weighted view of the week:

- Revenue against the weekly budget: 50%
- Labour cost against a 30% target ratio: 30%
- Covers change against the previous period: 20%

The formula and its unit tests live in [`lib/score.ts`](lib/score.ts) and [`tests/score.test.ts`](tests/score.test.ts).

## Admin

`/admin` lists every day in the selected week, including days without a row. Saving a day replaces the whole day. Events support create, edit and delete, and both destructive actions use a confirmation dialog.

All admin requests use the same session cookie as the dashboard. The API rejects requests without a valid session.

## Tests and checks

```bash
pnpm test        # Vitest unit tests
pnpm typecheck   # TypeScript
pnpm lint        # ESLint
pnpm build       # production build
```

The unit tests cover date ranges, number and currency formatting, the performance score, the join between the current and previous series, and the chart axis scale. Login, navigation, admin CRUD and export were checked by hand in a browser; those scripts are not committed.

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
  page.tsx               dashboard page, fetching the session and data
  login/page.tsx         sign-in page
  admin/page.tsx         admin page
  loading.tsx            route-level skeleton
  error.tsx              runtime error boundary
  not-found.tsx          404 page
components/
  dashboard/             chart, KPI card, period navigation, insight tabs, export
  admin/                 metric and event tables, dialogs
  ui/                    the seven shadcn/ui primitives the app uses
lib/
  api/                   typed client, server fetcher, DTOs
  chart-scale.ts         y-axis scale for the revenue chart
  period.ts              week ranges and range formatting
  score.ts               performance score formula
tests/                   Vitest unit tests
```

## Behaviour to know about

The interface opens in the light theme; press `d` to switch to dark. On narrow screens the chart scrolls sideways.

The week and the open tab are held in memory, so a reload returns you to the current week.

The session cookie is httpOnly and shared across ports on `localhost`, which is how the Next.js server validates the session the browser received from the API.

## Related documentation

- [Project overview](https://github.com/flourine95/revenue-dashboard)
- [API repository](https://github.com/flourine95/revenue-dashboard-api)
