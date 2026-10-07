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
  /** Clamps the text to this many lines, with an ellipsis. */
  lines?: number
  /** With `lines`, reserves the height of those lines even when the text is shorter. */
  reserveLines?: boolean
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
  destructive: 'text-destructive',
}

export function Text({
  as = 'p',
  size = 'md',
  weight = 'regular',
  color = 'default',
  className,
  children,
  lines,
  reserveLines = false,
  style,
  ...rest
}: TextProps) {
  // Fixed class names that read the line count from a CSS variable: a dynamic `line-clamp-${n}`
  // wouldn't be found by the app's Tailwind when it scans the dist. `1lh` is one line of this
  // text, so the reserved height follows its size and line height.
  const clamp = lines !== undefined && Number.isInteger(lines) && lines > 0

  return React.createElement(
    as,
    {
      className: cn(
        sizeMap[size],
        weightMap[weight],
        colorMap[color],
        clamp && 'line-clamp-[var(--text-lines)]',
        clamp && reserveLines && 'min-h-[calc(var(--text-lines)*1lh)]',
        className,
      ),
      style: clamp ? ({ ...style, '--text-lines': lines } as React.CSSProperties) : style,
      ...rest,
    },
    children,
  )
}
