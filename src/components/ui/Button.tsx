import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

const variants: Record<Variant, string> = {
  primary:
    'bg-aparu text-white shadow-sm hover:bg-aparu-dark active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none',
  secondary:
    'bg-graphite-800 text-white shadow-sm hover:bg-graphite-900 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none',
  ghost: 'bg-transparent text-graphite-700 hover:bg-graphite-100 active:bg-graphite-200',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:scale-[0.98]',
}

export function Button({
  className,
  variant = 'primary',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  children: ReactNode
}) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex min-h-12 min-w-12 items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-[16px] font-semibold tracking-tight transition-all duration-200 sm:min-h-0 sm:min-w-0 sm:text-[15px]',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
