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
  group?: string
}

type SidebarRow =
  { type: 'header'; group: string; key: string } | { type: 'item'; item: SidebarItem; key: string }

function buildRows(items: SidebarItem[]): SidebarRow[] {
  const rows: SidebarRow[] = []
  let previousGroup: string | undefined

  items.forEach((item, index) => {
    if (item.group !== undefined && item.group !== previousGroup) {
      rows.push({ type: 'header', group: item.group, key: `group-${index}` })
    }
    rows.push({ type: 'item', item, key: String(index) })
    previousGroup = item.group
  })

  return rows
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

      {/* eslint-disable-next-line jsx-a11y/no-redundant-roles -- Tailwind Preflight sets list-style:none on ul, which strips the implicit list role for Safari/VoiceOver; role="list" restores it. */}
      <ul role="list" className="flex flex-col gap-1 p-2">
        {buildRows(items).map((row) => {
          if (row.type === 'header') {
            return (
              <li key={row.key}>
                <span
                  className={cn(
                    'block px-2 pb-1 text-xs font-semibold uppercase text-muted-foreground',
                    isCollapsed && 'sr-only',
                  )}
                >
                  {row.group}
                </span>
              </li>
            )
          }

          const item = row.item
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
            <li key={row.key}>
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
