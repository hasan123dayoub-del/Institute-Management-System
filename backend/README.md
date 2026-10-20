# Ascend API (backend)

Express 5 + Mongoose, ES modules. Run: copy `.env.example` to `.env`, then `npm run seed` and `npm run dev`.
Transactions need a replica set (MongoDB Atlas, or local `mongod --replSet rs0`).

## Layers (request goes top to bottom)

| Layer | Folder | Job | May use |
|---|---|---|---|
| Router | `routers/` | URL + middleware chain (`authorize`, `validate`, `ownsClass`) | controllers |
| Controller | `Controllers/` | read `req`, call a service, send `res`. No rules | services |
| Service | `services/` | **all business rules**, throws `AppError` | models, lib, other services |
| Model | `Models/` | schema, indexes, simple validators | mongoose |

Rules: controllers never import models. Services never see `req`/`res`. Errors are `AppError(status, message, code)` and leave as `{ message, code }`.
Multi-document changes (create student, move student, finish class) run in one `mongoose` transaction.

## ES module rules
- Every local import ends in `.js`.
- `import "dotenv/config"` stays the first import in `server.js` and `seed.js`.
- `export default` for models/routers/middleware; named exports for `lib/`, controllers, services, jobs.

## Ownership (three developers)

| | P1: foundation, accounts, salaries | P2: classes and students | P3: schedules, grades, automation, stats |
|---|---|---|---|
| Models | User, Teacher | Level, Class, Student | Schedule, Grade |
| Services | auth, user, secretary, teacher | level, class, student | schedule, grade, stats |
| Controllers | auth, user, secretary, teacher | level, class, student | schedule, grade, stats |
| Routers | auth, users, secretaries, teachers | levels, classes, students | schedules, grades, stats |
| Other | `middleware/*`, `lib/{AppError,jwt,password}`, `config/`, `seed.js`, `jobs/resetSalaries.js` | `middleware/ownsClass.js`, `GET /students/me` | `lib/sessions.js`, `jobs/finishClasses.js` |

Shared files (`routers/index.js`, `seed.js`): add only your own lines, in small PRs.
Work on `feat/<area>-<topic>` branches and open a PR into `main`.
