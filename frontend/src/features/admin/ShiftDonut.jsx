import { Pie, PieChart } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { SHIFT_CHART_CONFIG } from './chartConfig.js'

// Donut: how many students study in the morning vs the evening.
export default function ShiftDonut({ morning, evening }) {
  const total = morning + evening
  // `fill` on each row is the colour of that slice
  const data = [
    { shift: 'morning', students: morning, fill: 'var(--color-morning)' },
    { shift: 'evening', students: evening, fill: 'var(--color-evening)' },
  ]
  const percent = (n) => Math.round((n / total) * 100)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Morning vs evening</CardTitle>
        <CardDescription>
          {morning} morning ({percent(morning)}%) · {evening} evening ({percent(evening)}%)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={SHIFT_CHART_CONFIG} className="mx-auto aspect-square max-h-56">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="shift" />} />
            {/* innerRadius makes the hole in the middle (that is what turns a pie into a donut) */}
            <Pie data={data} dataKey="students" nameKey="shift" innerRadius={55} strokeWidth={2} />
            <ChartLegend content={<ChartLegendContent nameKey="shift" />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
