import { useState } from 'react'
import type { ChangeEvent, KeyboardEvent } from 'react'
import { Input } from '../../atoms/Input/Input'
import type { InputProps } from '../../atoms/Input/Input'
import { caretAfter, formatMasked, maskInputProps, unmask } from '../../../masks/mask'
import type { Mask } from '../../../masks/mask'

export interface MaskedInputProps extends Omit<InputProps, 'value' | 'defaultValue'> {
  /** A built-in mask (`cpf`, `cnpj`, `cep`, `phone`, `date`) or a pattern (`0` digit, `A` letter, `*` either). */
  mask: Mask
  /** Raw or formatted: it's shown formatted. */
  value?: string
  defaultValue?: string
  /** Called on every change with the raw value (only the characters of the slots) and the formatted one. */
  onValueChange?: (raw: string, formatted: string) => void
}

const isSignificant = (char: string | undefined) => char !== undefined && /[a-zA-Z0-9]/.test(char)

/**
 * `Input` with a mask (issue #64): shows the value formatted, reports it raw through
 * `onValueChange`, keeps the caret in place while editing and works inside `FormField` like `Input`.
 */
export function MaskedInput({
  mask,
  value,
  defaultValue,
  onValueChange,
  onChange,
  onKeyDown,
  inputMode,
  autoComplete,
  maxLength,
  placeholder,
  ...props
}: MaskedInputProps) {
  const [uncontrolled, setUncontrolled] = useState(() => formatMasked(defaultValue ?? '', mask))
  const display = value !== undefined ? formatMasked(value, mask) : uncontrolled
  const defaults = maskInputProps(mask)
  const resolvedAutoComplete = autoComplete ?? defaults.autoComplete

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget
    const typed = input.value
    const caret = input.selectionStart ?? typed.length
    // Significant characters before the caret: the caret goes back right after as many of them.
    const before = unmask(typed.slice(0, caret), mask).length
    const formatted = formatMasked(typed, mask)

    // The native onChange sees the formatted value; the caret is placed right away, since React
    // may not render again when the formatted value didn't change (a letter typed in a CPF).
    input.value = formatted
    if (document.activeElement === input) {
      const position = caretAfter(formatted, mask, before)
      input.setSelectionRange(position, position)
    }

    if (value === undefined) setUncontrolled(formatted)
    onChange?.(event)
    onValueChange?.(unmask(formatted, mask), formatted)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    onKeyDown?.(event)
    if (event.defaultPrevented || event.key !== 'Backspace') return
    const input = event.currentTarget
    const { selectionStart: start, selectionEnd: end, value: current } = input
    if (start === null || start !== end || isSignificant(current[start - 1])) return
    // Backspace right after a literal (the "-" of a CEP) would delete only the literal, which the
    // mask puts back: move the caret before the literals so the browser deletes the character.
    let position = start
    while (position > 0 && !isSignificant(current[position - 1])) position--
    if (position > 0) input.setSelectionRange(position, position)
  }

  return (
    <Input
      {...props}
      inputMode={inputMode ?? defaults.inputMode}
      maxLength={maxLength ?? defaults.maxLength}
      placeholder={placeholder ?? defaults.placeholder}
      {...(resolvedAutoComplete !== undefined && { autoComplete: resolvedAutoComplete })}
      value={display}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
    />
  )
}

export type { Mask, MaskName } from '../../../masks/mask'
