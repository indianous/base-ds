import type { ReactNode } from 'react'
import { cn } from '../../../utils/cn'

interface NavItem {
  label: string
  href?: string
  active?: boolean
  onClick?: () => void
}

interface NavbarProps {
  logo?: ReactNode
  items?: NavItem[]
  actions?: ReactNode
  sticky?: boolean
  className?: string
}

const linkBaseClasses =
  'px-3 py-1.5 rounded-md text-sm font-medium text-foreground hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring'

export function Navbar({ logo, items, actions, sticky, className }: NavbarProps) {
  return (
    <header
      className={cn(
        sticky && 'sticky top-0 z-50',
        className,
      )}
    >
      <nav
        role="navigation"
        aria-label="Main navigation"
        className="flex justify-between items-center px-4 h-14 bg-background border-b border-border"
      >
        {logo !== undefined && (
          <div className="flex-shrink-0">{logo}</div>
        )}

        {items !== undefined && items.length > 0 && (
          <ul role="list" className="flex items-center gap-1">
            {items.map((item, index) => (
              <li key={index}>
                {item.href !== undefined ? (
                  <a
                    href={item.href}
                    {...(item.active ? { 'aria-current': 'page' as const } : {})}
                    className={cn(
                      linkBaseClasses,
                      item.active && 'text-primary font-semibold',
                    )}
                  >
                    {item.label}
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={item.onClick}
                    {...(item.active ? { 'aria-current': 'page' as const } : {})}
                    className={cn(
                      linkBaseClasses,
                      item.active && 'text-primary font-semibold',
                    )}
                  >
                    {item.label}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        {actions !== undefined && (
          <div className="flex items-center gap-2">{actions}</div>
        )}
      </nav>
    </header>
  )
}
