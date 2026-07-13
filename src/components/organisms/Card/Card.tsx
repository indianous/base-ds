import type { ReactNode } from 'react'
import { cn } from '../../../utils/cn'

interface CardProps {
  header?: ReactNode
  footer?: ReactNode
  children: ReactNode
  variant?: 'flat' | 'elevated' | 'outlined'
  className?: string
}

const variantClasses: Record<NonNullable<CardProps['variant']>, string> = {
  flat: 'bg-background',
  elevated: 'bg-background shadow-md',
  outlined: 'bg-background border border-border',
}

export function Card({ header, footer, children, variant = 'flat', className }: CardProps) {
  return (
    <div className={cn('rounded-lg overflow-hidden', variantClasses[variant], className)}>
      {header !== undefined && (
        <div className="px-4 py-3 border-b border-border">{header}</div>
      )}
      <div className="p-4">{children}</div>
      {footer !== undefined && (
        <div className="px-4 py-3 border-t border-border">{footer}</div>
      )}
    </div>
  )
}
