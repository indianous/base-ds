import React from 'react'
import type { LinkComponent } from '../../../utils/linkComponent'
import { Text } from '../../atoms/Typography/Text'
import { IconBase } from '../../atoms/Icon/IconBase'
import { ChevronRightIcon } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  href?: string
  onClick?: () => void
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[]
  separator?: React.ReactNode
  className?: string
  /** `aria-label` of the `<nav>`. */
  label?: string
  /** Component rendered in place of `<a>` for items with `href` (e.g. Next.js `Link`). */
  linkComponent?: LinkComponent
}

const itemClasses =
  'rounded-sm text-sm text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring'

export function Breadcrumb({
  items,
  separator,
  className,
  label = 'Breadcrumb',
  linkComponent: LinkElement = 'a',
}: BreadcrumbProps) {
  const defaultSeparator = (
    <IconBase icon={ChevronRightIcon} size="sm" className="text-muted-foreground" />
  )

  return (
    <nav aria-label={label} className={className}>
      <ol className="flex items-center flex-wrap gap-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={index} className="flex items-center gap-1">
              {isLast ? (
                <Text as="span" size="sm" weight="medium" aria-current="page">
                  {item.label}
                </Text>
              ) : item.href ? (
                <LinkElement href={item.href} className={itemClasses}>
                  {item.label}
                </LinkElement>
              ) : (
                <button type="button" onClick={item.onClick} className={itemClasses}>
                  {item.label}
                </button>
              )}
              {!isLast && <span aria-hidden="true">{separator ?? defaultSeparator}</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
