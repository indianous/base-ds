import React from 'react'
import { cn } from '../../../utils/cn'

type SkeletonVariant = 'line' | 'circle' | 'rect'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant
  width?: string | number
  height?: string | number
  className?: string
}

const toCSS = (val?: string | number): string | undefined =>
  val !== undefined ? (typeof val === 'number' ? `${val}px` : val) : undefined

export function Skeleton({ variant = 'rect', width, height, className, ...rest }: SkeletonProps) {
  const variantClass = variant === 'circle' ? 'rounded-full' : 'rounded-md'

  const inlineStyle: React.CSSProperties = {
    width: toCSS(width),
    height: toCSS(height) ?? (variant === 'line' ? '1em' : undefined),
  }

  return (
    <div
      aria-hidden="true"
      className={cn('bg-muted animate-pulse', variantClass, className)}
      style={inlineStyle}
      {...rest}
    />
  )
}
