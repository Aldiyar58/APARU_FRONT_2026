import { Navigate, Route, Routes } from 'react-router-dom'
import { ToastHost } from './components/feedback/ToastHost'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { DriverActiveRidesPage } from './pages/DriverActiveRidesPage'
import { LoginPage } from './pages/LoginPage'
import { MapHomePage } from './pages/MapHomePage'

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/driver/active-rides" element={<DriverActiveRidesPage />} />
        <Route path="/home" element={<MapHomePage />} />
        <Route path="/map" element={<Navigate to="/home" replace />} />
        <Route path="/entry" element={<MapHomePage />} />
        <Route path="/" element={<MapHomePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastHost />
    </>
  )
}
