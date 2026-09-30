import * as LucideIcons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { IconBase } from './IconBase'
import type { IconSize } from './IconBase'

type IconName = keyof typeof LucideIcons

export type { IconName, IconSize }

interface IconProps {
  name: IconName
  size?: IconSize
  'aria-label'?: string
  className?: string
}

/**
 * Renders a lucide icon by name. The lookup by name keeps every lucide icon (~650 KB) in the
 * bundle of any app that uses `Icon`; in the app, prefer importing the icon from `lucide-react`.
 */
export function Icon({ name, ...props }: IconProps) {
  const LucideIconComponent = LucideIcons[name] as LucideIcon | undefined
  if (!LucideIconComponent) return null

  return <IconBase icon={LucideIconComponent} {...props} />
}
