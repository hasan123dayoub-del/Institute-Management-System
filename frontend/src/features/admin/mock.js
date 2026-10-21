// Sample data with the SAME shape we expect from GET /stats/overview (snake_case, like the backend).
// When the backend endpoint is ready, flip USE_SAMPLE_DATA in useOverview.js and delete this file.
export const OVERVIEW = {
  students: { total: 149, waiting: 11 },
  courses: { running: 9, open: 2, finished: 1 },
  teachers: { total: 4 },
  pass_rate: 82,
  // students per level, split by shift
  by_level: [
    { level: 'A1', morning: 16, evening: 19 },
    { level: 'A2', morning: 14, evening: 20 },
    { level: 'B1', morning: 12, evening: 16 },
    { level: 'B2', morning: 9, evening: 15 },
    { level: 'C1', morning: 6, evening: 11 },
    { level: 'C2', morning: 4, evening: 7 },
  ],
  pass_by_level: [
    { level: 'A1', rate: 90 },
    { level: 'A2', rate: 86 },
    { level: 'B1', rate: 80 },
    { level: 'B2', rate: 77 },
    { level: 'C1', rate: 72 },
    { level: 'C2', rate: 68 },
  ],
  salaries: [
    { id: 1, full_name: 'Lina Haddad', salary: 3200000, salary_status: 'paid' },
    { id: 2, full_name: 'Sami Issa', salary: 2800000, salary_status: 'paid' },
    { id: 3, full_name: 'Rami Nasr', salary: 3000000, salary_status: 'unpaid' },
    { id: 4, full_name: 'Dana Issa', salary: 2900000, salary_status: 'unpaid' },
  ],
}
