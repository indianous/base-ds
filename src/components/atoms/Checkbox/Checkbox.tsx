import React, { useEffect, useRef } from 'react'
import { cn } from '../../../utils/cn'

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  id: string
  label?: string
  indeterminate?: boolean
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ id, label, indeterminate, disabled, className, ...rest }, forwardedRef) => {
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.indeterminate = indeterminate ?? false
      }
    }, [indeterminate])

    const setRefs = (el: HTMLInputElement | null) => {
      ;(inputRef as React.MutableRefObject<HTMLInputElement | null>).current = el
      if (typeof forwardedRef === 'function') {
        forwardedRef(el)
      } else if (forwardedRef) {
        ;(forwardedRef as React.MutableRefObject<HTMLInputElement | null>).current = el
      }
    }

    return (
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={id}
          ref={setRefs}
          disabled={disabled}
          className={cn(
            'w-4 h-4 rounded-sm accent-primary cursor-pointer disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
          {...rest}
        />
        {label && (
          <label htmlFor={id} className="text-sm text-foreground cursor-pointer select-none">
            {label}
          </label>
        )}
      </div>
    )
  },
)

Checkbox.displayName = 'Checkbox'
