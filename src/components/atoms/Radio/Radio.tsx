import React from 'react'
import { cn } from '../../../utils/cn'

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  id: string
  label?: string
  value: string
}

export function Radio({ id, label, value, className, ...props }: RadioProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="radio"
        id={id}
        value={value}
        className={cn(
          'w-4 h-4 accent-primary cursor-pointer disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      />
      {label && (
        <label
          htmlFor={id}
          className="text-sm text-foreground cursor-pointer select-none"
        >
          {label}
        </label>
      )}
    </div>
  )
}
