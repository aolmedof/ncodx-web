# NCODX Web

Frontend for NCODX — IT Consulting & Cloud Solutions. Bilingual public landing
(ES/EN) plus the project workspace: boards, repos, pipelines, timesheets,
contracts and invoices.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Runs at http://localhost:5173.

> The API only allows CORS from `http://localhost:5173`, `https://ncodx.com` and
> `https://www.ncodx.com`. Running the dev server on any other port will make
> every request fail with "Failed to fetch" — use 5173.

Authentication goes through the API. The hardcoded local credential list is a
development-only fallback and stays off unless `VITE_ENABLE_DEMO_AUTH=true`.

## Environment variables

| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Backend API base URL. Required — the client throws rather than silently defaulting to localhost in a production bundle. A trailing slash is stripped. | — |
| `VITE_DEFAULT_LOCALE` | Default language (`es` or `en`) | `es` |
| `VITE_ENABLE_DEMO_AUTH` | Allow the local demo-credential fallback | `false` |

## Architecture

Every screen reads from the API through TanStack Query. There is no mock data in
the app — `src/lib/mock-data.ts` was removed once the pages were wired up.

```
src/
  components/
    ui/                    # Design system: Button, Card, Badge, Field, Modal,
                           # StatTile, states (Skeleton/Empty/Error), PageShell
    charts/                # DailyHours (columns), StageBar, tooltip + tokens
    app/                   # GlobalTopbar, ProjectSidebar, CommandPalette
    landing/               # Hero, Navbar, Services, …
    common/                # LanguageSwitcher, ProtectedRoute, LoadingSpinner
  hooks/
    queries/
      resource.ts          # createResource(): list/detail/create/update/delete
      index.ts             # One hook set per API resource + useProjectMap
      proxy.ts             # Normalises GitHub/AWS proxy payloads
    useAuth.ts             # Wraps the auth store via useSyncExternalStore
    useNow.ts              # Current time as an external store (keeps render pure)
  lib/
    api.ts                 # Fetch client: bearer token, 401 handling, JSON errors
    auth.ts                # Session store + localStorage, cross-tab sync
    config.ts              # API_BASE_URL, DEMO_AUTH_ENABLED
    format.ts              # Currency, dates, relative time, compact numbers
  pages/
    public/                # Home (landing), SignIn
    app/                   # AppLayout, ProjectLayout + the workspace screens
  types/index.ts           # Wire types — mirror the API exactly (camelCase)
```

### Design system

Tokens live in `src/index.css` as a Tailwind v4 `@theme` block — there is no
`tailwind.config.js`. The palette is a refined dark surface stack (`canvas` →
`surface` → `card` → `raised` → `overlay`) with hairline borders and a single
green brand accent; monospace is reserved for code, IDs and invoice numbers.

Chart colours are validated, not eyeballed. The task-status ramp
(`--color-stage-1..4`) is a single-hue ordinal scale checked for monotone
lightness and surface contrast, and the categorical trio (`--color-viz-1..3`)
clears CVD and normal-vision separation against the card surface. Re-run the
validator if you change them.

### Adding a resource

```ts
export const goalsResource = createResource<Goal>('goals');
export const useGoals = goalsResource.useList;
```

That yields `useList`, `useOne`, `useCreate`, `useUpdate` and `useRemove`, with
mutations invalidating the resource on success.

## Translations

Edit `src/i18n/locales/es.json` and `en.json`:

```tsx
const { t } = useTranslation();
<p>{t('hero.headline')}</p>
```

## Build

```bash
npm run lint      # eslint (flat config)
npm run build     # tsc -b && vite build → dist/
```

## Stack

- React 19 + Vite 8 + TypeScript
- Tailwind CSS v4 (CSS-first `@theme`, no JS config)
- TanStack Query v5
- React Router v7
- i18next + react-i18next (ES/EN)
- @dnd-kit (board drag & drop)
- Recharts
- Lucide React
