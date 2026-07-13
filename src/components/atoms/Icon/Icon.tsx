import React from 'react'
import * as LucideIcons from 'lucide-react'
import { cn } from '../../../utils/cn'

type IconName = keyof typeof LucideIcons
type IconSize = 'sm' | 'md' | 'lg' | 'xl'

interface IconProps {
  name: IconName
  size?: IconSize
  'aria-label'?: string
  className?: string
}

const sizeMap = { sm: 16, md: 20, lg: 24, xl: 32 } as const
const sizeClasses = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6', xl: 'w-8 h-8' } as const

export function Icon({ name, size = 'md', 'aria-label': ariaLabel, className }: IconProps) {
  const LucideIcon = LucideIcons[name] as React.ElementType
  if (!LucideIcon) return null

  return (
    <LucideIcon
      size={sizeMap[size]}
      aria-hidden={ariaLabel ? undefined : 'true'}
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
      className={cn(sizeClasses[size], className)}
    />
  )
}
