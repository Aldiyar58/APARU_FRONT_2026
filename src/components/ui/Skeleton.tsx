import { cn } from '../../utils/cn'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-gradient-to-r from-graphite-100 via-graphite-50 to-graphite-100 bg-[length:200%_100%]',
        className,
      )}
    />
  )
}
