// The fake database behind every api module that is not LIVE yet (see ../mode.js).
// It lives in memory: a page reload brings back the original data.
// Classes, students, grades and timetables are consistent with each other, so every screen tells the same story.
import { EXAMS, LEVELS } from '@/lib/format.js'
import { addDays, addMinutes, lastSessionDate, sessionsDone, startDateFor, todayIso, totalSessions } from './courses.js'

export const TEACHERS = [
  { id: 't1', full_name: 'Lina Haddad' },
  { id: 't2', full_name: 'Sami Issa' },
  { id: 't3', full_name: 'Rami Nasr' },
  { id: 't4', full_name: 'Dana Issa' },
]
// Teacher screens (timetable, grades) show the classes of this teacher.
export const CURRENT_TEACHER = TEACHERS[0]

const MORNING = { A1: '08:30', A2: '10:00', B1: '11:30', B2: '08:30', C1: '10:00', C2: '11:30' }
const EVENING = { A1: '15:00', A2: '16:30', B1: '18:30', B2: '15:00', C1: '16:30', C2: '18:30' }

// level, shift, teacher, status, sessions done, days since the last session, students, starts in (days)
const PLAN = [
  ['A1', 'morning', 0, 'running', 20, 0, 14],
  ['A1', 'evening', 0, 'finished', 24, 9, 12],
  ['A2', 'morning', 1, 'running', 15, 0, 14],
  ['A2', 'evening', 1, 'running', 15, 0, 16],
  ['B1', 'morning', 2, 'running', 9, 0, 12],
  ['B1', 'evening', 2, 'running', 18, 0, 16],
  ['B2', 'morning', 3, 'running', 30, 1, 9],
  ['B2', 'evening', 3, 'running', 20, 0, 15],
  ['C1', 'morning', 0, 'running', 36, 1, 6], // last session was yesterday: the final exam can be entered now
  ['C1', 'evening', 0, 'running', 12, 0, 11],
  ['C2', 'morning', 1, 'open', 0, 0, 0, 10],
  ['C2', 'evening', 1, 'open', 0, 0, 0, 11],
]

const FIRST = ['Layan', 'Karim', 'Rami', 'Taim', 'Nour', 'Maya', 'Omar', 'Sara', 'Basel', 'Fadi', 'Joud', 'Haya', 'Yousef', 'Noor', 'Hiba', 'Ziad', 'Rima', 'Tarek', 'Dina', 'Samer', 'Lama', 'Adam', 'Mona', 'Hadi', 'Rawan', 'Ali', 'Lina', 'Majd', 'Salma', 'Ghaith']
const LAST = ['Saeed', 'Nasser', 'Khoury', 'Sallom', 'Hamdan', 'Khalil', 'Al-Ahmad', 'Youssef', 'Hammoud', 'Suleiman', 'Haddad', 'Mansour', 'Qasem', 'Abboud', 'Darwish']

let seed = 7
const rand = () => {
  seed = (seed * 16807) % 2147483647
  return seed / 2147483647
}
const nextLevel = (level) => LEVELS[LEVELS.indexOf(level) + 1] ?? null
const score = (exam, ratio) => Math.round(EXAMS[exam].max * ratio)

function build() {
  const today = todayIso()
  const classes = []
  const students = []
  const grades = {} // "classId:studentId" -> { oral, midterm, final }
  let counter = 0

  const makeStudent = (extra) => {
    counter += 1
    const full_name = `${FIRST[counter % FIRST.length]} ${LAST[(counter * 4 + Math.floor(counter / 30)) % LAST.length]}`
    const student = {
      id: `s${counter}`,
      user_id: `u${counter}`,
      full_name,
      email: `${full_name.toLowerCase().replace(/[^a-z]+/g, '.')}${counter}@mail.com`,
      phone: `0944 ${100 + ((counter * 7) % 900)} ${100 + ((counter * 13) % 900)}`,
      gender: counter % 2 ? 'female' : 'male',
      birth_date: '2008-05-14',
      address: 'Damascus',
      guardian_phone: '0944 222 111',
      placement_score: 40 + (counter % 40),
      status: 'active',
      level: 'A1',
      class_id: null,
      history: [],
      ...extra,
    }
    students.push(student)
    return student
  }

  PLAN.forEach(([level, shift, teacherIndex, status, done, endedAgo, count, startsIn], i) => {
    const id = `c${i + 1}`
    const total = totalSessions(level)
    const time = (shift === 'morning' ? MORNING : EVENING)[level]
    const days = shift === 'morning' ? ['sat', 'mon', 'wed'] : ['sun', 'tue', 'thu']
    const schedule = days.map((day, k) => ({ id: `${id}-s${k + 1}`, day, start_time: time, end_time: addMinutes(time, 90) }))
    const start_date =
      status === 'open' ? addDays(today, startsIn) : startDateFor(done, schedule, addDays(today, -endedAgo))

    classes.push({ id, level, shift, teacher: TEACHERS[teacherIndex], room: `R${(i % 4) + 1}`, capacity: 20, start_date, status, schedule })

    const progress = done / total
    for (let k = 0; k < count; k++) {
      const student = makeStudent({ level, class_id: id, history: [id] })
      const noGradesYet = status === 'running' && done > 0 && k === count - 1 // the newest student: deletable
      const failing = status === 'finished' && k < 3
      const ratio = () => (failing ? rand() * 0.1 : 0.45 + 0.5 * rand())
      const g = {}
      if (!noGradesYet) {
        if (progress >= 0.4) g.oral = score('oral', 0.5 + 0.45 * ratio())
        if (progress >= 0.55) g.midterm = score('midterm', 0.5 + 0.45 * ratio())
        if (status === 'finished') g.final = score('final', 0.5 + 0.45 * ratio())
      }
      if (Object.keys(g).length) grades[`${id}:${student.id}`] = g

      if (status === 'finished') {
        // the course closed by itself: passed students move up, everybody waits for a new class
        const total100 = (g.oral ?? 0) + (g.midterm ?? 0) + (g.final ?? 0)
        student.status = 'waiting'
        student.class_id = null
        if (total100 >= 60) student.level = nextLevel(level) ?? level
      }
    }
  })

  // a few students in other situations
  makeStudent({ level: 'A1', status: 'waiting' })
  makeStudent({ level: 'A1', status: 'waiting' })
  makeStudent({ level: 'A1', status: 'waiting' })
  makeStudent({ level: 'A2', status: 'waiting' })
  makeStudent({ level: 'A2', status: 'waiting' })
  makeStudent({ level: 'C2', status: 'graduated' })
  makeStudent({ level: 'C2', status: 'graduated' })
  const withdrawn = makeStudent({ level: 'B2', status: 'withdrawn', history: ['c8'] })
  makeStudent({ level: 'B2', status: 'withdrawn' })
  grades[`c8:${withdrawn.id}`] = { oral: 15 } // has a grade, so she cannot be deleted: she was withdrawn instead

  // the student who logs in to the student portal
  const me = students.find((s) => s.class_id === 'c6')
  Object.assign(me, { full_name: 'Layan Saeed', email: 'layan@mail.com', phone: '0944 123 456' })

  return { classes, students, grades, meId: me.id, nextClass: classes.length + 1, nextStudent: counter + 1, nextSession: 1000 }
}

export const db = build()

// ---- helpers shared by the sample api modules ----
export const wait = (value) => new Promise((resolve) => setTimeout(() => resolve(value), 200))

export const gradesCount = (studentId) =>
  Object.entries(db.grades)
    .filter(([key]) => key.endsWith(`:${studentId}`))
    .reduce((sum, [, g]) => sum + Object.keys(g).length, 0)

export function classView(c) {
  const today = todayIso()
  const total = totalSessions(c.level)
  const done = c.status === 'open' ? 0 : c.status === 'finished' ? total : sessionsDone(c.start_date, c.schedule, today, total)
  const last = lastSessionDate(c.start_date, c.schedule, total)
  return {
    id: c.id,
    level: c.level,
    shift: c.shift,
    room: c.room,
    capacity: c.capacity,
    start_date: c.start_date,
    status: c.status,
    teacher: c.teacher,
    schedule: c.schedule.map((s) => ({ ...s })),
    students_count: db.students.filter((s) => s.class_id === c.id).length,
    total_sessions: total,
    sessions_done: done,
    last_session_date: last,
    closes_on: last ? addDays(last, 3) : null,
  }
}

export const findClass = (id) => db.classes.find((c) => c.id === id)
export const findStudent = (id) => db.students.find((s) => s.id === id)
