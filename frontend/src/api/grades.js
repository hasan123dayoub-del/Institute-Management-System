import { api } from './client.js'
import { LIVE } from './mode.js'
import * as sample from './sample/api.js'

// Teacher, own classes only. The pages always see:
//   forClass(classId) -> { students:[{id, full_name}], grades:{ [studentId]: { oral, midterm, final } },
//                          course_end_date, grading_deadline, class_status }
//   save(classId, exam, [{ student_id, score }])   exam: 'oral' | 'midterm' | 'final'

const real = {
  forClass: async (classId) => {
    const r = await api.get(`/grades/class/${classId}`)
    const byStudent = {}
    for (const g of r.grades) (byStudent[g.student_id] ??= {})[g.exam] = g.score
    return {
      students: r.students.map((s) => ({ id: s._id, full_name: s.user_id?.full_name ?? 'Student' })),
      grades: byStudent,
      course_end_date: r.courseEndDate ?? null,
      grading_deadline: r.gradingDeadline ?? null,
      class_status: r.classStatus,
    }
  },
  save: (classId, exam, rows) =>
    api.put(`/grades/class/${classId}`, {
      exam,
      grades: rows.map(({ student_id, score }) => ({ student_id, score })),
    }),
}

const impl = LIVE.grades ? real : sample.grades
export const forClass = impl.forClass
export const save = impl.save
