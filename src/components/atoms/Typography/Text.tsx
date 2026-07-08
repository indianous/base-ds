import React from 'react'
import { cn } from '../../../utils/cn'

type TextAs = 'p' | 'span' | 'label'
type TextSize = 'xs' | 'sm' | 'md' | 'lg'
type TextColor = 'default' | 'muted' | 'destructive'
type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold'

interface TextProps extends React.HTMLAttributes<HTMLElement> {
  as?: TextAs
  size?: TextSize
  weight?: TextWeight
  color?: TextColor
  className?: string
  children: React.ReactNode
}

const sizeMap: Record<TextSize, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
}

const weightMap: Record<TextWeight, string> = {
  regular: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
}

const colorMap: Record<TextColor, string> = {
  default: 'text-foreground',
  muted: 'text-muted-foreground',
  destructive: 'text-destructive-foreground',
}

export function Text({
  as = 'p',
  size = 'md',
  weight = 'regular',
  color = 'default',
  className,
  children,
  ...rest
}: TextProps) {
  return React.createElement(
    as,
    {
      className: cn(sizeMap[size], weightMap[weight], colorMap[color], className),
      ...rest,
    },
    children,
  )
}
