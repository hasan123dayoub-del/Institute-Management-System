import { Link } from 'react-router'

export default function Forbidden() {
  return (
    <div className="stack" style={{ padding: 40, alignItems: 'flex-start' }}>
      <h2>You do not have access to this page</h2>
      <p style={{ color: 'var(--muted)' }}>Your role cannot open it. Go back to your own area.</p>
      <Link className="btn" to="/">Back to my area</Link>
    </div>
  )
}
