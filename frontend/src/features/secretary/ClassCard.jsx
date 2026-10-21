import { ArrowRight, Play } from 'lucide-react'
import { Link } from 'react-router'
import Progress from '@/components/Progress.jsx'
import StatusPill from '@/components/StatusPill.jsx'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatDate } from '@/lib/format.js'

// One class on the "Classes" page: who teaches it, how full it is, how far the course went.
export default function ClassCard({ cls, onStart }) {
  const when =
    cls.status === 'open'
      ? `Starts ${formatDate(cls.start_date)}`
      : cls.status === 'finished'
        ? `Ended ${formatDate(cls.last_session_date)}`
        : `Last session ${formatDate(cls.last_session_date)}`

  return (
    <Card className="gap-2 py-3">
      <CardContent className="flex flex-col gap-2 px-4 text-sm">
        <div className="flex items-center justify-between gap-2">
          <StatusPill value={cls.shift} />
          <StatusPill value={cls.status} />
        </div>
        <p>
          {cls.teacher.full_name}
          {cls.room && <span className="font-mono text-muted-foreground"> · {cls.room}</span>}
          <span className="font-mono text-muted-foreground"> · {cls.students_count}/{cls.capacity}</span>
        </p>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">{cls.sessions_done}/{cls.total_sessions}</span>
          <Progress value={cls.sessions_done} max={cls.total_sessions} label="Sessions held" className="flex-1" />
        </div>
        <div className="flex items-center justify-between gap-2">
          <small className="text-muted-foreground">{cls.schedule.length ? when : 'No timetable yet'}</small>
          <div className="flex items-center gap-1">
            {cls.status === 'open' && (
              <Button size="xs" onClick={() => onStart(cls)}>
                <Play aria-hidden="true" />
                Start course
              </Button>
            )}
            <Button asChild size="xs" variant="ghost">
              <Link to={`/secretary/classes/${cls.id}`}>
                View students
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
