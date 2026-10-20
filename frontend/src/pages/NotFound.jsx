import { Link } from 'react-router'

export default function NotFound() {
  return (
    <div className="stack" style={{ padding: 40, alignItems: 'flex-start' }}>
      <h2>Page not found</h2>
      <Link className="btn" to="/">Go home</Link>
    </div>
  )
}
