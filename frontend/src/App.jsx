import { RouterProvider } from 'react-router'
import AuthProvider from './auth/AuthProvider.jsx'
import { Toaster } from './components/ui/sonner.jsx'
import { TooltipProvider } from './components/ui/tooltip.jsx'
import { router } from './routes/index.jsx'
import ThemeProvider from './theme/ThemeProvider.jsx'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <RouterProvider router={router} />
          <Toaster richColors closeButton />
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
