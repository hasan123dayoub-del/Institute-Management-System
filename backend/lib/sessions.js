// Sessions are computed, not stored: total = level.hours / 1.5.
export const SESSION_HOURS = 1.5;
const JS_DAY = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, sat: 6 };

export const totalSessions = (level) => Math.round(level.hours / SESSION_HOURS);

// cls: { start_date, level: { hours } }, schedules: [{ day }]
export function lastSessionDate(cls, schedules) {
  const days = new Set(schedules.map((s) => JS_DAY[s.day]));
  if (!days.size) return null;
  const total = totalSessions(cls.level);
  const d = new Date(cls.start_date);
  let count = 0;
  for (;;) {
    if (days.has(d.getDay()) && ++count === total) return d;
    d.setDate(d.getDate() + 1);
  }
}

