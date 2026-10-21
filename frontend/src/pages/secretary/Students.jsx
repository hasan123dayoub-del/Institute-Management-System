import PagePlaceholder from '../../components/PagePlaceholder.jsx'

export default function Students() {
  return (
    <PagePlaceholder
      owner="Hasan (F1)"
      api={['GET /students', 'PATCH /students/:id/class', 'DELETE /students/:id']}
      todo={[
        'Tabs by status: All, Studying, Waiting, Finished',
        'Filters by level and shift, and a "+ New student" button',
        'Table: student, level, class, grades count, status, actions',
        'Actions: edit, move morning/evening, place in class (waiting students), set password',
        'Delete is disabled with a tooltip when the student has grades (API returns 409)',
      ]}
    />
  )
}
