import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

// One number with a title, a small icon and a footnote. Used 5 times in the KPI row.
export default function StatCard({ title, value, note, icon: Icon, noteClassName }) {
  return (
    <Card className="gap-3 py-4">
      <CardHeader className="gap-1">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="font-mono text-2xl font-medium tabular-nums">{value}</CardTitle>
        <CardAction>
          <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
        </CardAction>
      </CardHeader>
      {note && (
        <CardFooter className={noteClassName ?? 'text-xs text-muted-foreground'}>{note}</CardFooter>
      )}
    </Card>
  )
}
