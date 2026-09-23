import React from 'react'
import { cn } from '../../../utils/cn'
import { Button } from '../../atoms/Button/Button'
import { Icon } from '../../atoms/Icon/Icon'
import type { IconName } from '../../atoms/Icon/Icon'

type AlertVariant = 'info' | 'success' | 'warning' | 'danger' | 'neutral'
type AlertLayout = 'full' | 'inline'

interface AlertOwnProps {
  variant?: AlertVariant
  layout?: AlertLayout
  /** Defaults to the variant's icon; pass `null` to render no icon. */
  icon?: React.ReactNode
  title?: React.ReactNode
  children?: React.ReactNode
  actions?: React.ReactNode
  onDismiss?: () => void
  dismissLabel?: string
}

export type AlertProps = AlertOwnProps &
  Omit<React.HTMLAttributes<HTMLDivElement>, keyof AlertOwnProps>

const variantClasses: Record<AlertVariant, string> = {
  info: 'bg-info-muted text-info-muted-fg border-info-border',
  success: 'bg-success-muted text-success-muted-fg border-success-border',
  warning: 'bg-warning-muted text-warning-muted-fg border-warning-border',
  danger: 'bg-destructive-muted text-destructive-muted-fg border-destructive-border',
  neutral: 'bg-muted text-foreground border-border',
}

const layoutClasses: Record<AlertLayout, string> = {
  full: 'w-full border-b px-4 py-3',
  inline: 'rounded-lg border p-4',
}

const defaultIcons: Record<AlertVariant, IconName> = {
  info: 'Info',
  success: 'CheckCircle2',
  warning: 'AlertTriangle',
  danger: 'XCircle',
  neutral: 'Info',
}

const defaultRoles: Record<AlertVariant, 'status' | 'alert'> = {
  info: 'status',
  success: 'status',
  warning: 'alert',
  danger: 'alert',
  neutral: 'status',
}

export function Alert({
  variant = 'info',
  layout = 'inline',
  icon,
  title,
  children,
  actions,
  onDismiss,
  dismissLabel = 'Dismiss',
  className,
  ...rest
}: AlertProps) {
  const resolvedIcon = icon === undefined ? <Icon name={defaultIcons[variant]} size="md" /> : icon

  return (
    <div
      role={defaultRoles[variant]}
      {...rest}
      className={cn(
        'flex items-start gap-3',
        variantClasses[variant],
        layoutClasses[layout],
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
        <div className="flex min-w-0 flex-1 basis-48 items-start gap-3">
          {resolvedIcon !== null && (
            <span className="mt-0.5 flex flex-shrink-0">{resolvedIcon}</span>
          )}
          <div className="min-w-0 text-sm">
            {title !== undefined && <p className="font-semibold">{title}</p>}
            {children !== undefined && <div>{children}</div>}
          </div>
        </div>
        {actions !== undefined && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      {onDismiss !== undefined && (
        <Button
          variant="ghost"
          size="sm"
          iconOnly
          onClick={onDismiss}
          aria-label={dismissLabel}
          className="-my-1 flex-shrink-0"
        >
          <Icon name="X" size="sm" />
        </Button>
      )}
    </div>
  )
}

export type { AlertVariant, AlertLayout }
