import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Temporary body for pages nobody has built yet. Delete it from a page when you start it.
// owner: who builds this page. todo: the checklist from the design file.
export default function PagePlaceholder({ owner, todo = [], api = [] }) {
  return (
    <Card className="border-dashed">
      <CardHeader>
        <Badge variant="secondary" className="w-fit">Owner: {owner}</Badge>
        <CardTitle>To build on this page</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <ul className="list-disc space-y-1 ps-5 text-sm text-muted-foreground">
          {todo.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        {api.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            API:
            {api.map((a) => (
              <code key={a} className="rounded bg-muted px-1.5 py-0.5 font-mono">{a}</code>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
