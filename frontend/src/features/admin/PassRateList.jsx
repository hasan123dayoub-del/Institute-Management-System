import Progress from '@/components/Progress.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// One row per level: the level code, a bar, and the percentage.
export default function PassRateList({ rows }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pass rate by level</CardTitle>
        <CardDescription>A student passes with 60 out of 100 or more</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {rows.map(({ level, rate }) => (
          <div key={level} className="grid grid-cols-[2.5rem_1fr_3rem] items-center gap-3 text-sm">
            <span className="font-mono">{level}</span>
            <Progress value={rate} max={100} label={`${level} pass rate`} />
            <span className="text-end font-mono tabular-nums">{rate}%</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
