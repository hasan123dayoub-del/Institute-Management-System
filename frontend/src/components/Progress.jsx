export default function Progress({ value, max, label }) {
  const pct = max ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div className="progress" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} aria-label={label}>
      <i style={{ width: `${pct}%` }} />
    </div>
  )
}
