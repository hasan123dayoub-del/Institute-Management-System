# API contract

All paths start with `/api`. JSON in and out, fields in `snake_case`, ids as `id`, errors as `{ message, code }`.
Everything below is **implemented, connected to the frontend and tested end to end** (backend + MongoDB replica set + browser).
Who may call what is checked by the server (`authorize`): the frontend only hides what a role cannot use.

| Area | Endpoints | Roles |
|---|---|---|
| Login | `POST /auth/login`, `GET /auth/me` | everyone |
| Secretaries | `GET/POST /secretaries`, `PATCH/DELETE /secretaries/:id` | admin |
| Passwords | `PATCH /users/:id/password` | admin (secretaries), secretary (teachers, students). Teachers: use their `user_id` |
| Teachers | `GET /teachers`, `POST /teachers`, `PATCH /teachers/:id`, `POST /teachers/:id/pay` | secretary (all), admin (read) |
| Levels | `GET /levels` | any logged in user |
| Classes | `GET /classes`, `GET /classes/:id`, `GET /classes/:id/students`, `POST /classes`, `PATCH /classes/:id`, `POST /classes/:id/start`, `DELETE /classes/:id` | secretary; teacher reads only their own |
| Students | `GET /students`, `POST /students`, `PATCH /students/:id`, `PATCH /students/:id/class`, `DELETE /students/:id`, `GET /students/me` | secretary; `me` is for students |
| Timetable | `GET/POST /schedules`, `PATCH/DELETE /schedules/:id` | teacher (own classes) |
| Grades | `GET/PUT /grades/class/:classId` | teacher (own classes) |
| Results | `GET /results/student/:studentId` | student (own), teacher (own classes), secretary, admin |
| Statistics | `GET /stats/overview`, `GET /stats/breakdown` | admin |

## Shapes

```
Class = { id, level: "B1", shift: "morning"|"evening", room, capacity, start_date, status: "open"|"running"|"finished",
          teacher: { id, full_name },                       // id = the TEACHER id, same as /teachers
          students_count, total_sessions, sessions_done, last_session_date, closes_on,   // computed from the level hours and the timetable
          schedule: [{ id, day, start_time, end_time }] }

POST  /classes                { level, shift, teacher_id, room, capacity, start_date }
PATCH /classes/:id            { teacher_id, room, capacity }
GET   /classes/:id/students -> [{ id, user_id, full_name, phone, level, status, grades: { oral, midterm, final }, grades_count }]
                               grades are the ones of THIS class. A finished class lists its students from the saved results.

Student = { id, user_id, full_name, email, phone, gender, birth_date, address, guardian_phone, placement_score,
            level, status: "waiting"|"active"|"withdrawn"|"graduated",
            class: { id, label, level, shift, status } | null, grades_count }

POST  /students               { full_name, email, password, phone, gender, birth_date, guardian_phone, address, placement_score,
                                level, class_id | null }   // account + student in one transaction
PATCH /students/:id           { full_name, phone, gender, birth_date, guardian_phone, address, placement_score, status: "withdrawn" }
PATCH /students/:id/class     { class_id }                // grades move with the student, one transaction
GET   /students/me          -> Student + { class: { id, level, shift, room, teacher_name, schedule, start_date,
                                           sessions_done, total_sessions, course_end_date } | null, grades: { oral, midterm, final } }

GET /schedules              -> { schedules: [{ _id, class_id: <populated class>, day, start_time, end_time, courseEndDate }] }
GET /grades/class/:classId  -> { students, grades, courseStartDate, courseEndDate, gradingDeadline, classStatus }
GET /stats/overview         -> { students: { active, waiting }, classes: { running }, finance: { totalSalaries, paidTeachers, totalTeachers } }
GET /stats/breakdown        -> { pass_rate, courses: { open, finished }, by_level: [{ level, morning, evening }], pass_by_level: [{ level, rate }] }
                               pass_rate and every rate are null until a course has finished
```
(The timetable, grades and overview answers keep the format of their original author; the frontend adapters in
`frontend/src/api/{schedules,grades,stats}.js` turn them into the snake_case shapes the pages use.)

## Rules the server enforces (and the pages show as they come)

| Code | Status | When |
|---|---|---|
| `EMAIL_TAKEN` | 409 | the email is already used |
| `LAST_SECRETARY` | 409 | deleting the last active secretary |
| `ALREADY_PAID` | 409 | paying a salary twice in a month |
| `DUPLICATE` | 409 | a class for the same level, shift and start date already exists |
| `NOT_OPEN` / `NOT_DELETABLE` | 409 | starting a class that is not open / deleting one that is not open and empty |
| `CLASS_FULL` | 409 | no seat left (capacity) |
| `LEVEL_MISMATCH` | 400 | placing a student in a class of another level |
| `FINISHED` | 409 | changing or joining a finished class |
| `HAS_GRADES` | 409 | deleting a student who has grades (withdraw instead) |
| `CONFLICT` | 409 | a timetable clash with another session of the same teacher |
| `FORBIDDEN` | 403 | final grades before the last session, after the 3-day window, or someone else's class |

## Course life cycle
`open` → (secretary starts it) `running` → (by itself, 3 days after the last session) `finished`.
The daily job saves one result per student, moves those who passed to the next level, and puts everybody back on the
waiting list (`graduated` after C2). Total sessions = level hours / 1.5; the last session date comes from the start date and the timetable days.
