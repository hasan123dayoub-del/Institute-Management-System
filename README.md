# 🎓 Ascend — Institute Management System

A full-stack management platform for an English language academy. It handles the whole academic cycle — student registration, placement by level, classes and timetables, grading, automatic course closing and level promotion — plus teacher salaries and admin analytics.

![Node.js](https://img.shields.io/badge/Node.js-Express%205-339933?logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/UI-shadcn%2Fui-000000)

---

## ✨ Features

| Role | What they can do |
| :--- | :--- |
| **Admin** | Dashboard with live statistics and charts, manage secretary accounts |
| **Secretary** | Register students, manage classes and teachers, place / move students, pay salaries |
| **Teacher** | Manage the timetable of their own classes, enter oral / midterm / final grades |
| **Student** | Personal portal: current class, schedule, progress and grades |

**Highlights**

- 🔐 **JWT authentication** with server-side role checks on every route (`authorize`, `ownsClass`).
- 🔄 **MongoDB transactions** for multi-document changes (create a student, move a student, finish a course).
- ⏰ **Automation with `node-cron`** — courses close themselves 3 days after the last session, results are saved, students who passed move up a level (and graduate after C2); monthly salaries are reset.
- 🧱 **Layered backend** — Router → Controller → Service → Model, with all business rules in services and typed errors (`AppError`).
- ✅ **Validation with Zod** and clear error codes (`CLASS_FULL`, `LEVEL_MISMATCH`, `CONFLICT`, …).
- 📊 **Analytics** — pass rates, students per level and shift, salary overview (Recharts).
- 🌗 **Light / dark theme**, lazy-loaded pages, loading / error / empty states everywhere.

---

## 🛠 Tech Stack

| Part | Technologies |
| :--- | :--- |
| **Backend** | Node.js, Express 5 (ES modules), Mongoose, JWT, bcrypt, Zod, node-cron |
| **Database** | MongoDB (local replica set or MongoDB Atlas) |
| **Frontend** | React 19, Vite, React Router, Tailwind CSS 4, shadcn/ui (Radix), Recharts, Sonner, lucide-react |
| **Testing** | Node's built-in test runner (`node --test`) |

---

## 📁 Project Structure

```text
Institute-Management-System/
├── backend/            # Express API
│   ├── routers/        # URLs + middleware chain
│   ├── Controllers/    # read req → call a service → send res
│   ├── services/       # all business rules
│   ├── Models/         # Mongoose schemas & indexes
│   ├── middleware/     # authenticate, authorize, ownsClass, validate, errorHandler
│   ├── jobs/           # finishClasses, resetSalaries (cron)
│   ├── lib/            # AppError, jwt, password, sessions, courseDates
│   └── tests/
├── frontend/           # React app
│   └── src/
│       ├── api/        # one client file per resource
│       ├── auth/       # AuthProvider, ProtectedRoute, roles
│       ├── pages/      # admin / secretary / teacher / student
│       └── components/
└── docs/
    └── api-contract.md # every endpoint, shape and error code
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- MongoDB (installed locally) or a MongoDB Atlas connection string

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # set JWT_SECRET and ADMIN_PASSWORD

npm run db                # terminal 1 — local MongoDB replica set (keep it open)
npm run seed              # terminal 2 — levels, admin account, indexes
npm run seed:demo         # optional — demo institute (teachers, classes, ~130 students, grades)
npm run dev               # API on http://localhost:5000
```

> Transactions require a replica set — `npm run db` starts a one-node replica set inside the project without touching your other databases. You can use MongoDB Atlas instead by setting `MONGO_URI`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev               # http://localhost:5173 (/api is proxied to the backend)
```

### Demo Accounts

After `npm run seed:demo` (password **`Demo12345`**):

| Role | Email |
| :--- | :--- |
| Secretary | `sec@ascend.academy` |
| Teacher | `lina@ascend.academy` |
| Student | `layan@mail.com` |
| Admin | the one set in `backend/.env` |

### Tests

```bash
cd backend
npm test
```

---

## 📡 API Overview

All routes start with `/api`. Full details: **[docs/api-contract.md](docs/api-contract.md)**.

| Area | Endpoints | Roles |
| :--- | :--- | :--- |
| Auth | `POST /auth/login`, `GET /auth/me` | everyone |
| Secretaries | `GET/POST /secretaries`, `PATCH/DELETE /secretaries/:id` | admin |
| Teachers | `GET/POST /teachers`, `PATCH /teachers/:id`, `POST /teachers/:id/pay` | secretary, admin (read) |
| Classes | `GET/POST /classes`, `GET/PATCH/DELETE /classes/:id`, `POST /classes/:id/start` | secretary, teacher (own) |
| Students | `GET/POST /students`, `PATCH/DELETE /students/:id`, `PATCH /students/:id/class`, `GET /students/me` | secretary, student (me) |
| Timetable | `GET/POST /schedules`, `PATCH/DELETE /schedules/:id` | teacher (own classes) |
| Grades | `GET/PUT /grades/class/:classId` | teacher (own classes) |
| Results | `GET /results/student/:studentId` | student, teacher, secretary, admin |
| Statistics | `GET /stats/overview`, `GET /stats/breakdown` | admin |

---

## 🔁 Course Life Cycle

```text
open ──(secretary starts it)──▶ running ──(3 days after the last session, automatic)──▶ finished
```

When a course finishes, a daily job saves one result per student, promotes those who passed to the next level and puts everyone back on the waiting list — students who pass **C2** become `graduated`.

---

## 👥 Team

Built by a team of three developers, each owning a part of the system (foundation & accounts · classes & students · schedules, grades & automation), working on feature branches with pull requests into `main`.

More docs: [backend/README.md](backend/README.md) · [frontend/README.md](frontend/README.md)

## 🙋 My contribution (Hasan Dayoub)

Team project with [@saraalhorani24](https://github.com/saraalhorani24) and [@Hanan-Alkahwaji](https://github.com/Hanan-Alkahwaji). My work came in through the `hasan` branch and these pull requests:

- [#2](https://github.com/hasan123dayoub-del/Institute-Management-System/pull/2) Backend foundation fixes: ESM setup, model constraints, auth and middleware
- [#3](https://github.com/hasan123dayoub-del/Institute-Management-System/pull/3) Frontend structure: light/dark theme, auth, API client, layouts, routes per role
- [#7](https://github.com/hasan123dayoub-del/Institute-Management-System/pull/7) Dashboard
- [#8](https://github.com/hasan123dayoub-del/Institute-Management-System/pull/8) Add-secretary page
- [#6](https://github.com/hasan123dayoub-del/Institute-Management-System/pull/6), [#9](https://github.com/hasan123dayoub-del/Institute-Management-System/pull/9) Remaining backend services, live frontend, demo data and docs

Areas I owned:

- **React frontend:** `frontend/src` (components, pages, features, API client, layouts, routes, auth, theme)
- **Backend services:** class, student, schedule, teacher, grade, result and secretary services in `backend/services`
- **Automation:** the `backend/jobs/finishClasses.js` scheduled job
- **Docs and data:** `backend/seedDemo.js`, the READMEs and `docs/api-contract.md`

Teammates' work arrived through the `sara` ([#1](https://github.com/hasan123dayoub-del/Institute-Management-System/pull/1)) and `hanan` ([#4](https://github.com/hasan123dayoub-del/Institute-Management-System/pull/4)) branches.
