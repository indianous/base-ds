import { useEffect, useRef, useId } from 'react'
import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'
import { cn } from '../../../utils/cn'
import { useBodyScrollLock } from '../../../utils/useBodyScrollLock'
import { Button } from '../../atoms/Button/Button'
import { Icon } from '../../atoms/Icon/Icon'

interface DialogProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children?: ReactNode
  footer?: ReactNode
  className?: string
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: DialogProps) {
  const titleId = useId()
  const descId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)

  useBodyScrollLock(open)

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  useEffect(() => {
    if (open) dialogRef.current?.focus()
  }, [open])

  if (!open) return null

  return createPortal(
    <div data-testid="dialog-backdrop" className="fixed inset-0 z-50 overflow-y-auto">
      <button
        type="button"
        aria-label="Dismiss dialog"
        onClick={onClose}
        className="fixed inset-0 cursor-default bg-overlay"
      />
      <div className="pointer-events-none flex min-h-full items-center justify-center p-4">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal={true}
          {...(title ? { 'aria-labelledby': titleId } : {})}
          {...(description ? { 'aria-describedby': descId } : {})}
          tabIndex={-1}
          className={cn(
            'pointer-events-auto relative z-10 w-full max-w-md rounded-lg bg-background p-6 shadow-lg',
            className,
          )}
        >
          <div className="flex items-start justify-between mb-4">
            {title && (
              <h2 id={titleId} className="text-lg font-semibold text-foreground">
                {title}
              </h2>
            )}
            <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close dialog">
              <Icon name="X" size="sm" />
            </Button>
          </div>
          {description && (
            <p id={descId} className="text-sm text-muted-foreground mb-4">
              {description}
            </p>
          )}
          {children && <div className="mb-4">{children}</div>}
          {footer && <div className="flex justify-end gap-2 mt-4">{footer}</div>}
        </div>
      </div>
    </div>,
    document.body,
  )
}
