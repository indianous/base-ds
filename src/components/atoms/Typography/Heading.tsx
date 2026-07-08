import React from 'react'
import { cn } from '../../../utils/cn'

type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
type HeadingSize = 'xl' | '2xl' | '3xl' | '4xl'
type HeadingWeight = 'regular' | 'medium' | 'semibold' | 'bold'

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: HeadingLevel
  size?: HeadingSize
  weight?: HeadingWeight
  className?: string
  children: React.ReactNode
}

const SIZE_MAP: Record<HeadingSize, string> = {
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
  '4xl': 'text-4xl',
}

const WEIGHT_MAP: Record<HeadingWeight, string> = {
  regular: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
}

export function Heading({
  as = 'h2',
  size = '2xl',
  weight = 'semibold',
  className,
  children,
  ...rest
}: HeadingProps) {
  const classes = cn('text-foreground', SIZE_MAP[size], WEIGHT_MAP[weight], className)
  const Tag = as as React.ElementType

  return <Tag className={classes} {...rest}>{children}</Tag>
}
