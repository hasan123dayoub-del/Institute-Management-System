# Ascend frontend

React 19 + Vite + react-router 8 + **Tailwind CSS 4** + **shadcn/ui**, plain JavaScript (JSX).

```
npm install
npm run dev      # http://localhost:5173, /api is proxied to the backend
npm run lint
npm run build
```

The proxy target is `http://localhost:5000`. If that port is taken on your machine, create `frontend/.env.local` with `VITE_API_PROXY=http://127.0.0.1:5001` (and set `PORT=5001` in `backend/.env`). `.env.local` is not committed.

## What works today

Every screen of the design is built, in light and dark mode, and works end to end against the real backend.

| Role | Pages |
|---|---|
| everyone | Login (with show/hide password) |
| admin | Dashboard (real numbers and charts), Secretary accounts |
| secretary | Students, Register student, Classes, Class page (+ finished state with results), Teachers & salaries |
| teacher | My timetable (move / add / delete sessions), Grades (oral, midterm, final with the locking rules) |
| student | My dashboard |

To run everything you need the backend, its database and some data. In order:
```
cd backend && npm install && npm run db                              # terminal 1: local MongoDB replica set (leave it open)
cd backend && npm run seed && npm run seed:demo && npm run dev       # terminal 2
cd frontend && npm install && npm run dev                            # terminal 3
```
Then open http://localhost:5173. Demo logins (password `Demo12345`): secretary `sec@ascend.academy`, teacher `lina@ascend.academy`,
student `layan@mail.com`; the admin is the one from `backend/.env`. Details: [../backend/README.md](../backend/README.md) and [../docs/api-contract.md](../docs/api-contract.md).

### Working without the backend (optional)
`src/api/mode.js` has one flag per module and they are all `true`. For screen work without a server, list the modules to answer from
in-memory sample data in `frontend/.env.local`: `VITE_SAMPLE=classes,students,levels,schedules,grades,stats`.
The sample data (`src/api/sample/`) has the same shapes and the same rules as the real API.

## Structure

```
src/
├─ main.jsx · App.jsx            providers (theme, auth, tooltip, toaster) + router
├─ index.css                     Tailwind + ALL colours (light and dark). The only file with hex values
├─ lib/                          utils.js (cn) · format.js (levels, days, dates, labels) · schedule.js (next session)
├─ hooks/useLoad.js              useLoad(fn): data/loading/error/reload · perform(): run an action with toasts
├─ theme/                        ThemeProvider · useTheme · ThemeToggle (light | dark | system)
├─ auth/                         AuthProvider · useAuth · ProtectedRoute · roles.js · token.js
├─ api/                          client.js (fetch + JWT + errors), mode.js (flags), one file per resource, sample/
├─ layouts/                      AppShell (sidebar + top bar) · menus.js · Logo
├─ components/
│  ├─ ui/                        shadcn components (generated, do not edit by hand)
│  └─ *.jsx                      ours: Field, PasswordInput, PasswordField, StatusPill, Progress, ConfirmDialog, SetPasswordDialog
├─ routes/                       index.jsx + one routes file per role (pages are lazy loaded: lazyPage.js)
├─ features/<role>/              dialogs and pieces that belong to one role only
└─ pages/
   ├─ Login · Forbidden · NotFound
   └─ secretary/ · admin/ · teacher/ · student/
```

`@/` is an alias for `src/`: `import { Button } from '@/components/ui/button'`.

## How a page is written

```jsx
const { data, error, loading, reload } = useLoad(studentsApi.list)     // load when the page opens
...
perform(() => studentsApi.remove(id), 'Student deleted').then(reload)   // do something, toast, refresh
```
- Pages call `api/*` only (never `fetch`). Errors arrive as `ApiError` with `status`, `message`, `code`; `perform` shows the message as a toast and rethrows, so a dialog can stay open.
- Every list has three states: loading (Skeleton), error (red message), data (with an empty state).
- Dangerous actions go through `ConfirmDialog`. Setting someone's password goes through `SetPasswordDialog`.
- Field names are the backend's `snake_case` (`full_name`, `class_id`, `salary_status`), used as they come.

## Styling: Tailwind + shadcn
- Write styles as Tailwind classes: `<div className="flex items-center gap-2 rounded-lg border bg-card p-4">`.
- Use shadcn components from `@/components/ui/*`. Need another one? `npx shadcn@latest add <name>`, then check the new files import `cn` from `@/lib/utils` (the CLI sometimes writes `from "cn"` and installs a wrong `cn` package: fix the imports and `npm uninstall cn`).
- Toasts: `import { toast } from 'sonner'` then `toast.success('Saved')`. Icons: `lucide-react`.
- Join conditional classes with `cn('base', isActive && 'bg-primary')`.

## Dark / light mode
- Three modes: light, dark, system (follows the OS). The button is in the top bar and on the login page.
- Dark mode is the `dark` class on `<html>`. The choice is saved in `localStorage` (`ascend-theme`), and a small script in `index.html` applies it before the first paint (no flash).
- **Rule:** never write a colour like `#fff`, and never `bg-white` or `text-gray-500`. Use the theme classes: `bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border`, `bg-primary`, `text-destructive`, and the brand ones `bg-success-soft text-success`, `bg-warning-soft text-warning`, `bg-danger-soft`, `bg-peach`. Then every page works in both themes by itself.
- New colour? Add it in `src/index.css` three times: in `:root`, in `.dark`, and in `@theme inline`.
- Charts and SVG: use `var(--primary)`, `var(--peach)`.

## Roles and routes

| Role | Area | Pages |
|---|---|---|
| secretary | `/secretary` | students, students/new, classes, classes/:id, teachers |
| admin | `/admin` | dashboard, secretaries |
| teacher | `/teacher` | schedule, grades |
| student | `/student` | portal |

`ProtectedRoute` sends visitors to `/login` and the wrong role to `/forbidden`.
To add a page: create it in `pages/<role>/`, add one line in that role's `routes/<role>.routes.jsx` (with `lazyPage` and `handle: { title }`), and a link in `layouts/menus.js` if it needs a menu item.

## Who owns what
Secretary pages and the shared foundation (`components/`, `index.css`, `layouts/`, `api/`, `hooks/`, `lib/`): Hasan. Admin, teacher and student pages: the second frontend developer. Shared files change through a small PR.
