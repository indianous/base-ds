import React from 'react'
import { cn } from '../../../utils/cn'
import { Text } from '../../atoms/Typography/Text'
import { Icon } from '../../atoms/Icon/Icon'

interface BreadcrumbItem {
  label: string
  href?: string
  onClick?: () => void
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  separator?: React.ReactNode
  className?: string
}

export function Breadcrumb({ items, separator, className }: BreadcrumbProps) {
  const defaultSeparator = <Icon name="ChevronRight" size="sm" className="text-muted-foreground" />

  return (
    <nav aria-label="Breadcrumb" className={className}>
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
                <a
                  href={item.href}
                  className={cn(
                    'text-sm text-muted-foreground hover:text-foreground transition-colors',
                  )}
                >
                  {item.label}
                </a>
              ) : (
                <button
                  type="button"
                  onClick={item.onClick}
                  className={cn(
                    'text-sm text-muted-foreground hover:text-foreground transition-colors focus:outline-none',
                  )}
                >
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
