import type { ReactElement, ReactNode } from 'react'
import { cloneElement, useState } from 'react'
import { cn } from '../../../utils/cn'
import { Button } from '../../atoms/Button/Button'
import { Icon } from '../../atoms/Icon/Icon'

interface SidebarItem {
  label: string
  icon?: ReactNode
  active?: boolean
  href?: string
  onClick?: () => void
  asChild?: ReactElement
}

interface SidebarProps {
  items: SidebarItem[]
  collapsed?: boolean
  onCollapse?: (v: boolean) => void
  footer?: ReactNode
  className?: string
}

export function Sidebar({ items, collapsed, onCollapse, footer, className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(collapsed ?? false)

  const handleToggle = () => {
    const next = !isCollapsed
    setIsCollapsed(next)
    onCollapse?.(next)
  }

  return (
    <nav
      role="navigation"
      aria-label="Sidebar navigation"
      className={cn(
        'flex flex-col h-full bg-background border-r border-border transition-all duration-200',
        isCollapsed ? 'w-14' : 'w-56',
        className,
      )}
    >
      <div className="flex justify-end p-2">
        <button
          type="button"
          onClick={handleToggle}
          aria-expanded={!isCollapsed}
          aria-label="Toggle sidebar"
          className="flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:bg-muted focus:ring-2 focus:ring-ring focus:outline-none"
        >
          <Icon name={isCollapsed ? 'ChevronRight' : 'ChevronLeft'} size="sm" />
        </button>
      </div>

      <ul role="list" className="flex flex-col gap-1 p-2">
        {items.map((item, index) => {
          const itemContent = (
            <>
              {item.icon}
              {isCollapsed ? (
                <span className="sr-only">{item.label}</span>
              ) : (
                <span>{item.label}</span>
              )}
            </>
          )

          const itemClasses = cn(
            'w-full justify-start gap-2 rounded-md px-2 py-2 text-sm font-normal',
            item.active
              ? 'bg-primary text-primary-foreground hover:bg-primary'
              : 'text-foreground hover:bg-muted',
          )

          const activeProps = item.active ? { 'aria-current': 'page' as const } : {}

          return (
            <li key={index}>
              {item.asChild ? (
                <Button
                  asChild
                  onClick={item.onClick}
                  variant="ghost"
                  size="sm"
                  className={itemClasses}
                  {...activeProps}
                >
                  {cloneElement(item.asChild, {}, itemContent)}
                </Button>
              ) : item.href ? (
                <Button
                  as="a"
                  href={item.href}
                  variant="ghost"
                  size="sm"
                  className={itemClasses}
                  {...activeProps}
                >
                  {itemContent}
                </Button>
              ) : item.onClick ? (
                <Button
                  onClick={item.onClick}
                  variant="ghost"
                  size="sm"
                  className={itemClasses}
                  {...activeProps}
                >
                  {itemContent}
                </Button>
              ) : (
                <span className={itemClasses} {...activeProps}>
                  {itemContent}
                </span>
              )}
            </li>
          )
        })}
      </ul>

      {footer !== undefined && <div className="mt-auto p-2">{footer}</div>}
    </nav>
  )
}
