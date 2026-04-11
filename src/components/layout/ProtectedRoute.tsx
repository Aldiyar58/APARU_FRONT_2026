import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import type { JwtRole } from '../../lib/jwt'

function homeForRole(role: JwtRole | null): string {
  if (role === 'admin') return '/admin/dashboard'
  if (role === 'driver') return '/driver/active-rides'
  return '/home'
}

export function ProtectedRoute({
  allowedRoles,
  children,
}: {
  allowedRoles: JwtRole[]
  children: React.ReactNode
}) {
  const accessToken = useAuthStore((s) => s.accessToken)
  const role = useAuthStore((s) => s.role)

  if (!accessToken) {
    return <Navigate to="/auth/login" replace />
  }

  if (!allowedRoles.includes(role ?? 'user')) {
    return <Navigate to={homeForRole(role)} replace />
  }

  return <>{children}</>
}
