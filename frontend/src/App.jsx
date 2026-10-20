import { RouterProvider } from 'react-router'
import AuthProvider from './auth/AuthProvider.jsx'
import { router } from './routes/index.jsx'
import ThemeProvider from './theme/ThemeProvider.jsx'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  )
}
