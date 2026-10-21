# Ascend frontend

React 19 + Vite + react-router 8 + **Tailwind CSS 4** + **shadcn/ui**, plain JavaScript (JSX).

```
npm install
npm run dev      # http://localhost:5173, /api is proxied to the backend
npm run lint
npm run build
```

The proxy target is `http://localhost:5000`. If that port is taken on your machine, create `frontend/.env.local` with `VITE_API_PROXY=http://127.0.0.1:5001` (and set `PORT=5001` in `backend/.env`). `.env.local` is not committed.

## Structure

```
src/
├─ main.jsx · App.jsx            providers (theme, auth, tooltip, toaster) + router
├─ index.css                     Tailwind + ALL colours (light and dark). The only file with hex values
├─ lib/utils.js                  cn(): merge Tailwind class names
├─ theme/                        ThemeProvider · useTheme · ThemeToggle (light | dark | system)
├─ auth/                         AuthProvider · useAuth · ProtectedRoute · roles.js · token.js
├─ api/                          client.js (fetch + JWT + errors) and one file per resource
├─ layouts/                      AppShell (sidebar + top bar) · menus.js · Logo
├─ components/
│  ├─ ui/                        shadcn components (generated, do not edit by hand)
│  └─ *.jsx                      our shared components: Field, PasswordField, StatusPill, Progress, PagePlaceholder
├─ routes/                       index.jsx + one routes file per role
├─ features/<role>/              components and hooks that belong to one role only
└─ pages/
   ├─ Login · Forbidden · NotFound
   └─ secretary/ · admin/ · teacher/ · student/
```

`@/` is an alias for `src/`: `import { Button } from '@/components/ui/button'`.

## Styling: Tailwind + shadcn
- Write styles as Tailwind classes: `<div className="flex items-center gap-2 rounded-lg border bg-card p-4">`.
- Use shadcn components from `@/components/ui/*` (Button, Card, Badge, Input, Label, Table, Tabs, Dialog, AlertDialog, Select, Checkbox, Textarea, Tooltip, Skeleton, Separator, Progress, DropdownMenu, Sonner).
- Need another one? `npx shadcn@latest add <name>` (for example `calendar`, `popover`). Then check that the imports say `@/lib/utils`.
- Toasts: `import { toast } from 'sonner'` then `toast.success('Saved')` or `toast.error(err.message)`.
- Icons: `lucide-react` (`import { Trash2 } from 'lucide-react'`).
- Join conditional classes with `cn('base', isActive && 'bg-primary')`.

## Dark / light mode
- Three modes: light, dark, system (follows the OS). The button is in the top bar and on the login page.
- Dark mode is the `dark` class on `<html>`. The choice is saved in `localStorage` (`ascend-theme`), and a small script in `index.html` applies it before the first paint (no flash).
- **Rule:** never write a colour like `#fff`, and never `bg-white` or `text-gray-500`. Use the theme classes: `bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border`, `bg-primary`, `text-destructive`, and the brand ones `bg-success-soft text-success`, `bg-warning-soft text-warning`, `bg-danger-soft`, `bg-peach`. Then every page works in both themes by itself.
- New colour? Add it in `src/index.css` three times: in `:root`, in `.dark`, and in `@theme inline`.
- Charts and SVG: use `fill-primary`, `stroke-border` or `var(--primary)`.

## How a page talks to the backend
`pages/*` call functions from `api/*` (never `fetch` directly). Errors arrive as `ApiError` with `status`, `message`, `code`; show `toast.error(err.message)`. A 401 logs the user out automatically.
Field names are the backend's `snake_case` (`full_name`, `class_id`, `salary_status`), used as they come.

## Roles and routes

| Role | Area | Pages |
|---|---|---|
| secretary | `/secretary` | students, students/new, classes, classes/:id, teachers |
| admin | `/admin` | dashboard, secretaries |
| teacher | `/teacher` | schedule, grades |
| student | `/student` | portal |

`ProtectedRoute` sends visitors to `/login` and the wrong role to `/forbidden`.
To add a page: create it in `pages/<role>/`, add one line in that role's `routes/<role>.routes.jsx` (with `handle: { title }`), and a link in `layouts/menus.js` if it needs a menu item.

## Who builds what

| | **F1: Hasan** (larger share) | **F2** |
|---|---|---|
| Foundation | theme, auth, api client, AppShell, shared components, `index.css`, `routes/index.jsx` | uses it; asks F1 (small PR) when a shared component is missing |
| Pages | Login, **secretary**: Students, RegisterStudent, Classes, ClassDetail (+ finished state), Teachers | **admin**: Dashboard, Secretaries · **teacher**: Schedule, Grades · **student**: Portal |
| Own folders | `features/secretary/`, `pages/secretary/`, `routes/secretary.routes.jsx` | `features/{admin,teacher,student}/`, `pages/{admin,teacher,student}/`, matching routes files |
| Later | i18n (English / Arabic), Figma, presentation, video | charts, timetable grid |

Shared files (`components/`, `index.css`, `layouts/`, `api/`): F1 owns them. F2 may add a new file there but should not change existing ones without telling F1.
Each placeholder page lists what to build and which API it uses. Delete `PagePlaceholder` from a page when you start it.
