// Sample implementations of the api modules, with the SAME function names, arguments and answers as the real
// ones, and the same business rules and errors (409, 403...) the backend is supposed to apply.
// api/classes.js (and the others) pick between these and the real calls using ./mode.js.
import { ApiError } from '../client.js'
import { EXAMS, LEVELS, classLabel } from '@/lib/format.js'
import { GRACE_DAYS, HOURS, addDays, lastSessionDate, todayIso, totalSessions } from './courses.js'
import { CURRENT_TEACHER, TEACHERS, classView, db, findClass, findStudent, gradesCount, wait } from './db.js'

const err = (status, message, code) => new ApiError(status, message, code)

// ------------------------------------------------------------------ levels
export const levels = {
  list: async () => wait(LEVELS.map((code) => ({ id: code, code, hours: HOURS[code] }))),
}

// ------------------------------------------------------------------ classes
export const classes = {
  list: async (params = {}) =>
    wait(db.classes.filter((c) => !params.status || c.status === params.status).map(classView)),

  // classes of the logged in teacher (the real backend filters GET /classes by role)
  mine: async () => wait(db.classes.filter((c) => c.teacher.id === CURRENT_TEACHER.id).map(classView)),

  get: async (id) => {
    const c = findClass(id)
    if (!c) throw err(404, 'Class not found', 'NOT_FOUND')
    return wait(classView(c))
  },

  // students of a class, with their grades for THIS class
  students: async (id) => {
    const cls = findClass(id)
    if (!cls) throw err(404, 'Class not found', 'NOT_FOUND')
    // a finished class keeps its history: the students already left it
    const rows = cls.status === 'finished' ? db.students.filter((s) => s.history.includes(id)) : db.students.filter((s) => s.class_id === id)
    return wait(
      rows.map((s) => ({
        id: s.id,
        user_id: s.user_id,
        full_name: s.full_name,
        phone: s.phone,
        level: s.level,
        status: s.status,
        grades: { ...(db.grades[`${id}:${s.id}`] ?? {}) },
        grades_count: gradesCount(s.id),
      })),
    )
  },

  create: async ({ level, shift, teacher_id, room, capacity, start_date }) => {
    if (db.classes.some((c) => c.level === level && c.shift === shift && c.start_date === start_date))
      throw err(409, 'A class for this level and shift already starts on that date', 'DUPLICATE')
    const teacher = await teacherById(teacher_id)
    const cls = { id: `c${db.nextClass++}`, level, shift, teacher, room: room || '', capacity: Number(capacity) || 20, start_date, status: 'open', schedule: [] }
    db.classes.push(cls)
    return wait(classView(cls))
  },

  update: async (id, { teacher_id, room, capacity }) => {
    const cls = findClass(id)
    if (!cls) throw err(404, 'Class not found', 'NOT_FOUND')
    const count = db.students.filter((s) => s.class_id === id).length
    if (capacity !== undefined && Number(capacity) < count)
      throw err(409, `The class already has ${count} students`, 'CAPACITY')
    if (teacher_id) cls.teacher = await teacherById(teacher_id)
    if (room !== undefined) cls.room = room
    if (capacity !== undefined) cls.capacity = Number(capacity)
    return wait(classView(cls))
  },

  start: async (id) => {
    const cls = findClass(id)
    if (!cls) throw err(404, 'Class not found', 'NOT_FOUND')
    if (cls.status !== 'open') throw err(409, 'Only an open class can be started', 'NOT_OPEN')
    cls.status = 'running'
    return wait(classView(cls))
  },

  remove: async (id) => {
    const cls = findClass(id)
    if (!cls) throw err(404, 'Class not found', 'NOT_FOUND')
    if (cls.status !== 'open' || db.students.some((s) => s.class_id === id))
      throw err(409, 'Only an open class with no students can be deleted', 'NOT_DELETABLE')
    db.classes = db.classes.filter((c) => c.id !== id)
    return wait(null)
  },
}

async function teacherById(id) {
  const known = TEACHERS.find((t) => t.id === id)
  if (known) return known
  // teachers are real (LIVE), so a new class may point at a real teacher id
  const { list } = await import('../teachers.js')
  const found = (await list()).find((t) => t.id === id)
  return { id, full_name: found?.full_name ?? 'Teacher' }
}

// ------------------------------------------------------------------ students
const studentView = (s) => {
  const c = s.class_id ? findClass(s.class_id) : null
  return {
    id: s.id,
    user_id: s.user_id,
    full_name: s.full_name,
    email: s.email,
    phone: s.phone,
    gender: s.gender,
    birth_date: s.birth_date,
    address: s.address,
    guardian_phone: s.guardian_phone,
    placement_score: s.placement_score,
    level: s.level,
    status: s.status,
    class: c ? { id: c.id, label: classLabel(c), level: c.level, shift: c.shift, status: c.status } : null,
    grades_count: gradesCount(s.id),
  }
}

function seatsCheck(cls) {
  if (db.students.filter((s) => s.class_id === cls.id).length >= cls.capacity)
    throw err(409, 'This class is full', 'CLASS_FULL')
}

export const students = {
  list: async (params = {}) =>
    wait(
      db.students
        .filter((s) => !params.status || s.status === params.status)
        .filter((s) => !params.level || s.level === params.level)
        .filter((s) => !params.shift || findClass(s.class_id)?.shift === params.shift)
        .map(studentView),
    ),

  create: async (data) => {
    if (db.students.some((s) => s.email === data.email.toLowerCase()))
      throw err(409, 'This email is already in use', 'EMAIL_TAKEN')
    let class_id = null
    if (data.class_id) {
      const cls = findClass(data.class_id)
      if (!cls) throw err(404, 'Class not found', 'NOT_FOUND')
      if (cls.level !== data.level) throw err(400, 'The class is at a different level', 'LEVEL_MISMATCH')
      if (cls.status === 'finished') throw err(409, 'This class is finished', 'FINISHED')
      seatsCheck(cls)
      class_id = cls.id
    }
    const id = `s${db.nextStudent++}`
    const student = {
      id,
      user_id: `u${id}`,
      full_name: data.full_name,
      email: data.email.toLowerCase(),
      phone: data.phone ?? '',
      gender: data.gender ?? null,
      birth_date: data.birth_date ?? null,
      address: data.address ?? '',
      guardian_phone: data.guardian_phone ?? '',
      placement_score: data.placement_score ?? null,
      status: class_id ? 'active' : 'waiting',
      level: data.level,
      class_id,
      history: class_id ? [class_id] : [],
    }
    db.students.push(student)
    return wait(studentView(student))
  },

  update: async (id, data) => {
    const s = findStudent(id)
    if (!s) throw err(404, 'Student not found', 'NOT_FOUND')
    for (const key of ['full_name', 'phone', 'address', 'guardian_phone', 'birth_date', 'gender', 'status']) {
      if (data[key] !== undefined) s[key] = data[key]
    }
    return wait(studentView(s))
  },

  // Put a waiting student in a class, or move a student to another class of the same level.
  // The grades of the old class go with the student (one transaction in the real backend).
  move: async (id, classId) => {
    const s = findStudent(id)
    const cls = findClass(classId)
    if (!s || !cls) throw err(404, 'Student or class not found', 'NOT_FOUND')
    if (cls.level !== s.level) throw err(400, 'The class must be at the same level as the student', 'LEVEL_MISMATCH')
    if (cls.status === 'finished') throw err(409, 'This class is finished', 'FINISHED')
    if (s.class_id === cls.id) return wait(studentView(s))
    seatsCheck(cls)
    if (s.class_id) {
      const old = `${s.class_id}:${s.id}`
      if (db.grades[old]) {
        db.grades[`${cls.id}:${s.id}`] = db.grades[old]
        delete db.grades[old]
      }
    }
    s.class_id = cls.id
    s.status = 'active'
    s.history.push(cls.id)
    return wait(studentView(s))
  },

  remove: async (id) => {
    const s = findStudent(id)
    if (!s) throw err(404, 'Student not found', 'NOT_FOUND')
    if (gradesCount(id) > 0) throw err(409, 'This student has grades and cannot be deleted. Withdraw them instead.', 'HAS_GRADES')
    db.students = db.students.filter((x) => x.id !== id)
    return wait(null)
  },

  setPassword: async () => wait(null),

  // the student portal
  me: async () => {
    const s = findStudent(db.meId)
    const c = s.class_id ? classView(findClass(s.class_id)) : null
    return wait({
      ...studentView(s),
      class: c && {
        id: c.id,
        level: c.level,
        shift: c.shift,
        room: c.room,
        teacher_name: c.teacher.full_name,
        schedule: c.schedule,
        start_date: c.start_date,
        sessions_done: c.sessions_done,
        total_sessions: c.total_sessions,
        course_end_date: c.last_session_date,
      },
      grades: c ? { ...(db.grades[`${c.id}:${s.id}`] ?? {}) } : {},
    })
  },
}

// ------------------------------------------------------------------ schedules (the logged in teacher)
const myClasses = () => db.classes.filter((c) => c.teacher.id === CURRENT_TEACHER.id)
const endDate = (c) => lastSessionDate(c.start_date, c.schedule, totalSessions(c.level))
const sessionView = (c, s) => ({
  id: s.id,
  class_id: c.id,
  class: { id: c.id, level: c.level, shift: c.shift, status: c.status, room: c.room },
  day: s.day,
  start_time: s.start_time,
  end_time: s.end_time,
  course_end_date: endDate(c),
})

function ownClass(classId) {
  const cls = findClass(classId)
  if (!cls) throw err(404, 'Class not found', 'NOT_FOUND')
  if (cls.teacher.id !== CURRENT_TEACHER.id) throw err(403, 'This is not your class', 'FORBIDDEN')
  return cls
}

function assertNoClash(candidate, ignoreId) {
  const clash = myClasses()
    .filter((c) => c.status !== 'finished')
    .flatMap((c) => c.schedule)
    .some((s) => s.id !== ignoreId && s.day === candidate.day && candidate.start_time < s.end_time && candidate.end_time > s.start_time)
  if (clash) throw err(409, 'Teacher has a timetable clash', 'CONFLICT')
}

function assertValidTimes({ start_time, end_time }) {
  if (start_time >= end_time) throw err(400, 'The end time must be after the start time', 'BAD_REQUEST')
}

export const schedules = {
  list: async () => wait(myClasses().flatMap((c) => c.schedule.map((s) => sessionView(c, s)))),

  add: async ({ class_id, day, start_time, end_time }) => {
    const cls = ownClass(class_id)
    if (cls.status === 'finished') throw err(400, 'Course is already finished', 'BAD_REQUEST')
    assertValidTimes({ start_time, end_time })
    assertNoClash({ day, start_time, end_time })
    const session = { id: `x${db.nextSession++}`, day, start_time, end_time }
    cls.schedule.push(session)
    return wait({ id: session.id, course_end_date: endDate(cls) })
  },

  move: async (id, { day, start_time, end_time }) => {
    const cls = myClasses().find((c) => c.schedule.some((s) => s.id === id))
    if (!cls) throw err(404, 'Schedule not found', 'NOT_FOUND')
    if (cls.status === 'finished') throw err(400, 'Course is already finished', 'BAD_REQUEST')
    assertValidTimes({ start_time, end_time })
    assertNoClash({ day, start_time, end_time }, id)
    Object.assign(cls.schedule.find((s) => s.id === id), { day, start_time, end_time })
    return wait({ id, course_end_date: endDate(cls) })
  },

  remove: async (id) => {
    const cls = myClasses().find((c) => c.schedule.some((s) => s.id === id))
    if (!cls) throw err(404, 'Schedule not found', 'NOT_FOUND')
    if (cls.status === 'finished') throw err(400, 'Course is already finished', 'BAD_REQUEST')
    cls.schedule = cls.schedule.filter((s) => s.id !== id)
    return wait({ course_end_date: endDate(cls) })
  },
}

// ------------------------------------------------------------------ grades (the logged in teacher)
export const grades = {
  forClass: async (classId) => {
    const cls = ownClass(classId)
    const rows = db.students.filter((s) => s.class_id === classId && s.status === 'active')
    const last = endDate(cls)
    return wait({
      students: rows.map((s) => ({ id: s.id, full_name: s.full_name })),
      grades: Object.fromEntries(rows.map((s) => [s.id, { ...(db.grades[`${classId}:${s.id}`] ?? {}) }])),
      course_end_date: last,
      grading_deadline: last ? addDays(last, GRACE_DAYS) : null,
      class_status: cls.status,
    })
  },

  // same rules as the backend: the final opens on the last session day, everything closes 3 days later
  save: async (classId, exam, rows) => {
    const cls = ownClass(classId)
    const max = EXAMS[exam]?.max
    if (!max) throw err(400, 'Invalid exam type', 'BAD_REQUEST')
    if (cls.status === 'finished') throw err(400, 'Course is already finished', 'BAD_REQUEST')
    const last = endDate(cls)
    if (!last) throw err(409, 'A valid class schedule is required', 'SCHEDULE_REQUIRED')
    const today = todayIso()
    if (exam === 'final' && today < last) throw err(403, 'Final grades cannot be entered before the last session', 'FORBIDDEN')
    if (today > addDays(last, GRACE_DAYS)) throw err(403, 'Grading window has closed', 'FORBIDDEN')
    for (const { student_id, score } of rows) {
      if (!Number.isFinite(score) || score < 0 || score > max)
        throw err(400, `Scores for ${exam} must be between 0 and ${max}`, 'BAD_REQUEST')
      const s = findStudent(student_id)
      if (!s || s.class_id !== classId) throw err(400, 'Every student must belong to this class', 'BAD_REQUEST')
    }
    for (const { student_id, score } of rows) {
      db.grades[`${classId}:${student_id}`] = { ...(db.grades[`${classId}:${student_id}`] ?? {}), [exam]: score }
    }
    return wait({ message: 'Grades recorded successfully' })
  },
}

// ------------------------------------------------------------------ stats
const PASS_BY_LEVEL = [90, 86, 80, 77, 72, 68]

export const stats = {
  overview: async () =>
    wait({
      students: {
        active: db.students.filter((s) => s.status === 'active').length,
        waiting: db.students.filter((s) => s.status === 'waiting').length,
      },
      classes: { running: db.classes.filter((c) => c.status === 'running').length },
      finance: { total_salaries: 0, paid_teachers: 0, total_teachers: 0 },
    }),

  // numbers the charts need and the real stats endpoint does not give yet
  breakdown: async () =>
    wait({
      pass_rate: 82,
      courses: {
        open: db.classes.filter((c) => c.status === 'open').length,
        finished: db.classes.filter((c) => c.status === 'finished').length,
      },
      by_level: LEVELS.map((level) => {
        const count = (shift) =>
          db.students.filter((s) => s.status === 'active' && s.level === level && findClass(s.class_id)?.shift === shift).length
        return { level, morning: count('morning'), evening: count('evening') }
      }),
      pass_by_level: LEVELS.map((level, i) => ({ level, rate: PASS_BY_LEVEL[i] })),
    }),
}
