export const SESSION_HOURS = 1.5;
const JS_DAY = Object.freeze({ sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, sat: 6 });

export const totalSessions = (level) => {
  const hours = Number(level?.hours);
  if (!Number.isFinite(hours) || hours <= 0) return 0;
  return Math.round(hours / SESSION_HOURS);
};

export function lastSessionDate(cls, schedules) {
  if (!cls?.start_date || !Array.isArray(schedules)) return null;
  const days = new Set(
    schedules.map((schedule) => JS_DAY[schedule.day]).filter(Number.isInteger),
  );
  const total = totalSessions(cls.level);
  const date = new Date(cls.start_date);
  if (!days.size || !total || Number.isNaN(date.getTime())) return null;
  date.setUTCHours(0, 0, 0, 0);

  let sessions = 0;
  for (let daysChecked = 0; daysChecked < total * 7; daysChecked += 1) {
    if (days.has(date.getUTCDay()) && ++sessions === total) return date;
    date.setUTCDate(date.getUTCDate() + 1);
  }
  return null;
}
