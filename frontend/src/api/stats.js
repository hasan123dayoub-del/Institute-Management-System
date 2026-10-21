import { api } from './client.js'
import { LIVE } from './mode.js'
import * as sample from './sample/api.js'

// Admin dashboard.
//   overview()  -> { students:{active, waiting}, classes:{running}, finance:{total_salaries, paid_teachers, total_teachers} }
//   breakdown() -> { pass_rate, courses:{open, finished}, by_level:[{level, morning, evening}], pass_by_level:[{level, rate}] }
//                  pass_rate and every rate are null until a course has finished

const real = {
  overview: async () => {
    const r = await api.get('/stats/overview') // camelCase finance fields on the backend
    return {
      students: r.students,
      classes: r.classes,
      finance: {
        total_salaries: r.finance.totalSalaries,
        paid_teachers: r.finance.paidTeachers,
        total_teachers: r.finance.totalTeachers,
      },
    }
  },
  breakdown: () => api.get('/stats/breakdown'),
}

const impl = LIVE.stats ? real : sample.stats
export const overview = impl.overview
export const breakdown = impl.breakdown
