// One place that maps backend enum values to a label and a colour.
const MAP = {
  // class.status
  open: ['Open', ''],
  running: ['Running', 'ok'],
  finished: ['Finished', 'info'],
  // student.status
  waiting: ['Waiting', 'warn'],
  active: ['Studying', 'ok'],
  // teacher.salary_status
  paid: ['Paid', 'ok'],
  unpaid: ['Unpaid', 'bad'],
  // class.shift
  morning: ['Morning', 'warn'],
  evening: ['Evening', 'info'],
  // exam result (frontend only)
  passed: ['Passed', 'ok'],
  failed: ['Failed', 'bad'],
}

export default function StatusPill({ value, label }) {
  const [text, tone] = MAP[value] ?? [value, '']
  return <span className={`pill ${tone}`.trim()}>{label ?? text}</span>
}
