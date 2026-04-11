import { useEffect } from 'react'
import { useUiStore } from '../../store/uiStore'
import { cn } from '../../utils/cn'

export function ToastHost() {
  const toast = useUiStore((s) => s.toast)
  const clearToast = useUiStore((s) => s.clearToast)

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => clearToast(), 4200)
    return () => window.clearTimeout(t)
  }, [toast, clearToast])

  if (!toast) return null

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-[3000] flex justify-center px-3"
      role="status"
    >
      <div
        className={cn(
          'pointer-events-auto max-w-md rounded-2xl px-4 py-3 text-sm font-medium shadow-[var(--shadow-float)] ring-1 backdrop-blur',
          toast.tone === 'success' && 'bg-emerald-600/95 text-white ring-emerald-500/40',
          toast.tone === 'error' && 'bg-red-600/95 text-white ring-red-500/40',
          toast.tone === 'info' && 'bg-graphite-900/92 text-white ring-black/20',
        )}
      >
        {toast.message}
      </div>
    </div>
  )
}
