import React, { useState } from 'react'
import { cn } from '../../../utils/cn'
import { Button } from '../../atoms/Button/Button'
import { Input } from '../../atoms/Input/Input'

interface NumberInputProps extends Pick<
  React.AriaAttributes,
  'aria-label' | 'aria-labelledby' | 'aria-describedby' | 'aria-invalid'
> {
  id: string
  value?: number
  defaultValue?: number
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  onChange?: (value: number) => void
  className?: string
}

export function NumberInput({
  id,
  value,
  defaultValue,
  min,
  max,
  step = 1,
  disabled = false,
  onChange,
  className,
  ...ariaProps
}: NumberInputProps) {
  const [internalValue, setInternalValue] = useState<number>(value ?? defaultValue ?? 0)
  const [prevValue, setPrevValue] = useState(value)

  if (value !== undefined && value !== prevValue) {
    setPrevValue(value)
    setInternalValue(value)
  }

  const handleDecrement = () => {
    const next = internalValue - step
    const clamped = min !== undefined ? Math.max(next, min) : next
    setInternalValue(clamped)
    onChange?.(clamped)
  }

  const handleIncrement = () => {
    const next = internalValue + step
    const clamped = max !== undefined ? Math.min(next, max) : next
    setInternalValue(clamped)
    onChange?.(clamped)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = parseFloat(e.target.value)
    if (!isNaN(raw)) {
      setInternalValue(raw)
      onChange?.(raw)
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const raw = parseFloat(e.target.value)
    if (!isNaN(raw)) {
      let clamped = raw
      if (min !== undefined) clamped = Math.max(clamped, min)
      if (max !== undefined) clamped = Math.min(clamped, max)
      setInternalValue(clamped)
      onChange?.(clamped)
    }
  }

  const isDecrementDisabled = disabled || (min !== undefined && internalValue <= min)
  const isIncrementDisabled = disabled || (max !== undefined && internalValue >= max)

  return (
    <div className={cn('flex items-center', className)}>
      <Button
        variant="outline"
        size="md"
        aria-label="Decrement"
        onClick={handleDecrement}
        disabled={isDecrementDisabled}
        className="rounded-r-none focus:z-10"
      >
        −
      </Button>
      <Input
        id={id}
        {...ariaProps}
        type="number"
        value={internalValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        disabled={disabled}
        className={cn(
          'rounded-none text-center w-auto flex-1 min-w-0 -mx-px z-10',
          '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
        )}
      />
      <Button
        variant="outline"
        size="md"
        aria-label="Increment"
        onClick={handleIncrement}
        disabled={isIncrementDisabled}
        className="rounded-l-none focus:z-10"
      >
        +
      </Button>
    </div>
  )
}
