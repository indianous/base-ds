import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { cn } from '../../../utils/cn'
import type { LinkComponent } from '../../../utils/linkComponent'
import { IconBase } from '../../atoms/Icon/IconBase'
import { ChevronDownIcon, MenuIcon, SettingsIcon } from 'lucide-react'
import { Drawer } from '../Drawer/Drawer'
import { DropdownMenu } from '../../molecules/DropdownMenu/DropdownMenu'
import type { DropdownMenuItem } from '../../molecules/DropdownMenu/DropdownMenu'
import { NavbarActionContext } from './NavbarActionContext'
import type { NavbarActionContextValue } from './NavbarActionContext'

export type NavItem =
  | { type?: 'link'; label: string; href?: string; active?: boolean; onClick?: () => void }
  | { type: 'dropdown'; label: string; items: DropdownMenuItem[] }

export type NavbarLogoAlign = 'start' | 'center'

export interface NavbarProps {
  logo?: ReactNode
  items?: NavItem[]
  actions?: ReactNode[]
  search?: ReactNode
  sticky?: boolean
  className?: string
  /** Logo position from `md` up. On mobile the logo is always centered. */
  logoAlign?: NavbarLogoAlign
  /** `aria-label` of the `<nav>`. */
  label?: string
  /** `aria-label` of the mobile button that opens the menu drawer. */
  menuButtonLabel?: string
  /** `aria-label` of the mobile button that opens the actions drawer. */
  actionsButtonLabel?: string
  /** Title of the menu drawer. */
  menuTitle?: string
  /** Title of the actions drawer. */
  actionsTitle?: string
  /** `closeLabel` of both drawers. */
  drawerCloseLabel?: string
  /** `dismissLabel` of both drawers. */
  drawerDismissLabel?: string
  /** Component rendered in place of `<a>` for every link (e.g. Next.js `Link`). */
  linkComponent?: LinkComponent
}

const logoCellClasses: Record<NavbarLogoAlign, string> = {
  start: 'justify-center md:justify-start',
  center: 'justify-center',
}

const middleCellClasses: Record<NavbarLogoAlign, string> = {
  start: 'justify-center',
  center: 'justify-start',
}

const linkBaseClasses =
  'px-3 py-1.5 rounded-md text-sm font-medium text-foreground hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring'

const mobileLinkBaseClasses =
  'block px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring'

function DesktopNavItem({ item, linkComponent }: { item: NavItem; linkComponent: LinkComponent }) {
  const LinkElement = linkComponent

  if (item.type === 'dropdown') {
    return (
      <DropdownMenu
        linkComponent={linkComponent}
        trigger={
          <button type="button" className={cn(linkBaseClasses, 'inline-flex items-center gap-1')}>
            {item.label}
            <IconBase icon={ChevronDownIcon} size="sm" />
          </button>
        }
        items={item.items}
      />
    )
  }

  const activeProps = item.active ? { 'aria-current': 'page' as const } : {}

  return item.href !== undefined ? (
    <LinkElement
      href={item.href}
      {...activeProps}
      className={cn(linkBaseClasses, item.active && 'text-primary font-semibold')}
    >
      {item.label}
    </LinkElement>
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

interface MobileItemProps {
  linkComponent: LinkComponent
  /** Closes the drawer: with client-side navigation the page no longer reloads to close it. */
  onNavigate: () => void
}

function MobileDropdownSubItem({
  item,
  linkComponent: LinkElement,
  onNavigate,
}: MobileItemProps & { item: DropdownMenuItem }) {
  if (item.type === 'separator') {
    return <div role="separator" className="my-1 h-px bg-border" />
  }

  const className = cn(mobileLinkBaseClasses, item.danger && 'text-destructive')

  return item.href !== undefined ? (
    <LinkElement href={item.href} onClick={onNavigate} className={className}>
      {item.label}
    </LinkElement>
  ) : (
    <button
      type="button"
      onClick={() => {
        item.onClick?.()
        onNavigate()
      }}
      disabled={item.disabled}
      className={className}
    >
      {item.label}
    </button>
  )
}

function MobileNavItem({
  item,
  linkComponent: LinkElement,
  onNavigate,
}: MobileItemProps & { item: NavItem }) {
  if (item.type === 'dropdown') {
    return (
      <div>
        <span className="block px-3 py-1.5 text-xs font-semibold uppercase text-muted-foreground">
          {item.label}
        </span>
        <ul className="flex flex-col gap-1 pl-3">
          {item.items.map((subItem, index) => (
            <li key={index}>
              <MobileDropdownSubItem
                item={subItem}
                linkComponent={LinkElement}
                onNavigate={onNavigate}
              />
            </li>
          ))}
        </ul>
      </div>
    )
  }

  const activeProps = item.active ? { 'aria-current': 'page' as const } : {}

  return item.href !== undefined ? (
    <LinkElement
      href={item.href}
      onClick={onNavigate}
      {...activeProps}
      className={cn(mobileLinkBaseClasses, item.active && 'text-primary font-semibold')}
    >
      {item.label}
    </LinkElement>
  ) : (
    <button
      type="button"
      onClick={() => {
        item.onClick?.()
        onNavigate()
      }}
      {...activeProps}
      className={cn(mobileLinkBaseClasses, item.active && 'text-primary font-semibold')}
    >
      {item.label}
    </button>
  )
}

export function Navbar({
  logo,
  items,
  actions,
  search,
  sticky,
  className,
  logoAlign = 'start',
  label = 'Main navigation',
  menuButtonLabel = 'Open navigation menu',
  actionsButtonLabel = 'More actions',
  menuTitle = 'Menu',
  actionsTitle = 'Actions',
  drawerCloseLabel = 'Close drawer',
  drawerDismissLabel = 'Dismiss drawer',
  linkComponent = 'a',
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isActionsDrawerOpen, setIsActionsDrawerOpen] = useState(false)

  const hasItems = items !== undefined && items.length > 0
  const hasSearch = search !== undefined
  const showMobileToggle = hasItems || hasSearch
  const hasMultipleActions = actions !== undefined && actions.length > 1

  // Actions in the header get the default (not in a drawer, nothing to close); the copies inside
  // the actions drawer can tell where they are and close it (issue #67).
  const drawerActionContext = useMemo<NavbarActionContextValue>(
    () => ({ inDrawer: true, closeDrawer: () => setIsActionsDrawerOpen(false) }),
    [],
  )

  const logoCell = (
    <div className={cn('flex flex-1 items-center', logoCellClasses[logoAlign])}>
      {logo !== undefined && <div className="flex-shrink-0">{logo}</div>}
    </div>
  )

  const middleCell = (
    <div className={cn('hidden flex-1 md:flex items-center', middleCellClasses[logoAlign])}>
      {hasSearch ? (
        <div className="w-full max-w-md flex justify-center">{search}</div>
      ) : (
        hasItems && (
          <ul className="flex items-center gap-1">
            {items!.map((item, index) => (
              <li key={index}>
                <DesktopNavItem item={item} linkComponent={linkComponent} />
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  )

  return (
    <header className={cn(sticky && 'sticky top-0 z-50', className)}>
      <nav role="navigation" aria-label={label} className="bg-background border-b border-border">
        {/*
          4 equal flex-1 slots, always in this DOM order: toggle, logo, search/items, actions.
          Each breakpoint hides a different slot (`hidden md:flex` / `flex md:hidden`), so the
          visible 3 columns per breakpoint land in the right order without needing `order-*`:
          mobile -> toggle, logo, actions · desktop -> logo, search/items, actions.
          With logoAlign="center" the logo and search/items slots swap in the DOM, so from md the
          logo takes the middle column (desktop -> search/items, logo, actions) while mobile is
          unchanged (search/items is hidden there). Swapping in the DOM rather than with `order-*`
          keeps keyboard focus order matching the visual order.
        */}
        <div className="flex items-center gap-4 px-4 h-14">
          <div className="flex flex-1 md:hidden items-center justify-start">
            {showMobileToggle && (
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label={menuButtonLabel}
                className="flex items-center justify-center w-9 h-9 rounded-md text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <IconBase icon={MenuIcon} size="sm" />
              </button>
            )}
          </div>

          {logoAlign === 'center' ? (
            <>
              {middleCell}
              {logoCell}
            </>
          ) : (
            <>
              {logoCell}
              {middleCell}
            </>
          )}

          <div className="flex flex-1 items-center justify-end gap-2">
            <div className="hidden md:flex items-center gap-2">
              {actions?.map((action, index) => (
                <div key={index}>{action}</div>
              ))}
            </div>

            <div className="flex md:hidden items-center">
              {actions !== undefined && actions.length === 1 && <div>{actions[0]}</div>}

              {hasMultipleActions && (
                <button
                  type="button"
                  onClick={() => setIsActionsDrawerOpen(true)}
                  aria-label={actionsButtonLabel}
                  className="flex items-center justify-center w-9 h-9 rounded-md text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <IconBase icon={SettingsIcon} size="sm" />
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
                  <DesktopNavItem item={item} linkComponent={linkComponent} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>

      {showMobileToggle && (
        <Drawer
          open={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          side="left"
          title={menuTitle}
          closeLabel={drawerCloseLabel}
          dismissLabel={drawerDismissLabel}
        >
          <div className="flex flex-col gap-4">
            {hasSearch && <div>{search}</div>}

            {hasItems && (
              <ul className="flex flex-col gap-1">
                {items!.map((item, index) => (
                  <li key={index}>
                    <MobileNavItem
                      item={item}
                      linkComponent={linkComponent}
                      onNavigate={() => setIsMobileMenuOpen(false)}
                    />
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
          title={actionsTitle}
          closeLabel={drawerCloseLabel}
          dismissLabel={drawerDismissLabel}
        >
          <NavbarActionContext.Provider value={drawerActionContext}>
            <div className="flex flex-col gap-2">
              {actions!.map((action, index) => (
                <div key={index}>{action}</div>
              ))}
            </div>
          </NavbarActionContext.Provider>
        </Drawer>
      )}
    </header>
  )
}
