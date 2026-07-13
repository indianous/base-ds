import React from 'react'
import { cn } from '../../../utils/cn'

export interface SelectOption {
  value: string
  label: string
}

type SelectState = 'default' | 'error' | 'success'

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  id: string
  options: SelectOption[]
  placeholder?: string
  state?: SelectState
}

const stateClasses: Record<SelectState, string> = {
  default: 'border-input focus:ring-ring',
  error:   'border-destructive focus:ring-destructive',
  success: 'border-success focus:ring-success',
}

export function Select({
  id,
  options,
  placeholder,
  state = 'default',
  className,
  value,
  ...props
}: SelectProps) {
  return (
    <select
      id={id}
      aria-invalid={state === 'error' ? 'true' : undefined}
      value={value}
      className={cn(
        'w-full rounded-md border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 appearance-none disabled:opacity-50 disabled:cursor-not-allowed',
        stateClasses[state],
        className,
      )}
      {...props}
    >
      {placeholder !== undefined && (
        <option value="" disabled selected={!value}>
          {placeholder}
        </option>
      )}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
