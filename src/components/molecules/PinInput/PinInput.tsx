import { useRef, useState, type ClipboardEvent, type KeyboardEvent, type ChangeEvent } from 'react'
import { cn } from '../../../utils/cn'

export interface PinInputProps {
  length?: number
  value?: string
  onChange?: (value: string) => void
  onComplete?: (value: string) => void
  disabled?: boolean
  mask?: boolean
  className?: string
  /** `aria-label` of the group. */
  groupLabel?: string
  /** `aria-label` of each input, from its 1-based position. */
  digitLabel?: (n: number) => string
  /** Applied to the first input only, e.g. `'one-time-code'`. */
  autoComplete?: string
  /** `id` of the first input, so a `FormField` label points to it. */
  id?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean | 'true' | 'false'
}

const defaultDigitLabel = (n: number) => `PIN digit ${n}`

export function PinInput({
  length = 4,
  value,
  onChange,
  onComplete,
  disabled = false,
  mask = false,
  className,
  groupLabel = 'PIN input',
  digitLabel = defaultDigitLabel,
  autoComplete,
  id,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
}: PinInputProps) {
  const [values, setValues] = useState<string[]>(() => {
    if (value !== undefined) {
      const chars = value.split('')
      return Array.from({ length }, (_, i) => chars[i] ?? '')
    }
    return Array(length).fill('')
  })

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [prevValue, setPrevValue] = useState(value)

  if (value !== undefined && value !== prevValue) {
    setPrevValue(value)
    const chars = value.split('')
    setValues(Array.from({ length }, (_, i) => chars[i] ?? ''))
  }

  const focusInput = (index: number) => {
    const el = inputRefs.current[index]
    if (el) {
      el.focus()
      // Place cursor at end
      el.setSelectionRange(el.value.length, el.value.length)
    }
  }

  // Fills consecutive slots from `index` with `digits` (paste or autofill)
  const fillFrom = (index: number, digits: string) => {
    const next = [...values]
    let lastFilled = index
    for (let i = 0; i < digits.length && index + i < length; i++) {
      next[index + i] = digits[i] ?? ''
      lastFilled = index + i
    }
    setValues(next)

    const joined = next.join('')
    onChange?.(joined)

    if (next.every((v) => v !== '')) {
      onComplete?.(joined)
    }

    // Focus the slot after the last filled, or the last slot
    const focusTarget = Math.min(lastFilled + 1, length - 1)
    focusInput(focusTarget)
  }

  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/[^0-9]/g, '')

    // A whole code set at once on an empty slot (autofill) is spread across the slots
    if (digits.length > 1 && values[index] === '') {
      fillFrom(index, digits)
      return
    }

    // Otherwise keep only the last digit typed
    const char = digits.slice(-1)

    const next = [...values]
    next[index] = char
    setValues(next)

    const joined = next.join('')
    onChange?.(joined)

    if (char && index < length - 1) {
      focusInput(index + 1)
    }

    if (next.every((v) => v !== '')) {
      onComplete?.(joined)
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (values[index] !== '') {
        // Clear current slot
        const next = [...values]
        next[index] = ''
        setValues(next)
        onChange?.(next.join(''))
      } else if (index > 0) {
        // Move to previous and clear it
        focusInput(index - 1)
        const next = [...values]
        next[index - 1] = ''
        setValues(next)
        onChange?.(next.join(''))
      }
      e.preventDefault()
    } else if (e.key === 'ArrowLeft' && index > 0) {
      focusInput(index - 1)
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      focusInput(index + 1)
    }
  }

  const handlePaste = (index: number, e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '')
    if (!pasted) return
    fillFrom(index, pasted)
  }

  return (
    <div role="group" aria-label={groupLabel} className={cn('flex flex-row gap-2', className)}>
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputRefs.current[i] = el
          }}
          type={mask ? 'password' : 'text'}
          inputMode="numeric"
          maxLength={i === 0 && autoComplete ? length : 1}
          value={values[i]}
          disabled={disabled}
          id={i === 0 ? id : undefined}
          autoComplete={i === 0 ? autoComplete : undefined}
          aria-label={digitLabel(i + 1)}
          aria-describedby={ariaDescribedBy}
          aria-invalid={ariaInvalid}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={(e) => handlePaste(i, e)}
          className={cn(
            'w-10 h-12 text-center text-lg border rounded-md',
            'bg-background text-foreground border-input',
            'focus:outline-none focus:ring-2 focus:ring-ring',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        />
      ))}
    </div>
  )
}
