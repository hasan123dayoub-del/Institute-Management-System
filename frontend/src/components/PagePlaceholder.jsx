import './PagePlaceholder.css'

// Temporary body for pages nobody has built yet. Delete it from a page when you start it.
// owner: who builds this page. todo: the checklist from the design file.
export default function PagePlaceholder({ owner, todo = [], api = [] }) {
  return (
    <div className="card placeholder">
      <span className="pill info">Owner: {owner}</span>
      <h3>To build on this page</h3>
      <ul>
        {todo.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      {api.length > 0 && (
        <small>
          API: {api.map((a) => <code key={a}>{a}</code>)}
        </small>
      )}
    </div>
  )
}
