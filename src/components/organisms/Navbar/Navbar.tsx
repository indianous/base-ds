import { useState } from 'react'
import type { ReactNode } from 'react'
import { cn } from '../../../utils/cn'
import { Icon } from '../../atoms/Icon/Icon'
import { Drawer } from '../Drawer/Drawer'
import { DropdownMenu } from '../../molecules/DropdownMenu/DropdownMenu'
import type { DropdownMenuItem } from '../../molecules/DropdownMenu/DropdownMenu'

export type NavItem =
  | { type?: 'link'; label: string; href?: string; active?: boolean; onClick?: () => void }
  | { type: 'dropdown'; label: string; items: DropdownMenuItem[] }

export interface NavbarProps {
  logo?: ReactNode
  items?: NavItem[]
  actions?: ReactNode[]
  search?: ReactNode
  sticky?: boolean
  className?: string
}

const linkBaseClasses =
  'px-3 py-1.5 rounded-md text-sm font-medium text-foreground hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring'

const mobileLinkBaseClasses =
  'block px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring'

function DesktopNavItem({ item }: { item: NavItem }) {
  if (item.type === 'dropdown') {
    return (
      <DropdownMenu
        trigger={
          <button type="button" className={cn(linkBaseClasses, 'inline-flex items-center gap-1')}>
            {item.label}
            <Icon name="ChevronDown" size="sm" />
          </button>
        }
        items={item.items}
      />
    )
  }

  const activeProps = item.active ? { 'aria-current': 'page' as const } : {}

  return item.href !== undefined ? (
    <a
      href={item.href}
      {...activeProps}
      className={cn(linkBaseClasses, item.active && 'text-primary font-semibold')}
    >
      {item.label}
    </a>
  ) : (
    <button
      type="button"
      onClick={item.onClick}
      {...activeProps}
      className={cn(linkBaseClasses, item.active && 'text-primary font-semibold')}
    >
      {item.label}
    </button>
  )
}

function MobileDropdownSubItem({ item }: { item: DropdownMenuItem }) {
  if (item.type === 'separator') {
    return <div role="separator" className="my-1 h-px bg-border" />
  }

  const className = cn(mobileLinkBaseClasses, item.danger && 'text-destructive')

  return item.href !== undefined ? (
    <a href={item.href} className={className}>
      {item.label}
    </a>
  ) : (
    <button type="button" onClick={item.onClick} disabled={item.disabled} className={className}>
      {item.label}
    </button>
  )
}

function MobileNavItem({ item }: { item: NavItem }) {
  if (item.type === 'dropdown') {
    return (
      <div>
        <span className="block px-3 py-1.5 text-xs font-semibold uppercase text-muted-foreground">
          {item.label}
        </span>
        <ul className="flex flex-col gap-1 pl-3">
          {item.items.map((subItem, index) => (
            <li key={index}>
              <MobileDropdownSubItem item={subItem} />
            </li>
          ))}
        </ul>
      </div>
    )
  }

  const activeProps = item.active ? { 'aria-current': 'page' as const } : {}

  return item.href !== undefined ? (
    <a
      href={item.href}
      {...activeProps}
      className={cn(mobileLinkBaseClasses, item.active && 'text-primary font-semibold')}
    >
      {item.label}
    </a>
  ) : (
    <button
      type="button"
      onClick={item.onClick}
      {...activeProps}
      className={cn(mobileLinkBaseClasses, item.active && 'text-primary font-semibold')}
    >
      {item.label}
    </button>
  )
}

export function Navbar({ logo, items, actions, search, sticky, className }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isActionsDrawerOpen, setIsActionsDrawerOpen] = useState(false)

  const hasItems = items !== undefined && items.length > 0
  const hasSearch = search !== undefined
  const showMobileToggle = hasItems || hasSearch
  const hasMultipleActions = actions !== undefined && actions.length > 1

  return (
    <header className={cn(sticky && 'sticky top-0 z-50', className)}>
      <nav
        role="navigation"
        aria-label="Main navigation"
        className="bg-background border-b border-border"
      >
        {/*
          4 equal flex-1 slots, always in this DOM order: toggle, logo, search/items, actions.
          Each breakpoint hides a different slot (`hidden md:flex` / `flex md:hidden`), so the
          visible 3 columns per breakpoint land in the right order without needing `order-*`:
          mobile -> toggle, logo, actions · desktop -> logo, search/items, actions.
        */}
        <div className="flex items-center gap-4 px-4 h-14">
          <div className="flex flex-1 md:hidden items-center justify-start">
            {showMobileToggle && (
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Open navigation menu"
                className="flex items-center justify-center w-9 h-9 rounded-md text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <Icon name="Menu" size="sm" />
              </button>
            )}
          </div>

          <div className="flex flex-1 items-center justify-center md:justify-start">
            {logo !== undefined && <div className="flex-shrink-0">{logo}</div>}
          </div>

          <div className="hidden flex-1 md:flex items-center justify-center">
            {hasSearch ? (
              <div className="w-full max-w-md flex justify-center">{search}</div>
            ) : (
              hasItems && (
                <ul className="flex items-center gap-1">
                  {items!.map((item, index) => (
                    <li key={index}>
                      <DesktopNavItem item={item} />
                    </li>
                  ))}
                </ul>
              )
            )}
          </div>

          <div className="flex flex-1 items-center justify-end gap-2">
            <div className="hidden md:flex items-center gap-2">
              {actions?.map((action, index) => <div key={index}>{action}</div>)}
            </div>

            <div className="flex md:hidden items-center">
              {actions !== undefined && actions.length === 1 && <div>{actions[0]}</div>}

              {hasMultipleActions && (
                <button
                  type="button"
                  onClick={() => setIsActionsDrawerOpen(true)}
                  aria-label="More actions"
                  className="flex items-center justify-center w-9 h-9 rounded-md text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <Icon name="Settings" size="sm" />
                </button>
              )}
            </div>
          </div>
        </div>

        {hasSearch && hasItems && (
          <div className="hidden md:flex justify-center border-t border-border px-4 py-2">
            <ul className="flex items-center gap-1">
              {items!.map((item, index) => (
                <li key={index}>
                  <DesktopNavItem item={item} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>

      {showMobileToggle && (
        <Drawer open={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} side="left" title="Menu">
          <div className="flex flex-col gap-4">
            {hasSearch && <div>{search}</div>}

            {hasItems && (
              <ul className="flex flex-col gap-1">
                {items!.map((item, index) => (
                  <li key={index}>
                    <MobileNavItem item={item} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Drawer>
      )}

      {hasMultipleActions && (
        <Drawer
          open={isActionsDrawerOpen}
          onClose={() => setIsActionsDrawerOpen(false)}
          side="right"
          title="Actions"
        >
          <div className="flex flex-col gap-2">
            {actions!.map((action, index) => <div key={index}>{action}</div>)}
          </div>
        </Drawer>
      )}
    </header>
  )
}
