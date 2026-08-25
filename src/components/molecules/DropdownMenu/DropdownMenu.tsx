import { cloneElement, useEffect, useId, useRef, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent, ReactElement, ReactNode } from 'react'
import { cn } from '../../../utils/cn'
import { Button } from '../../atoms/Button/Button'
import type { TooltipSide } from '../../../utils/tooltipPosition'

export type DropdownMenuItem =
  | { type: 'separator' }
  | {
      type?: 'item'
      label: string
      icon?: ReactNode
      href?: string
      onClick?: () => void
      disabled?: boolean
      danger?: boolean
    }

export interface DropdownMenuProps {
  trigger: ReactElement
  items: DropdownMenuItem[]
  align?: 'start' | 'end'
  position?: TooltipSide
  onOpenChange?: (open: boolean) => void
  className?: string
}

const sideClass: Record<TooltipSide, string> = {
  top: 'bottom-full mb-1',
  bottom: 'top-full mt-1',
  left: 'right-full mr-1',
  right: 'left-full ml-1',
}

function getMenuItemElements(menu: HTMLElement | null): HTMLElement[] {
  if (!menu) return []
  return Array.from(menu.querySelectorAll<HTMLElement>('[role="menuitem"]'))
}

export function DropdownMenu({
  trigger,
  items,
  align = 'start',
  position = 'bottom',
  onOpenChange,
  className,
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  const setOpenState = (next: boolean) => {
    setOpen(next)
    onOpenChange?.(next)
  }

  const closeAndFocusTrigger = () => {
    setOpenState(false)
    containerRef.current?.querySelector<HTMLElement>('[aria-haspopup="menu"]')?.focus()
  }

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenState(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    if (!open) return
    getMenuItemElements(menuRef.current)[0]?.focus()
  }, [open])

  const handleMenuKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const menuItems = getMenuItemElements(menuRef.current)
    const currentIndex = menuItems.indexOf(document.activeElement as HTMLElement)

    switch (e.key) {
      case 'Escape':
        e.preventDefault()
        closeAndFocusTrigger()
        break
      case 'ArrowDown':
        e.preventDefault()
        menuItems[(currentIndex + 1) % menuItems.length]?.focus()
        break
      case 'ArrowUp':
        e.preventDefault()
        menuItems[(currentIndex - 1 + menuItems.length) % menuItems.length]?.focus()
        break
      case 'Home':
        e.preventDefault()
        menuItems[0]?.focus()
        break
      case 'End':
        e.preventDefault()
        menuItems[menuItems.length - 1]?.focus()
        break
    }
  }

  const triggerAsClonable = trigger as ReactElement<Record<string, unknown>>

  const triggerElement = cloneElement(triggerAsClonable, {
    'aria-haspopup': 'menu',
    'aria-expanded': open,
    ...(open ? { 'aria-controls': menuId } : {}),
    onClick: (e: React.MouseEvent) => {
      const onTriggerClick = triggerAsClonable.props.onClick as
        ((e: React.MouseEvent) => void) | undefined
      onTriggerClick?.(e)
      setOpenState(!open)
    },
  })

  return (
    <div ref={containerRef} className={cn('relative inline-block', className)}>
      {triggerElement}

      {open && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          tabIndex={-1}
          onKeyDown={handleMenuKeyDown}
          className={cn(
            'absolute z-20 min-w-[10rem] rounded-md border border-border bg-background py-1 shadow-md',
            sideClass[position],
            position === 'top' || position === 'bottom'
              ? align === 'end'
                ? 'right-0'
                : 'left-0'
              : align === 'end'
                ? 'bottom-0'
                : 'top-0',
          )}
        >
          {items.map((item, index) => {
            if (item.type === 'separator') {
              return <div key={index} role="separator" className="my-1 h-px bg-border" />
            }

            const itemClassName = cn(
              'w-full justify-start rounded-none text-left',
              item.danger && 'text-destructive hover:bg-destructive-muted',
            )

            const handleSelect = () => {
              if (item.disabled) return
              item.onClick?.()
              setOpenState(false)
            }

            if (item.href) {
              return (
                <Button
                  key={index}
                  as="a"
                  href={item.href}
                  role="menuitem"
                  tabIndex={-1}
                  variant="ghost"
                  size="sm"
                  disabled={item.disabled ?? false}
                  onClick={handleSelect}
                  className={itemClassName}
                >
                  {item.icon}
                  {item.label}
                </Button>
              )
            }

            return (
              <Button
                key={index}
                type="button"
                role="menuitem"
                tabIndex={-1}
                variant="ghost"
                size="sm"
                disabled={item.disabled}
                onClick={handleSelect}
                className={itemClassName}
              >
                {item.icon}
                {item.label}
              </Button>
            )
          })}
        </div>
      )}
    </div>
  )
}
