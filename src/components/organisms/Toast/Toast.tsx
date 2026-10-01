import { cn } from '../../../utils/cn'
import { IconBase } from '../../atoms/Icon/IconBase'
import {
  AlertTriangleIcon,
  BellIcon,
  CheckCircle2Icon,
  InfoIcon,
  XCircleIcon,
  XIcon,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '../../atoms/Button/Button'

type ToastVariant = 'default' | 'success' | 'warning' | 'destructive' | 'info'

interface ToastAction {
  label: string
  onClick: () => void
}

interface ToastProps {
  variant?: ToastVariant
  title?: string
  description?: string
  action?: ToastAction
  onDismiss: () => void
  className?: string
  /** `aria-label` of the close button. */
  closeLabel?: string
}

const iconMap: Record<ToastVariant, LucideIcon> = {
  default: BellIcon,
  success: CheckCircle2Icon,
  warning: AlertTriangleIcon,
  destructive: XCircleIcon,
  info: InfoIcon,
}

const iconColorMap: Record<ToastVariant, string> = {
  default: 'text-foreground',
  success: 'text-success',
  warning: 'text-warning',
  destructive: 'text-destructive',
  info: 'text-info',
}

export function Toast({
  variant = 'default',
  title,
  description,
  action,
  onDismiss,
  className,
  closeLabel = 'Close notification',
}: ToastProps) {
  const isDestructive = variant === 'destructive'

  return (
    <div
      role={isDestructive ? 'alert' : 'status'}
      className={cn(
        'flex items-start gap-3 rounded-lg border border-border bg-background p-4 shadow-md',
        className,
      )}
    >
      <IconBase
        icon={iconMap[variant]}
        size="md"
        className={cn('mt-0.5 flex-shrink-0', iconColorMap[variant])}
      />

      <div className="flex-1 min-w-0">
        {title !== undefined && <p className="text-sm font-semibold text-foreground">{title}</p>}
        {description !== undefined && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        {action !== undefined && (
          <div className="mt-2">
            <Button variant="outline" size="sm" onClick={action.onClick}>
              {action.label}
            </Button>
          </div>
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onDismiss}
        aria-label={closeLabel}
        className="flex-shrink-0 px-2"
      >
        <IconBase icon={XIcon} size="sm" />
      </Button>
    </div>
  )
}

export type { ToastProps, ToastVariant, ToastAction }
