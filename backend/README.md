# Ascend API (backend)

Express 5 + Mongoose, ES modules.

## Run it (first time)

```
cd backend
npm install
copy .env.example .env        # then set JWT_SECRET and ADMIN_PASSWORD
npm run db                    # terminal 1: a local MongoDB replica set on port 27019. Leave it open
npm run seed                  # terminal 2: the six levels, the admin, and every collection with its indexes
npm run seed:demo             # optional: a whole demo institute (4 teachers, 12 classes, ~130 students, grades)
npm run dev                   # the API on http://localhost:5000
```

Why `npm run db`: creating a student, moving a student and finishing a course use **transactions**, and MongoDB only allows
them on a replica set. `npm run db` starts a separate one-node replica set inside this project (files in `.data/`, ignored by git),
so your other databases and the MongoDB service are not touched. You can use MongoDB Atlas instead: put its URL in `MONGO_URI`.
If port 5000 is taken on your machine (it is on some Windows PCs), set `PORT=5001` and point the frontend proxy to it (see frontend/README.md).

Demo logins after `npm run seed:demo` (password `Demo12345`): secretary `sec@ascend.academy`, teacher `lina@ascend.academy`
(also sami@, rami@, dana@), student `layan@mail.com`. The admin is the one from `.env`.
`npm test` runs the unit tests. The data model and every endpoint are described in [../docs/api-contract.md](../docs/api-contract.md).

## Student statuses
`waiting` (no class yet) → `active` (in a class) → when the course closes by itself, 3 days after the last session:
passed = next level, failed = same level, and in both cases `waiting` again. A student who passes C2 becomes `graduated`.
`withdrawn` students cannot log in. A student with grades is withdrawn, never deleted.

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
| Other | `middleware/*`, `lib/{AppError,jwt,password}`, `config/`, `seed.js`, `jobs/resetSalaries.js` | `middleware/ownsClass.js`, `GET /students/me` | `lib/{sessions,courseDates}.js`, `jobs/finishClasses.js` |

Shared files (`routers/index.js`, `seed.js`): add only your own lines, in small PRs.
Work on `feat/<area>-<topic>` branches and open a PR into `main`.

## P3 API

Schedule and grade endpoints require a teacher token. Teachers can access only
classes assigned to their teacher profile. The result-history endpoint allows
students, teachers, secretaries, and admins, with the result visibility rules
described below. The statistics endpoint requires an admin token.

| Method and path | Purpose |
|---|---|
| `GET /api/schedules?class_id=<id>` | List the teacher's schedules with the computed `courseEndDate`; `class_id` is optional. |
| `POST /api/schedules` | Add `{ class_id, day, start_time, end_time }`. |
| `PATCH /api/schedules/:id` | Move/update with `{ day, start_time, end_time }`; overlapping times return `409`. |
| `DELETE /api/schedules/:id` | Remove a schedule; returns the recalculated `courseEndDate` (or `null` if no schedule remains). |
| `GET /api/grades/class/:classId` | Return enrolled students, grades, computed course dates, and grading deadline. |
| `PUT /api/grades/class/:classId` | Save `{ exam, grades: [{ student_id, score }] }`, where exam is `oral`, `midterm`, or `final`. |
| `GET /api/results/student/:studentId` | Return the student's saved course-result history, including exam scores, total, and pass status. |
| `GET /api/stats/overview` | Return institute student, class, and salary overview for admins. |

Exam maximums are oral 20, midterm 30, and final 50. The class end date is
computed, not stored: `level.hours / 1.5` gives the number of 90-minute sessions,
and the recurring `Schedule.day` values determine the dates of those sessions
starting on or after the class `start_date`. The computed last session date is
returned as `courseEndDate` by schedule create/update/delete/list responses and
as `courseEndDate` by the class-grades endpoint. Final grades can be entered
from the computed last session date. Grade entry remains open through the
following three UTC calendar days. The daily UTC class-finishing job finishes
running classes after that grading window closes. It advances students with a
total of at least 60 to the next level, keeps other students at their current
level, and sets every student back to `waiting` (no class) so the secretary can place
them in the next course. A student who passes C2 becomes `graduated`. Finishing a class and updating its students is
transactional. On server startup, the job first checks for overdue classes,
then uses Node.js `setTimeout` to schedule the next check at 01:00 UTC. (`node-cron` is still
used by the monthly salary reset.)

When a class finishes, the `result` service saves one historical result per
student and class, including the three exam scores, total out of 100, missing
exam types, and pass status. Missing exam scores are treated as zero in the
total and listed in `missing_exams`. Students can view their own history;
teachers can view only results belonging to classes they taught, while
secretaries and admins can view any student's results. The result-history
endpoint returns these saved records, so a student's earlier course result
remains available after their level changes.

Student statuses are `active` (currently enrolled), `waiting` (not currently
assigned to a class), and `finished` (completed a class). Class statuses are a
separate enum: `open`, `running`, and `finished`. Finishing a class marks its
enrolled students `finished`; passing students advance a level, and failing
students stay at their level. The next placement workflow can assign them to a
new class and set them to `active`. No separate `graduated` or `withdrawn`
student status is used.

Class `start_date` values and the schedule weekdays must be set for the
calculated course end date and automation to work. Time comparisons use UTC.
Existing student records with legacy `withdrawn` or `graduated` statuses must
be migrated to one of the supported statuses before the finishing job processes
their class.

The schedule and grade endpoints use the existing snake_case model fields.
Run the backend against a MongoDB replica set to support the transactions used
by grade batches and class finishing.
