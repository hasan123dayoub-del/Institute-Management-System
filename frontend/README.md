# Ascend frontend

React 19 + Vite + react-router 8, plain JavaScript (JSX).

```
npm install
npm run dev      # http://localhost:5173, /api is proxied to http://localhost:5000
npm run lint
npm run build
```

## Structure

```
src/
├─ main.jsx · App.jsx            providers (theme, auth) + router
├─ styles/
│  ├─ tokens.css                 ALL colours, light + dark. The only place with hex values
│  ├─ base.css                   reset, typography
│  └─ components.css             .btn .card .pill .table .field .kpi ... (shared classes)
├─ theme/                        ThemeProvider · useTheme · ThemeToggle (light | dark | system)
├─ auth/                         AuthProvider · useAuth · ProtectedRoute · roles.js · token.js
├─ api/                          client.js (fetch + JWT + errors) and one file per resource
├─ layouts/                      AppShell (sidebar + top bar) · menus.js · Logo
├─ components/                   shared UI: Field, PasswordField, StatusPill, Progress, PagePlaceholder
├─ routes/                       index.jsx + one routes file per role
├─ features/<role>/              components and hooks that belong to one role only
└─ pages/
   ├─ Login · Forbidden · NotFound
   └─ secretary/ · admin/ · teacher/ · student/
```

## Dark / light mode
- Three modes: light, dark, system (follows the OS). The button is in the top bar and on the login page.
- The choice is saved in `localStorage` (`ascend-theme`), and a tiny script in `index.html` applies it before the first paint (no flash).
- **Rule:** never write a colour like `#fff` in a component or page CSS. Use `var(--surface)`, `var(--ink)`, `var(--teal)`... from `styles/tokens.css`. Then every page works in both themes by itself.
- Charts and SVG: colour them with the same variables (`fill: var(--teal)`).

## How a page talks to the backend
`pages/*` call functions from `api/*` (never `fetch` directly). Errors arrive as `ApiError` with `status`, `message`, `code`; show `err.message` in a toast or notice. A 401 logs the user out automatically.
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
| Foundation | theme, auth, api client, AppShell, shared components, `styles/`, `routes/index.jsx` | uses it; asks F1 (small PR) when a shared component is missing |
| Pages | Login, **secretary**: Students, RegisterStudent, Classes, ClassDetail (+ finished state), Teachers | **admin**: Dashboard, Secretaries · **teacher**: Schedule, Grades · **student**: Portal |
| Own folders | `features/secretary/`, `pages/secretary/`, `routes/secretary.routes.jsx` | `features/{admin,teacher,student}/`, `pages/{admin,teacher,student}/`, matching routes files |
| Later | i18n (English / Arabic), Figma, presentation, video | charts, timetable grid |

Shared files (`components/`, `styles/`, `layouts/`, `api/`): F1 owns them. F2 may add a new file there but should not change existing ones without telling F1.
Each placeholder page lists what to build and which API it uses. Delete `PagePlaceholder` from a page when you start it.
