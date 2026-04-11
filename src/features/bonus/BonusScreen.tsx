import { useMutation, useQuery } from '@tanstack/react-query'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import {
  fetchBonusSummary,
  redeemBonus,
  type BackendBonusTransaction,
} from '../../services/backend/bonusApi'
import { queryClient } from '../../services/queryClient'
import { useAuthStore } from '../../store/authStore'
import { useUiStore } from '../../store/uiStore'
import { cn } from '../../utils/cn'

function transactionLabel(tx: BackendBonusTransaction): string {
  if (tx.type === 'scan') return 'QR scan bonus'
  if (tx.type === 'ride') return tx.ride_id != null ? `Ride #${tx.ride_id} bonus` : 'Ride bonus'
  if (tx.type === 'redeem') return 'Redeemed points'
  return 'Bonus update'
}

export function BonusScreen({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const token = useAuthStore((s) => s.accessToken)
  const bonusBalance = useAuthStore((s) => s.bonusBalance)
  const setBonusBalance = useAuthStore((s) => s.setBonusBalance)
  const pushToast = useUiStore((s) => s.pushToast)

  const summaryQ = useQuery({
    queryKey: ['bonus-summary', token],
    queryFn: fetchBonusSummary,
    enabled: open && Boolean(token),
  })

  const redeemMutation = useMutation({
    mutationFn: redeemBonus,
    onSuccess: async (data, points) => {
      setBonusBalance(data.new_balance)
      pushToast(`Redeemed ${points} points for ${data.discount_percent}% discount.`, 'success')
      await queryClient.invalidateQueries({ queryKey: ['bonus-summary'] })
    },
    onError: (error) => {
      pushToast((error as Error).message, 'error')
    },
  })

  const balance = summaryQ.data?.balance ?? bonusBalance ?? 0
  const transactions = summaryQ.data?.transactions ?? []

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[2000] flex flex-col bg-graphite-50/98 backdrop-blur-md transition-opacity duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Bonuses"
    >
      <div
        className={cn(
          'flex shrink-0 items-center justify-between border-b border-graphite-100 bg-white/95 px-4 py-3',
          'pt-[max(0.75rem,env(safe-area-inset-top))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]',
        )}
      >
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-graphite-400">Balance</p>
          <p className="truncate text-2xl font-semibold tracking-tight text-graphite-900 sm:text-3xl">
            {balance} <span className="text-base font-medium text-graphite-500 sm:text-lg">points</span>
          </p>
        </div>
        <Button
          variant="ghost"
          className="min-h-11 shrink-0 px-3 text-sm sm:min-h-0"
          onClick={onClose}
        >
          Close
        </Button>
      </div>

      <div
        className={cn(
          'min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-5 [-webkit-overflow-scrolling:touch]',
          'pb-[max(1.25rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]',
        )}
      >
        {!token && (
          <Card className="p-5 text-sm leading-relaxed text-graphite-600">
            Sign in to view your real server-side bonus history and redeem points.
          </Card>
        )}

        {token && (
          <>
            <Card className="mb-6 p-4">
              <p className="text-sm leading-relaxed text-graphite-600">
                Server-backed bonuses are now live. QR scans, ride completions, and redemptions come directly from the backend.
              </p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Button
                  className="w-full sm:flex-1"
                  disabled={redeemMutation.isPending || balance < 100}
                  onClick={() => redeemMutation.mutate(100)}
                >
                  Redeem 100 pts
                </Button>
                <Button
                  variant="secondary"
                  className="w-full sm:flex-1"
                  disabled={redeemMutation.isPending || balance < 300}
                  onClick={() => redeemMutation.mutate(300)}
                >
                  Redeem 300 pts
                </Button>
              </div>
            </Card>

            {summaryQ.isPending && (
              <Card className="p-4 text-sm text-graphite-500">Loading bonus history...</Card>
            )}

            {summaryQ.isError && (
              <Card className="p-4 text-sm text-red-600">{(summaryQ.error as Error).message}</Card>
            )}

            {!summaryQ.isPending && !summaryQ.isError && (
              <>
                <h2 className="mb-3 text-sm font-semibold text-graphite-800">History</h2>
                <ul className="flex flex-col gap-2">
                  {transactions.length === 0 && (
                    <Card className="p-4 text-center text-sm text-graphite-500">No bonus activity yet.</Card>
                  )}
                  {transactions.map((tx) => (
                    <li key={tx.id}>
                      <Card className="flex items-center justify-between gap-3 p-4">
                        <div className="min-w-0">
                          <p className="font-medium text-graphite-900">{transactionLabel(tx)}</p>
                          <p className="text-xs text-graphite-400">{new Date(tx.created_at).toLocaleString()}</p>
                        </div>
                        <span
                          className={cn(
                            'shrink-0 text-sm font-semibold tabular-nums',
                            tx.amount >= 0 ? 'text-aparu-dark' : 'text-red-600',
                          )}
                        >
                          {tx.amount >= 0 ? '+' : ''}
                          {tx.amount}
                        </span>
                      </Card>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
