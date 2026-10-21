import { BookOpen, GraduationCap, Trophy, Users, Wallet } from 'lucide-react'
import * as statsApi from '@/api/stats.js'
import * as teachersApi from '@/api/teachers.js'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import PassRateList from '@/features/admin/PassRateList.jsx'
import SalariesTable from '@/features/admin/SalariesTable.jsx'
import ShiftDonut from '@/features/admin/ShiftDonut.jsx'
import StatCard from '@/features/admin/StatCard.jsx'
import StudentsByLevelChart from '@/features/admin/StudentsByLevelChart.jsx'
import { useLoad } from '@/hooks/useLoad.js'

// Three sources, asked at the same time:
//  - stats.overview()   students and running classes
//  - stats.breakdown()  numbers for the charts (null when the backend cannot give them yet)
//  - teachers.list()    salaries (real backend)
// Defined outside the component so useLoad sees the same function on every render.
const loadDashboard = () =>
  Promise.all([statsApi.overview(), statsApi.breakdown(), teachersApi.list()]).then(([overview, breakdown, teachers]) => ({
    overview,
    breakdown,
    teachers,
  }))

// Admin dashboard. Read only: it just shows numbers.
export default function Dashboard() {
  const { data, error, loading } = useLoad(loadDashboard)

  if (loading) return <DashboardSkeleton />
  if (error) {
    return <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-destructive" role="alert">{error}</p>
  }

  const { overview, breakdown, teachers } = data
  const paid = teachers.filter((t) => t.salary_status === 'paid').length
  const unpaid = teachers.length - paid
  const month = new Date().toLocaleString('en-US', { month: 'long' })

  // totals for the donut, worked out from the per-level numbers
  const morning = breakdown?.by_level.reduce((sum, row) => sum + row.morning, 0) ?? 0
  const evening = breakdown?.by_level.reduce((sum, row) => sum + row.evening, 0) ?? 0

  return (
    <div className="flex flex-col gap-4">
      {/* Row 1: five numbers. 1 column on phones, 2 on tablets, 5 on wide screens */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Students"
          value={overview.students.active}
          note={`${overview.students.waiting} waiting for a class`}
          icon={Users}
        />
        <StatCard
          title="Courses running"
          value={overview.classes.running}
          note={breakdown ? `${breakdown.courses.open} open · ${breakdown.courses.finished} finished` : undefined}
          icon={BookOpen}
        />
        <StatCard title="Teachers" value={teachers.length} icon={GraduationCap} />
        <StatCard
          title="Pass rate"
          value={breakdown?.pass_rate == null ? '—' : `${breakdown.pass_rate}%`}
          note={breakdown?.pass_rate == null ? 'no finished course yet' : 'finished courses'}
          icon={Trophy}
        />
        <StatCard
          title={`${month} salaries`}
          value={teachers.length ? `${paid}/${teachers.length}` : '—'}
          note={teachers.length ? (unpaid ? `${unpaid} unpaid` : 'All paid') : 'no teachers yet'}
          noteClassName={teachers.length === 0 ? undefined : unpaid ? 'text-xs text-destructive' : 'text-xs text-success'}
          icon={Wallet}
        />
      </div>

      {/* Row 2: the two charts. On wide screens the bar chart takes 2/3 of the width */}
      {breakdown ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <StudentsByLevelChart data={breakdown.by_level} />
          </div>
          <ShiftDonut morning={morning} evening={evening} />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Charts</CardTitle>
            <CardDescription>
              Students by level and shift, and pass rates, need extra numbers from the stats API. They will appear here as soon as it provides them.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Row 3: salaries and pass rates */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SalariesTable salaries={teachers} month={month} />
        {breakdown && <PassRateList rows={breakdown.pass_by_level} />}
      </div>
    </div>
  )
}

// Same layout as the real page, made of grey blocks, so nothing jumps when the data arrives.
function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading dashboard">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-80 lg:col-span-2" />
        <Skeleton className="h-80" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  )
}
