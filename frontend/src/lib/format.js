// Small helpers used by many pages.

export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
export const DAYS = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu']
export const DAY_LABEL = {
  sat: 'Saturday',
  sun: 'Sunday',
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
}
// Hours when a class of each shift may meet (the timetable pages check it).
export const SHIFT_WINDOW = { morning: ['08:00', '14:00'], evening: ['14:00', '21:00'] }
// What the student status looks like in a sentence.
export const STUDENT_STATUS_LABEL = { waiting: 'Waiting', active: 'Studying', graduated: 'Graduated', withdrawn: 'Withdrawn' }
export const EXAMS = {
  oral: { label: 'Oral', max: 20 },
  midterm: { label: 'Midterm', max: 30 },
  final: { label: 'Final', max: 50 },
}

// Dates from the server are calendar days ("2026-11-24"), so we always format them as UTC days.
const DATE = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
const MONEY = new Intl.NumberFormat('en-US')

export const formatDate = (value) => (value ? DATE.format(new Date(value)) : '—')
export const formatMoney = (n) => MONEY.format(n ?? 0)
export const initialOf = (name = '') => name.trim()[0]?.toUpperCase() ?? '?'
export const toDateInput = (value) => (value ? new Date(value).toISOString().slice(0, 10) : '')
export const shiftLabel = (shift) => (shift === 'morning' ? 'Morning' : 'Evening')

// "B1 · Evening"
export const classLabel = (c) => (c ? `${c.level} · ${shiftLabel(c.shift)}` : '—')
