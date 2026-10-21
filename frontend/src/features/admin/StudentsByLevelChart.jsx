import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { SHIFT_CHART_CONFIG } from './chartConfig.js'

// Grouped bars: for every level, one bar for the morning shift and one for the evening shift.
export default function StudentsByLevelChart({ data }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Students by level and shift</CardTitle>
        <CardDescription>Each class has 20 seats</CardDescription>
      </CardHeader>
      <CardContent>
        {/* ChartContainer gives the chart its size and turns the colours in `config` into CSS variables */}
        <ChartContainer config={SHIFT_CHART_CONFIG} className="h-64 w-full">
          <BarChart data={data} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="level" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis width={28} tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            {/* dataKey = the field name in each row of `data`; fill = the colour defined in the config */}
            <Bar dataKey="morning" fill="var(--color-morning)" radius={4} />
            <Bar dataKey="evening" fill="var(--color-evening)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
