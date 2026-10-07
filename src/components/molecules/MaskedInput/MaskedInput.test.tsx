import { describe, it, expect, vi } from 'vitest'
import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { MaskedInput } from './MaskedInput'
import type { MaskedInputProps } from './MaskedInput'
import { FormField } from '../FormField/FormField'

// Keeps the raw value in state, as an app would with onValueChange.
function Controlled({ initial = '', ...props }: Partial<MaskedInputProps> & { initial?: string }) {
  const [value, setValue] = useState(initial)
  return (
    <MaskedInput
      id="field"
      aria-label="Field"
      mask="cpf"
      {...props}
      value={value}
      onValueChange={(raw, formatted) => {
        setValue(raw)
        props.onValueChange?.(raw, formatted)
      }}
    />
  )
}

const field = () => screen.getByRole('textbox', { name: 'Field' }) as HTMLInputElement

describe('MaskedInput', () => {
  it('formats while typing and reports the raw and formatted values', async () => {
    const onValueChange = vi.fn()
    render(<Controlled onValueChange={onValueChange} />)
    await userEvent.type(field(), '12345678900')
    expect(field()).toHaveValue('123.456.789-00')
    expect(onValueChange).toHaveBeenLastCalledWith('12345678900', '123.456.789-00')
  })

  it.each(['12345678900', '123.456.789-00'])('shows the value %s formatted', (value) => {
    render(<MaskedInput id="cpf" aria-label="Field" mask="cpf" value={value} onChange={() => {}} />)
    expect(field()).toHaveValue('123.456.789-00')
  })

  it('formats a defaultValue when uncontrolled', async () => {
    render(<MaskedInput id="cep" aria-label="Field" mask="cep" defaultValue="01310100" />)
    expect(field()).toHaveValue('01310-100')
  })

  it('switches the phone to 9 digits on the 11th digit', async () => {
    render(<Controlled mask="phone" />)
    await userEvent.type(field(), '1133334444')
    expect(field()).toHaveValue('(11) 3333-4444')
    await userEvent.clear(field())
    await userEvent.type(field(), '11999998888')
    expect(field()).toHaveValue('(11) 99999-8888')
  })

  it('reformats pasted text, formatted or raw', async () => {
    render(<Controlled mask="cep" />)
    field().focus()
    await userEvent.paste('01310-100')
    expect(field()).toHaveValue('01310-100')
    await userEvent.clear(field())
    await userEvent.paste('01310100')
    expect(field()).toHaveValue('01310-100')
  })

  it('keeps the caret in place when typing in the middle', async () => {
    // Not full: at the maxLength of the mask, the browser blocks any insertion.
    render(<Controlled mask="cep" initial="1234567" />)
    await userEvent.type(field(), '9', { initialSelectionStart: 2, initialSelectionEnd: 2 })
    expect(field()).toHaveValue('12934-567')
    expect(field().selectionStart).toBe(3)
  })

  it('deletes the character before a literal on Backspace', async () => {
    render(<Controlled mask="cep" initial="12345678" />)
    await userEvent.type(field(), '{Backspace}', {
      initialSelectionStart: 6,
      initialSelectionEnd: 6,
    })
    expect(field()).toHaveValue('12346-78')
    expect(field().selectionStart).toBe(4)
  })

  it('upper-cases the letters of an alphanumeric CNPJ and uses a text keyboard', async () => {
    render(<Controlled mask="cnpj" />)
    await userEvent.type(field(), '12abc34501de35')
    expect(field()).toHaveValue('12.ABC.345/01DE-35')
    expect(field()).toHaveAttribute('inputmode', 'text')
  })

  it.each([
    ['cpf', 'numeric', '000.000.000-00', 14],
    ['cep', 'numeric', '00000-000', 9],
    ['phone', 'tel', '(00) 00000-0000', 15],
    ['date', 'numeric', '00/00/0000', 10],
  ] as const)(
    'sets the keyboard, placeholder and maxLength of %s',
    (mask, inputMode, placeholder, maxLength) => {
      render(<MaskedInput id="m" aria-label="Field" mask={mask} />)
      expect(field()).toHaveAttribute('inputmode', inputMode)
      expect(field()).toHaveAttribute('placeholder', placeholder)
      expect(field()).toHaveAttribute('maxlength', String(maxLength))
    },
  )

  it('lets the app override the placeholder and the autocomplete', () => {
    render(
      <MaskedInput id="m" aria-label="Field" mask="cep" placeholder="Seu CEP" autoComplete="off" />,
    )
    expect(field()).toHaveAttribute('placeholder', 'Seu CEP')
    expect(field()).toHaveAttribute('autocomplete', 'off')
  })

  it('keeps the native onChange, with the formatted value', async () => {
    const onChange = vi.fn()
    render(<Controlled onChange={(event) => onChange(event.target.value)} />)
    await userEvent.type(field(), '123')
    expect(onChange).toHaveBeenLastCalledWith('123')
    await userEvent.type(field(), '4')
    expect(onChange).toHaveBeenLastCalledWith('123.4')
  })

  it('works inside a FormField', () => {
    render(
      <FormField label="CPF" id="cpf" hint="Só números" error="CPF inválido">
        <MaskedInput id="cpf" mask="cpf" />
      </FormField>,
    )
    const input = screen.getByRole('textbox', { name: 'CPF' })
    expect(input).toHaveAttribute('aria-describedby', 'cpf-error')
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <FormField label="Telefone" id="phone">
        <MaskedInput id="phone" mask="phone" defaultValue="11999998888" />
      </FormField>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
