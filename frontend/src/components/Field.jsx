import { useId } from 'react'

// Label + input + optional hint/error. Pass any <input> props; `as="select"` or `as="textarea"` also work.
export default function Field({ label, hint, error, as: Tag = 'input', children, ...props }) {
  const id = useId()
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <Tag id={id} aria-invalid={error ? true : undefined} {...props}>
        {children}
      </Tag>
      {hint && !error && <span className="hint">{hint}</span>}
      {error && <span className="error" role="alert">{error}</span>}
    </div>
  )
}
