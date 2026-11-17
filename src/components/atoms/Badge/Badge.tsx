import React from 'react'
import { cn } from '../../../utils/cn'
import type { LinkComponent } from '../../../utils/linkComponent'

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
type BadgeSize = 'sm' | 'md'

export interface BadgeProps {
  variant?: BadgeVariant
  size?: BadgeSize
  className?: string
  children: React.ReactNode
  /** URL the badge links to. Without it the badge is a plain `<span>`. */
  href?: string
  /** Component rendered in place of `<a>` when `href` is set (e.g. Next.js `Link`). */
  linkComponent?: LinkComponent
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-muted text-muted-foreground',
  primary: 'bg-primary text-primary-foreground',
  success: 'bg-success text-success-foreground',
  warning: 'bg-warning text-warning-foreground',
  danger: 'bg-destructive text-destructive-foreground',
  info: 'bg-info text-info-foreground',
}

// `border` matches `muted` in the dark theme, so the default variant also darkens its text to
// keep the hover visible in both themes.
const linkVariantClasses: Record<BadgeVariant, string> = {
  default: 'hover:bg-border hover:text-foreground',
  primary: 'hover:bg-primary-hover',
  success: 'hover:bg-success-hover',
  warning: 'hover:bg-warning-hover',
  danger: 'hover:bg-destructive-hover',
  info: 'hover:bg-info-hover',
}

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'text-xs px-2 py-0.5 rounded-full',
  md: 'text-sm px-3 py-1 rounded-full',
}

const linkClasses =
  'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

export function Badge({
  variant = 'default',
  size = 'md',
  className,
  children,
  href,
  linkComponent: LinkElement = 'a',
}: BadgeProps) {
  const baseClasses = [
    'inline-flex items-center whitespace-nowrap font-medium',
    variantClasses[variant],
    sizeClasses[size],
  ]

  if (href !== undefined) {
    return (
      <LinkElement
        href={href}
        className={cn(baseClasses, linkVariantClasses[variant], linkClasses, className)}
      >
        {children}
      </LinkElement>
    )
  }

  return <span className={cn(baseClasses, className)}>{children}</span>
}
