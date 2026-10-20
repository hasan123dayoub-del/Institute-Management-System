import PagePlaceholder from '../../components/PagePlaceholder.jsx'

export default function Portal() {
  return (
    <PagePlaceholder
      owner="Dev 2 (F2)"
      api={['GET /students/me']}
      todo={[
        'Read only. Next session card: class, teacher, room, time',
        'Course progress n/total with end date, and the latest grade',
        'Level ladder A1 to C2 with the current level highlighted',
        'Grades list for the current level, and account details (no password change: ask the front desk)',
      ]}
    />
  )
}
