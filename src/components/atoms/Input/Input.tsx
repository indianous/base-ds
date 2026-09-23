import React from 'react'
import { cn } from '../../../utils/cn'

type InputSize = 'sm' | 'md' | 'lg'
type InputState = 'default' | 'error' | 'success'

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  id: string
  size?: InputSize
  state?: InputState
}

const sizeClasses: Record<InputSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-base',
  lg: 'h-12 px-4 text-lg',
}

const stateClasses: Record<InputState, string> = {
  default: 'border border-input focus:ring-2 focus:ring-ring',
  error: 'border border-destructive focus:ring-2 focus:ring-destructive',
  success: 'border border-success focus:ring-2 focus:ring-success',
}

export function Input({
  id,
  size = 'md',
  state = 'default',
  type = 'text',
  className,
  ...props
}: InputProps) {
  return (
    <input
      id={id}
      type={type}
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
