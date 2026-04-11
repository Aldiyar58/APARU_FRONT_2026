import { Navigate, Route, Routes } from 'react-router-dom'
import { ToastHost } from './components/feedback/ToastHost'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { DriverActiveRidesPage } from './pages/DriverActiveRidesPage'
import { LoginPage } from './pages/LoginPage'
import { MapHomePage } from './pages/MapHomePage'
import { useAuthStore } from './store/authStore'

function RoleRedirect() {
  const role = useAuthStore((s) => s.role)
  const accessToken = useAuthStore((s) => s.accessToken)

  if (!accessToken) return <Navigate to="/auth/login" replace />
  if (role === 'admin') return <Navigate to="/admin/dashboard" replace />
  if (role === 'driver') return <Navigate to="/driver/active-rides" replace />
  return <Navigate to="/home" replace />
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/auth/login" element={<LoginPage />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/driver/active-rides"
          element={
            <ProtectedRoute allowedRoles={['driver']}>
              <DriverActiveRidesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/home"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <MapHomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/map"
          element={<Navigate to="/home" replace />}
        />
        <Route
          path="/entry"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <MapHomePage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<RoleRedirect />} />
        <Route path="*" element={<RoleRedirect />} />
      </Routes>
      <ToastHost />
    </>
  )
}
