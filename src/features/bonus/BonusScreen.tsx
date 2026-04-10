import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { useBonusStore } from '../../store/bonusStore'
import { cn } from '../../utils/cn'

export function BonusScreen({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const balance = useBonusStore((s) => s.balance)
  const transactions = useBonusStore((s) => s.transactions)
  const resetDemo = useBonusStore((s) => s.resetDemo)

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[2000] flex flex-col bg-graphite-50/98 backdrop-blur-md transition-opacity duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Бонусы"
    >
      <div
        className={cn(
          'flex shrink-0 items-center justify-between border-b border-graphite-100 bg-white/95 px-4 py-3',
          'pt-[max(0.75rem,env(safe-area-inset-top))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]',
        )}
      >
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-graphite-400">
            Баланс
          </p>
          <p className="truncate text-2xl font-semibold tracking-tight text-graphite-900 sm:text-3xl">
            {balance}{' '}
            <span className="text-base font-medium text-graphite-500 sm:text-lg">
              бонусов
            </span>
          </p>
        </div>
        <Button
          variant="ghost"
          className="min-h-11 shrink-0 px-3 text-sm sm:min-h-0"
          onClick={onClose}
        >
          Закрыть
        </Button>
      </div>

      <div
        className={cn(
          'min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-5 [-webkit-overflow-scrolling:touch]',
          'pb-[max(1.25rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]',
        )}
      >
        <Card className="mb-6 p-4">
          <p className="text-sm leading-relaxed text-graphite-600">
            Начисления демо-режима: <strong className="text-graphite-800">+10</strong> за скан
            QR, <strong className="text-graphite-800">+50</strong> за первый заказ,{' '}
            <strong className="text-graphite-800">+20</strong> за следующие. Данные хранятся в{' '}
            <code className="rounded bg-graphite-100 px-1 text-xs">localStorage</code>.
          </p>
        </Card>

        <h2 className="mb-3 text-sm font-semibold text-graphite-800">История</h2>
        <ul className="flex flex-col gap-2">
          {transactions.length === 0 && (
            <Card className="p-4 text-center text-sm text-graphite-500">
              Пока нет операций
            </Card>
          )}
          {transactions.map((tx) => (
            <li key={tx.id}>
              <Card className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="font-medium text-graphite-900">{tx.label}</p>
                  <p className="text-xs text-graphite-400">
                    {new Date(tx.at).toLocaleString()}
                  </p>
                </div>
                <span
                  className={cn(
                    'shrink-0 text-sm font-semibold tabular-nums',
                    tx.delta >= 0 ? 'text-aparu-dark' : 'text-red-600',
                  )}
                >
                  {tx.delta >= 0 ? '+' : ''}
                  {tx.delta}
                </span>
              </Card>
            </li>
          ))}
        </ul>

        <div className="mt-8">
          <Button
            variant="ghost"
            className="min-h-12 w-full text-graphite-500 sm:min-h-0"
            onClick={() => {
              if (confirm('Сбросить бонусы и историю на этом устройстве?')) resetDemo()
            }}
          >
            Сбросить демо-данные
          </Button>
        </div>
      </div>
    </div>
  )
}
