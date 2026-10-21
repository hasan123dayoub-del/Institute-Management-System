import { useEffect, useState } from 'react'
import { ThemeContext } from './ThemeContext.js'

// Keep this key in sync with the inline script in index.html (it prevents a flash on load).
const STORAGE_KEY = 'ascend-theme'
const MODES = ['light', 'dark', 'system']
const DARK_QUERY = '(prefers-color-scheme: dark)'

function readMode() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return MODES.includes(saved) ? saved : 'system'
  } catch {
    return 'system'
  }
}

// mode: 'light' | 'dark' | 'system'.
// Dark mode is the `dark` class on <html>; Tailwind and shadcn read it (see src/index.css).
// For 'system' we follow the OS and keep following it if it changes.
export default function ThemeProvider({ children }) {
  const [mode, setMode] = useState(readMode)

  useEffect(() => {
    const media = window.matchMedia(DARK_QUERY)
    const apply = () => {
      const dark = mode === 'dark' || (mode === 'system' && media.matches)
      document.documentElement.classList.toggle('dark', dark)
    }
    apply()
    media.addEventListener('change', apply)

    try {
      localStorage.setItem(STORAGE_KEY, mode)
    } catch {
      /* private mode: the choice just won't persist */
    }
    return () => media.removeEventListener('change', apply)
  }, [mode])

  const cycle = () => setMode((m) => MODES[(MODES.indexOf(m) + 1) % MODES.length])

  return <ThemeContext value={{ mode, setMode, cycle }}>{children}</ThemeContext>
}
