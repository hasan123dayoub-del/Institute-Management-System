// Which parts of the backend are used for real?
//   true  -> the api/* file calls the server.
//   false -> the api/* file answers from src/api/sample/* (in-memory data with the SAME shape as the contract).
//            Useful to work on the screens without a backend, or while an endpoint is still being written.
//
// Everything is live now. To work offline, put the modules you want as sample data in frontend/.env.local:
//   VITE_SAMPLE=classes,students,levels
// (and flip any flag below to false to make it permanent)
const DEFAULTS = {
  secretaries: true,
  teachers: true,
  users: true,
  levels: true,
  classes: true,
  students: true,
  schedules: true,
  grades: true,
  stats: true,
}

const sampled = (import.meta.env.VITE_SAMPLE ?? '')
  .split(',')
  .map((name) => name.trim())
  .filter(Boolean)

export const LIVE = Object.fromEntries(Object.entries(DEFAULTS).map(([name, live]) => [name, live && !sampled.includes(name)]))
