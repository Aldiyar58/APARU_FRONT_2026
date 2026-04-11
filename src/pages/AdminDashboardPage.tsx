import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'

export function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-10">
      <Card className="p-6">
        <h1 className="text-2xl font-semibold text-graphite-900">Admin dashboard</h1>
        <p className="mt-2 text-sm text-graphite-600">
          Дальше: форма генерации QR (`POST /admin/qr/generate`) и список точек (`GET /admin/qr`).
        </p>
        <Link className="mt-4 inline-block text-sm font-semibold text-aparu-dark hover:underline" to="/">
          ← На карту
        </Link>
      </Card>
    </div>
  )
}
