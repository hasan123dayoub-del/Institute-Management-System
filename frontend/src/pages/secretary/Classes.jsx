import { Plus } from 'lucide-react'
import { useState } from 'react'
import * as classesApi from '@/api/classes.js'
import ConfirmDialog from '@/components/ConfirmDialog.jsx'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ClassCard from '@/features/secretary/ClassCard.jsx'
import ClassFormDialog from '@/features/secretary/ClassFormDialog.jsx'
import { perform, useLoad } from '@/hooks/useLoad.js'
import { LEVELS, classLabel } from '@/lib/format.js'

const TABS = [
  ['all', 'All'],
  ['open', 'Open'],
  ['running', 'Running'],
  ['finished', 'Finished'],
]

// The newest class of a level and shift (a level can have several over the terms)
const latest = (classes, level, shift) =>
  classes
    .filter((c) => c.level === level && c.shift === shift)
    .sort((a, b) => b.start_date.localeCompare(a.start_date))[0]

// Secretary: the six levels, each with its morning and its evening class.
export default function Classes() {
  const { data: classes, error, loading, reload } = useLoad(classesApi.list)
  const [tab, setTab] = useState('all')
  const [dialog, setDialog] = useState(null) // null | { type: 'create' } | { type: 'start', cls }
  const close = () => setDialog(null)

  if (error) {
    return <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-destructive" role="alert">{error}</p>
  }

  const all = classes ?? []
  const visible = all.filter((c) => tab === 'all' || c.status === tab)
  const count = (status) => (status === 'all' ? all.length : all.filter((c) => c.status === status).length)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            {TABS.map(([value, label]) => (
              <TabsTrigger key={value} value={value}>
                {label} <span className="font-mono text-xs text-muted-foreground">{loading ? '' : count(value)}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Button onClick={() => setDialog({ type: 'create' })}>
          <Plus aria-hidden="true" />
          New class
        </Button>
      </div>

      {loading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
      )}

      {!loading &&
        LEVELS.map((level) => {
          const sample = all.find((c) => c.level === level)
          return (
            <section key={level} className="grid items-stretch gap-3 md:grid-cols-[5rem_1fr_1fr]">
              <div className="flex flex-col justify-center">
                <b className="font-display text-2xl leading-none text-primary">{level}</b>
                {sample && <small className="font-mono text-muted-foreground">{sample.total_sessions} sessions</small>}
              </div>
              {['morning', 'evening'].map((shift) => {
                const cls = latest(visible, level, shift)
                return cls ? (
                  <ClassCard key={shift} cls={cls} onStart={(c) => setDialog({ type: 'start', cls: c })} />
                ) : (
                  <div key={shift} className="grid place-items-center rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                    No {shift} class{tab === 'all' ? '' : ` (${tab})`}
                  </div>
                )
              })}
            </section>
          )
        })}

      {dialog?.type === 'create' && (
        <ClassFormDialog onSubmit={(values) => perform(() => classesApi.create(values), 'Class created').then(reload)} onClose={close} />
      )}
      {dialog?.type === 'start' && (
        <ConfirmDialog
          title={`Start ${classLabel(dialog.cls)}?`}
          description="The course begins. It will close by itself 3 days after its last session, and the students move on according to their results."
          confirmLabel="Start course"
          destructive={false}
          onConfirm={() => perform(() => classesApi.start(dialog.cls.id), 'Course started').then(reload)}
          onClose={close}
        />
      )}
    </div>
  )
}
