import { useState } from 'react'
import * as classesApi from '@/api/classes.js'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import ClassGrades from '@/features/teacher/ClassGrades.jsx'
import { useLoad } from '@/hooks/useLoad.js'
import { classLabel } from '@/lib/format.js'

// Teacher: enter grades for their own classes. Open classes have no grades yet, so they are not listed.
export default function Grades() {
  const { data: classes, error, loading } = useLoad(classesApi.mine)
  const [chosen, setChosen] = useState(null)

  if (error) return <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-destructive" role="alert">{error}</p>
  if (loading) return <Skeleton className="h-64 w-full" />

  const options = classes.filter((c) => c.status !== 'open')
  if (options.length === 0) return <p className="text-sm text-muted-foreground">You have no running class yet.</p>

  // the first running class until the teacher picks another one
  const classId = chosen ?? (options.find((c) => c.status === 'running') ?? options[0]).id

  return (
    <div className="flex flex-col gap-4">
      <Select value={classId} onValueChange={setChosen}>
        <SelectTrigger className="w-64" aria-label="Class"><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map((c) => (
            <SelectItem key={c.id} value={c.id}>{classLabel(c)} ({c.status})</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* key={classId}: choosing another class remounts the sheet, so typed-but-unsaved grades never leak across classes */}
      <ClassGrades key={classId} classId={classId} />
    </div>
  )
}
