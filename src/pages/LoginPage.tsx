import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { sendOtpCode, verifyOtp } from '../services/backend/authApi'
import { useAuthStore } from '../store/authStore'
import { useUiStore } from '../store/uiStore'

function postLoginPath(role: string | null | undefined): string {
  if (role === 'admin') return '/admin/dashboard'
  if (role === 'driver') return '/driver/active-rides'
  return '/home'
}

export function LoginPage() {
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)
  const pushToast = useUiStore((s) => s.pushToast)

  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [ttl, setTtl] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)

  const canSend = useMemo(() => phone.trim().length >= 5, [phone])
  const canVerify = useMemo(() => phone.trim().length >= 5 && code.trim().length >= 4, [phone, code])

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-graphite-50 px-4 py-10">
      <Card className="w-full max-w-md space-y-5 p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-graphite-400">APARU</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-graphite-900">Вход по SMS</h1>
          <p className="mt-2 text-sm text-graphite-500">
            Мы отправим одноразовый код. После входа вы будете перенаправлены в нужный раздел по роли.
          </p>
        </div>

        <div className="space-y-3">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-graphite-600">Телефон</span>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7…" />
          </label>
          <Button
            type="button"
            className="w-full"
            disabled={!canSend || busy}
            onClick={async () => {
              setBusy(true)
              try {
                const r = await sendOtpCode(phone.trim())
                setTtl(r.ttl_seconds)
                pushToast(`Код отправлен. TTL: ${r.ttl_seconds} c`, 'success')
              } catch (e) {
                pushToast((e as Error).message, 'error')
              } finally {
                setBusy(false)
              }
            }}
          >
            Получить код
          </Button>
          {ttl != null && <p className="text-xs text-graphite-500">Код действует {ttl} секунд.</p>}
        </div>

        <div className="space-y-3 border-t border-graphite-100 pt-5">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-graphite-600">Код из SMS</span>
            <Input value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" placeholder="0000" />
          </label>
          <Button
            type="button"
            className="w-full"
            disabled={!canVerify || busy}
            onClick={async () => {
              setBusy(true)
              try {
                const r = await verifyOtp(phone.trim(), code.trim())
                setSession(r.access_token)
                navigate(postLoginPath(useAuthStore.getState().role ?? 'user'), { replace: true })
              } catch (e) {
                pushToast((e as Error).message, 'error')
              } finally {
                setBusy(false)
              }
            }}
          >
            Войти
          </Button>
        </div>

        <div className="flex justify-between text-sm">
          <Link className="text-aparu-dark hover:underline" to="/">
            На карту
          </Link>
          <button
            type="button"
            className="text-graphite-500 hover:text-graphite-800"
            onClick={() => {
              useAuthStore.getState().clearSession()
              pushToast('Сессия сброшена', 'info')
            }}
          >
            Выйти (локально)
          </button>
        </div>
      </Card>
    </div>
  )
}
