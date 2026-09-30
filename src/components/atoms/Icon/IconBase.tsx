import type { LucideIcon } from 'lucide-react'
import { cn } from '../../../utils/cn'

type IconSize = 'sm' | 'md' | 'lg' | 'xl'

export type { IconSize }

interface IconBaseProps {
  icon: LucideIcon
  size?: IconSize
  'aria-label'?: string
  className?: string
}

const sizeMap = { sm: 16, md: 20, lg: 24, xl: 32 } as const
const sizeClasses = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6', xl: 'w-8 h-8' } as const

/**
 * Renders a lucide icon imported by name (`import { SearchIcon } from 'lucide-react'`), so the
 * bundle only carries the icons that are used. Internal: components use it instead of `Icon`,
 * whose lookup by name pulls every lucide icon into the bundle (issue #53).
 */
export function IconBase({
  icon: LucideIconComponent,
  size = 'md',
  'aria-label': ariaLabel,
  className,
}: IconBaseProps) {
  return (
    <LucideIconComponent
      size={sizeMap[size]}
      aria-hidden={ariaLabel ? undefined : 'true'}
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
      className={cn(sizeClasses[size], className)}
    />
  )
}
