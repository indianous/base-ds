import type { ReactElement, ReactNode } from 'react'
import { cloneElement, useState } from 'react'
import { cn } from '../../../utils/cn'
import { useResolvedElement } from '../../../utils/useResolvedElement'
import { Button } from '../../atoms/Button/Button'
import { IconBase } from '../../atoms/Icon/IconBase'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

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

interface SidebarItemAsChildProps {
  element: ReactElement
  onClick?: (() => void) | undefined
  className: string
  'aria-current'?: 'page'
  children: ReactNode
}

// The item's `asChild` element may come from a Server Component as a lazy node (issue #60). It's
// resolved with a hook, which can't run inside the items' map, so this branch is its own component.
function SidebarItemAsChild({
  element,
  children,
  onClick,
  ...buttonProps
}: SidebarItemAsChildProps) {
  const resolved = useResolvedElement(element) as ReactElement
  return (
    <Button asChild variant="ghost" size="sm" {...(onClick && { onClick })} {...buttonProps}>
      {cloneElement(resolved, {}, children)}
    </Button>
  )
}

interface SidebarProps {
  items: SidebarItem[]
  collapsed?: boolean
  onCollapse?: (v: boolean) => void
  footer?: ReactNode
  className?: string
  /** `aria-label` of the `<nav>`. */
  label?: string
  /** `aria-label` of the button that collapses and expands the sidebar. */
  toggleLabel?: string
}

export function Sidebar({
  items,
  collapsed,
  onCollapse,
  footer,
  className,
  label = 'Sidebar navigation',
  toggleLabel = 'Toggle sidebar',
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(collapsed ?? false)

  const handleToggle = () => {
    const next = !isCollapsed
    setIsCollapsed(next)
    onCollapse?.(next)
  }

  return (
    <nav
      role="navigation"
      aria-label={label}
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
          aria-label={toggleLabel}
          className="flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:bg-muted focus:ring-2 focus:ring-ring focus:outline-none"
        >
          <IconBase icon={isCollapsed ? ChevronRightIcon : ChevronLeftIcon} size="sm" />
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
                <SidebarItemAsChild
                  element={item.asChild}
                  onClick={item.onClick}
                  className={itemClasses}
                  {...activeProps}
                >
                  {itemContent}
                </SidebarItemAsChild>
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
