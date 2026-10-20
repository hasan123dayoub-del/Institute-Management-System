import { useEffect, useState } from 'react'
import { ThemeContext } from './ThemeContext.js'

// Keep this key in sync with the inline script in index.html (it prevents a flash on load).
const STORAGE_KEY = 'ascend-theme'
const MODES = ['light', 'dark', 'system']

function readMode() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return MODES.includes(saved) ? saved : 'system'
  } catch {
    return 'system'
  }
}

// mode: 'light' | 'dark' | 'system'. For 'system' we set no attribute, so the
// prefers-color-scheme media query in styles/tokens.css decides.
export default function ThemeProvider({ children }) {
  const [mode, setMode] = useState(readMode)

  useEffect(() => {
    const root = document.documentElement
    if (mode === 'system') delete root.dataset.theme
    else root.dataset.theme = mode
    try {
      localStorage.setItem(STORAGE_KEY, mode)
    } catch {
      /* private mode: the choice just won't persist */
    }
  }, [mode])

  const cycle = () => setMode((m) => MODES[(MODES.indexOf(m) + 1) % MODES.length])

  return <ThemeContext value={{ mode, setMode, cycle }}>{children}</ThemeContext>
}
