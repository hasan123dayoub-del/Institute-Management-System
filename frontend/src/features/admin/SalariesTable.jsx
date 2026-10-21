import StatusPill from '@/components/StatusPill.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const money = new Intl.NumberFormat('en-US')

// Read-only list of this month's salaries (the secretary is the one who marks them as paid).
export default function SalariesTable({ salaries, month }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{month} salaries</CardTitle>
        <CardDescription>Marked as paid by the secretary</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Teacher</TableHead>
              <TableHead className="text-end">Salary (SYP)</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {salaries.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.full_name}</TableCell>
                <TableCell className="text-end font-mono tabular-nums">{money.format(t.salary)}</TableCell>
                {/* StatusPill turns "paid" / "unpaid" into a green / red badge */}
                <TableCell><StatusPill value={t.salary_status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
