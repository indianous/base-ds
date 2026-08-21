import { useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'
import { cn } from '../../../utils/cn'
import { useBodyScrollLock } from '../../../utils/useBodyScrollLock'
import { Button } from '../../atoms/Button/Button'
import { Icon } from '../../atoms/Icon/Icon'

type DrawerSide = 'left' | 'right' | 'top' | 'bottom'

export interface DrawerProps {
  open: boolean
  onClose: () => void
  title?: string
  side?: DrawerSide
  children?: ReactNode
  footer?: ReactNode
  className?: string
}

const SIDE_CLASSES: Record<DrawerSide, string> = {
  left: 'inset-y-0 left-0 w-80 border-r border-border',
  right: 'inset-y-0 right-0 w-80 border-l border-border',
  top: 'inset-x-0 top-0 h-80 border-b border-border',
  bottom: 'inset-x-0 bottom-0 h-80 border-t border-border',
}

export function Drawer({
  open,
  onClose,
  title,
  side = 'right',
  children,
  footer,
  className,
}: DrawerProps) {
  const titleId = useId()

  useBodyScrollLock(open)

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div data-testid="drawer-backdrop" className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Dismiss drawer"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-overlay"
      />
      <div
        role="dialog"
        aria-modal="true"
        {...(title ? { 'aria-labelledby': titleId } : {})}
        className={cn(
          'absolute bg-background shadow-lg flex flex-col',
          SIDE_CLASSES[side],
          className,
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          {title && (
            <h2 id={titleId} className="font-semibold text-foreground">
              {title}
            </h2>
          )}
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close drawer">
            <Icon name="X" size="sm" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
        {footer && <div className="p-4 border-t border-border">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}
