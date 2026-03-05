# NCODX Web

Frontend application for NCODX — IT Consulting & Cloud Solutions. Bilingual public landing (ES/EN) + full project management app.

## Setup local

```bash
npm install
cp .env.example .env
npm run dev
```

Runs at http://localhost:5173

**Demo credentials:** `demo@ncodx.com` / `password123`

## Environment variables

| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:3001` |
| `VITE_DEFAULT_LOCALE` | Default language (`es` or `en`) | `es` |

## Project structure

```
src/
  i18n/
    config.ts              # i18next setup
    locales/
      es.json              # Spanish translations
      en.json              # English translations
  pages/
    public/
      Home.tsx             # Landing page
      SignIn.tsx           # Auth page
    app/
      AppLayout.tsx        # Sidebar + Topbar shell
      Dashboard.tsx        # Overview stats
      Projects.tsx         # Project grid
      ProjectDetail.tsx    # Project kanban
      CalendarPage.tsx     # Calendar with connectors
      Tasks.tsx            # Kanban + list view
      Notes.tsx            # Post-it board
      AiChat.tsx           # AI chat interface
      Secrets.tsx          # Secrets manager
      Settings.tsx         # User settings
  components/
    landing/               # Hero, Navbar, Services, etc.
    app/                   # Sidebar, Topbar, KanbanBoard
    common/                # LanguageSwitcher, ProtectedRoute
  lib/
    auth.ts                # Dummy auth (login/logout/token)
    api.ts                 # Fetch client with Bearer token
    mock-data.ts           # All mock data
  hooks/
    useAuth.ts
    useTasks.ts
    useProjects.ts
  types/
    index.ts               # TypeScript types
```

## Adding translations

Edit `src/i18n/locales/es.json` and `src/i18n/locales/en.json`. Use the `useTranslation()` hook in components:

```tsx
const { t } = useTranslation();
<p>{t('hero.headline')}</p>
```

## Build for production

```bash
npm run build
# output → dist/
```

## Stack

- React 18 + Vite + TypeScript
- TailwindCSS v3
- Framer Motion (animations)
- React Router v6
- i18next + react-i18next (ES/EN)
- @tanstack/react-query
- @dnd-kit (drag & drop)
- react-big-calendar
- Lucide React
- date-fns v3
