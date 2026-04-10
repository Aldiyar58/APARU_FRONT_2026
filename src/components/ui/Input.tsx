import type { InputHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'min-h-12 w-full rounded-xl border border-graphite-200 bg-white px-4 py-3 text-[16px] text-graphite-900 shadow-sm outline-none transition placeholder:text-graphite-400 focus:border-aparu/40 focus:ring-2 focus:ring-aparu/20 sm:min-h-0 sm:py-3.5',
        className,
      )}
      {...props}
    />
  )
}
