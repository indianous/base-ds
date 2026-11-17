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
  error: 'border-destructive focus:ring-destructive',
  success: 'border-success focus:ring-success',
}

export function Select({
  id,
  options,
  placeholder,
  state = 'default',
  className,
  value,
  defaultValue,
  ...props
}: SelectProps) {
  // The placeholder is selected through the <select>'s own value, never `selected` on the
  // <option> (React warns about it). Uncontrolled selects default to '' so the disabled
  // placeholder starts selected; without it the browser would pick the first enabled option.
  const initialValue =
    value === undefined ? (defaultValue ?? (placeholder !== undefined ? '' : undefined)) : undefined

  return (
    <select
      id={id}
      aria-invalid={state === 'error' ? 'true' : undefined}
      value={value}
      defaultValue={initialValue}
      className={cn(
        'w-full rounded-md border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 appearance-none disabled:opacity-50 disabled:cursor-not-allowed',
        stateClasses[state],
        className,
      )}
      {...props}
    >
      {placeholder !== undefined && (
        <option value="" disabled>
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
