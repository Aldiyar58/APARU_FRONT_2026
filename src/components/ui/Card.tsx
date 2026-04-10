import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn'

export function Card({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={cn(
        'rounded-xl bg-white p-5 shadow-[var(--shadow-card)] ring-1 ring-graphite-100/80',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
