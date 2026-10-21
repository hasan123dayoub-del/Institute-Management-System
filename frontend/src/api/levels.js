import { api } from './client.js'
import { LIVE } from './mode.js'
import * as sample from './sample/api.js'

// [{ id, code: 'A1', hours: 36 }, ...]
const real = {
  list: async () => (await api.get('/levels')).map((l) => ({ id: l.id ?? l._id, code: l.code, hours: l.hours })),
}

const impl = LIVE.levels ? real : sample.levels
export const list = impl.list
