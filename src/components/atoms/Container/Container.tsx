import React from 'react'
import { cn } from '../../../utils/cn'

type ContainerAs = 'div' | 'main' | 'section' | 'article'
type ContainerWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '7xl'
type ContainerSpacing = 'default' | 'relaxed' | 'loose'

export interface ContainerProps extends React.HTMLAttributes<HTMLElement> {
  as?: ContainerAs
  width?: ContainerWidth
  spacing?: ContainerSpacing
  className?: string
  children: React.ReactNode
}

// Literal class names so consumers' Tailwind finds them when scanning dist/.
const widthClasses: Record<ContainerWidth, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '7xl': 'max-w-7xl',
}

const spacingClasses: Record<ContainerSpacing, string> = {
  default: 'py-8',
  relaxed: 'py-12',
  loose: 'py-16',
}

const baseClasses = 'mx-auto w-full px-4'

export function Container({
  as = 'div',
  width = '5xl',
  spacing = 'default',
  className,
  children,
  ...rest
}: ContainerProps) {
  return React.createElement(
    as,
    {
      className: cn(baseClasses, widthClasses[width], spacingClasses[spacing], className),
      ...rest,
    },
    children,
  )
}
