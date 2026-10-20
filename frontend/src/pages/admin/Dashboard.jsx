import PagePlaceholder from '../../components/PagePlaceholder.jsx'

export default function Dashboard() {
  return (
    <PagePlaceholder
      owner="Dev 2 (F2)"
      api={['GET /stats/overview']}
      todo={[
        'Read-only page. KPI row: students, courses, teachers, pass rate, salaries paid n/total',
        'Students by level and shift (grouped bars) and morning vs evening (donut)',
        'Salaries table with paid / unpaid pills, and pass rate by level',
        'Charts must use theme tokens only so they work in light and dark',
      ]}
    />
  )
}
