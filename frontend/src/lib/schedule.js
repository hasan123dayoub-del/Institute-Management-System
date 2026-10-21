const JS_DAY = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, sat: 6 }

// The next session of a weekly timetable, counting from now.
// schedule: [{ day: 'sun', start_time: '18:30', end_time: '20:00' }, ...]
// Returns { date: Date, day, start_time, end_time } or null. A session of today counts until it ends.
export function nextSession(schedule, now = new Date()) {
  if (!schedule?.length) return null
  const minutes = (time) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3))
  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  for (let ahead = 0; ahead < 8; ahead++) {
    const date = new Date(now)
    date.setDate(now.getDate() + ahead)
    const sessions = schedule
      .filter((s) => JS_DAY[s.day] === date.getDay())
      .sort((a, b) => a.start_time.localeCompare(b.start_time))
    for (const s of sessions) {
      if (ahead > 0 || nowMinutes < minutes(s.end_time)) return { date, ...s }
    }
  }
  return null
}
