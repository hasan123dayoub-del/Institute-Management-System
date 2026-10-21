import { BookOpen, GraduationCap, Trophy, Users, Wallet } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import PassRateList from '@/features/admin/PassRateList.jsx'
import SalariesTable from '@/features/admin/SalariesTable.jsx'
import ShiftDonut from '@/features/admin/ShiftDonut.jsx'
import StatCard from '@/features/admin/StatCard.jsx'
import StudentsByLevelChart from '@/features/admin/StudentsByLevelChart.jsx'
import { USE_SAMPLE_DATA } from '@/features/admin/config.js'
import { useOverview } from '@/features/admin/useOverview.js'

// Admin dashboard. Read only: it just shows numbers.
export default function Dashboard() {
  const { data, error, loading } = useOverview()

  // 1) still loading -> grey placeholder blocks
  if (loading) return <DashboardSkeleton />

  // 2) the request failed -> show why
  if (error) {
    return (
      <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-destructive" role="alert">
        {error}
      </p>
    )
  }

  // 3) we have data -> work out a few totals from it, then draw everything
  const morning = data.by_level.reduce((sum, row) => sum + row.morning, 0)
  const evening = data.by_level.reduce((sum, row) => sum + row.evening, 0)
  const paid = data.salaries.filter((t) => t.salary_status === 'paid').length
  const unpaid = data.salaries.length - paid
  const month = new Date().toLocaleString('en-US', { month: 'long' })

  return (
    <div className="flex flex-col gap-4">
      {USE_SAMPLE_DATA && (
        <Badge variant="outline" className="w-fit">Sample data: the stats API is not connected yet</Badge>
      )}

      {/* Row 1: five numbers. 1 column on phones, 2 on tablets, 5 on wide screens */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Students"
          value={data.students.total}
          note={`${data.students.waiting} waiting for a class`}
          icon={Users}
        />
        <StatCard
          title="Courses running"
          value={data.courses.running}
          note={`${data.courses.open} open · ${data.courses.finished} finished`}
          icon={BookOpen}
        />
        <StatCard title="Teachers" value={data.teachers.total} icon={GraduationCap} />
        <StatCard title="Pass rate" value={`${data.pass_rate}%`} note="last term" icon={Trophy} />
        <StatCard
          title={`${month} salaries`}
          value={`${paid}/${data.salaries.length}`}
          note={unpaid ? `${unpaid} unpaid` : 'All paid'}
          noteClassName={unpaid ? 'text-xs text-destructive' : 'text-xs text-success'}
          icon={Wallet}
        />
      </div>

      {/* Row 2: the two charts. On wide screens the bar chart takes 2/3 of the width */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StudentsByLevelChart data={data.by_level} />
        </div>
        <ShiftDonut morning={morning} evening={evening} />
      </div>

      {/* Row 3: salaries and pass rates */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SalariesTable salaries={data.salaries} month={month} />
        <PassRateList rows={data.pass_by_level} />
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
