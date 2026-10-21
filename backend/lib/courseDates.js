export const utcDateOnly = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
};

export const endOfUtcDate = (value) => {
  const day = utcDateOnly(value);
  if (!day) return null;
  day.setUTCHours(23, 59, 59, 999);
  return day;
};
