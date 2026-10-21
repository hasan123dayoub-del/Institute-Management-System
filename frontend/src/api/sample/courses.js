// Course maths, the same rules the backend uses (see backend/lib/sessions.js):
// total sessions = level hours / 1.5, and the end date is found by walking the calendar
// day by day and counting the days that are in the class timetable.
// Dates are plain "YYYY-MM-DD" strings, treated as UTC days.

export const HOURS = { A1: 36, A2: 36, B1: 45, B2: 45, C1: 54, C2: 54 }
export const SESSION_HOURS = 1.5
export const GRACE_DAYS = 3 // teachers may still enter the final grades this many days after the last session

const JS_DAY = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, sat: 6 }
const DAY_MS = 86_400_000

export const totalSessions = (level) => Math.round(HOURS[level] / SESSION_HOURS)

export const toDate = (iso) => new Date(`${iso}T00:00:00Z`)
export const toIso = (date) => date.toISOString().slice(0, 10)
export const addDays = (iso, n) => toIso(new Date(toDate(iso).getTime() + n * DAY_MS))
export const todayIso = () => toIso(new Date())

export const addMinutes = (time, minutes) => {
  const total = Number(time.slice(0, 2)) * 60 + Number(time.slice(3)) + minutes
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

const classDays = (schedule) => new Set(schedule.map((s) => JS_DAY[s.day]))
const isClassDay = (days, iso) => days.has(toDate(iso).getUTCDay())

// The day of the last session, or null when the timetable is empty.
export function lastSessionDate(start, schedule, total) {
  const days = classDays(schedule)
  if (!start || days.size === 0) return null
  let count = 0
  for (let d = start; ; d = addDays(d, 1)) {
    if (isClassDay(days, d) && ++count === total) return d
  }
}

// How many sessions have been held from `start` up to and including `today`.
export function sessionsDone(start, schedule, today, total) {
  const days = classDays(schedule)
  if (!start || days.size === 0 || today < start) return 0
  let count = 0
  for (let d = start; d <= today && count < total; d = addDays(d, 1)) {
    if (isClassDay(days, d)) count++
  }
  return count
}

// The start date that makes `done` sessions fall between the start and `ref` (used to build sample data).
export function startDateFor(done, schedule, ref) {
  const days = classDays(schedule)
  let count = 0
  for (let d = ref; ; d = addDays(d, -1)) {
    if (isClassDay(days, d) && ++count === done) return d
  }
}
