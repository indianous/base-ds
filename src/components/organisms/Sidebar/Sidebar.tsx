import type { ReactNode } from 'react'
import { useState } from 'react'
import { cn } from '../../../utils/cn'
import { Icon } from '../../atoms/Icon/Icon'

interface SidebarItem {
  label: string
  icon?: ReactNode
  active?: boolean
  href?: string
  onClick?: () => void
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
            'flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-all duration-200',
            item.active
              ? 'bg-primary text-primary-foreground'
              : 'text-foreground hover:bg-muted',
          )

          const activeProps = item.active ? { 'aria-current': 'page' as const } : {}

          return (
            <li key={index}>
              {item.href ? (
                <a href={item.href} className={itemClasses} {...activeProps}>
                  {itemContent}
                </a>
              ) : item.onClick ? (
                <button
                  type="button"
                  onClick={item.onClick}
                  className={itemClasses}
                  {...activeProps}
                >
                  {itemContent}
                </button>
              ) : (
                <span className={itemClasses} {...activeProps}>
                  {itemContent}
                </span>
              )}
            </li>
          )
        })}
      </ul>

      {footer !== undefined && (
        <div className="mt-auto p-2">{footer}</div>
      )}
    </nav>
  )
}
