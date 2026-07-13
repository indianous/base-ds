import React from 'react'
import { cn } from '../../../utils/cn'
import { Text } from '../../atoms/Typography/Text'

export interface FormFieldProps {
  label: string
  id: string
  error?: string
  hint?: string
  required?: boolean
  className?: string
  children: React.ReactNode
}

export function FormField({ label, id, error, hint, required, className, children }: FormFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {/* Label — uses a native <label> element so htmlFor is fully type-safe */}
      <label htmlFor={id} className="text-sm font-medium text-foreground cursor-pointer">
        {label}
        {required && (
          <span className="text-destructive ml-1" aria-hidden="true">
            *
          </span>
        )}
      </label>

      {/* Control slot — clone child to inject id and aria attributes */}
      {React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
        id,
        'aria-describedby': [hintId, errorId].filter(Boolean).join(' ') || undefined,
        'aria-invalid': error ? 'true' : undefined,
      })}

      {/* Hint — hidden when error is present */}
      {hint && !error && (
        <Text id={hintId} as="span" size="xs" color="muted">
          {hint}
        </Text>
      )}

      {/* Error */}
      {error && (
        <Text id={errorId} as="span" size="xs" color="destructive" role="alert">
          {error}
        </Text>
      )}
    </div>
  )
}
