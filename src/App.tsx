import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { EspacePrestataire } from './pages/EspacePrestataire'
import { authService } from './services/auth.service'

function RequireAuth({ children }: { children: React.ReactNode }) {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/espace-prestataire/login" replace />
  }
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Site vitrine */}
        <Route path="/" element={<LandingPage />} />

        {/* Espace prestataire */}
        <Route path="/espace-prestataire/login" element={<LoginPage />} />
        <Route
          path="/espace-prestataire"
          element={
            <RequireAuth>
              <EspacePrestataire />
            </RequireAuth>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
