import React from 'react'
import { cn } from '../../../utils/cn'

type TextareaSize = 'sm' | 'md' | 'lg'
type TextareaState = 'default' | 'error' | 'success'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string
  size?: TextareaSize
  state?: TextareaState
}

const sizeClasses: Record<TextareaSize, string> = {
  sm: 'min-h-[4.5rem] px-3 py-2 text-sm',
  md: 'min-h-[6rem] px-4 py-2 text-base',
  lg: 'min-h-[8rem] px-4 py-3 text-lg',
}

const stateClasses: Record<TextareaState, string> = {
  default: 'border border-input focus:ring-2 focus:ring-ring',
  error: 'border border-destructive focus:ring-2 focus:ring-destructive',
  success: 'border border-success focus:ring-2 focus:ring-success',
}

export function Textarea({
  id,
  size = 'md',
  state = 'default',
  className,
  ...props
}: TextareaProps) {
  return (
    <textarea
      id={id}
      aria-invalid={state === 'error' ? 'true' : undefined}
      className={cn(
        'w-full rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        sizeClasses[size],
        stateClasses[state],
        className,
      )}
      {...props}
    />
  )
}
