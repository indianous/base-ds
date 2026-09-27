import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { FormField } from '../FormField/FormField'
import { PinInput } from './PinInput'

describe('PinInput', () => {
  it('renders the correct number of inputs (default 4)', () => {
    render(<PinInput />)
    const inputs = screen.getAllByRole('textbox')
    expect(inputs).toHaveLength(4)
  })

  it('renders custom number of inputs when length prop is set', () => {
    render(<PinInput length={6} />)
    const inputs = screen.getAllByRole('textbox')
    expect(inputs).toHaveLength(6)
  })

  it('focuses the next input after entering a digit', async () => {
    const user = userEvent.setup()
    render(<PinInput />)
    const inputs = screen.getAllByRole('textbox')
    await user.click(inputs[0]!)
    await user.type(inputs[0]!, '1')
    expect(document.activeElement).toBe(inputs[1]!)
  })

  it('moves focus to previous input on Backspace when current is empty', async () => {
    const user = userEvent.setup()
    render(<PinInput />)
    const inputs = screen.getAllByRole('textbox')
    await user.click(inputs[1]!)
    await user.keyboard('{Backspace}')
    expect(document.activeElement).toBe(inputs[0]!)
  })

  it('calls onChange with the joined value on input', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<PinInput onChange={onChange} />)
    const inputs = screen.getAllByRole('textbox')
    await user.click(inputs[0]!)
    await user.type(inputs[0]!, '5')
    expect(onChange).toHaveBeenCalledWith('5')
  })

  it('calls onComplete when all inputs are filled', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(<PinInput length={4} onComplete={onComplete} />)
    const inputs = screen.getAllByRole('textbox')
    await user.click(inputs[0]!)
    await user.type(inputs[0]!, '1')
    await user.type(inputs[1]!, '2')
    await user.type(inputs[2]!, '3')
    await user.type(inputs[3]!, '4')
    expect(onComplete).toHaveBeenCalledWith('1234')
  })

  it('distributes pasted text across inputs', async () => {
    const user = userEvent.setup()
    render(<PinInput length={4} />)
    const inputs = screen.getAllByRole('textbox')
    await user.click(inputs[0]!)
    await user.paste('1234')
    expect((inputs[0] as HTMLInputElement).value).toBe('1')
    expect((inputs[1] as HTMLInputElement).value).toBe('2')
    expect((inputs[2] as HTMLInputElement).value).toBe('3')
    expect((inputs[3] as HTMLInputElement).value).toBe('4')
  })

  it('renders inputs as type="password" when mask=true', () => {
    const { container } = render(<PinInput mask={true} />)
    const passwordInputs = container.querySelectorAll('input[type="password"]')
    expect(passwordInputs).toHaveLength(4)
  })

  it('renders inputs as type="text" when mask=false (default)', () => {
    const { container } = render(<PinInput />)
    const textInputs = container.querySelectorAll('input[type="text"]')
    expect(textInputs).toHaveLength(4)
  })

  it('disables all inputs when disabled prop is true', () => {
    render(<PinInput disabled={true} />)
    const inputs = screen.getAllByRole('textbox')
    inputs.forEach((input) => {
      expect(input).toBeDisabled()
    })
  })

  it('uses groupLabel as the group aria-label', () => {
    render(<PinInput groupLabel="Código de verificação" />)
    expect(screen.getByRole('group', { name: 'Código de verificação' })).toBeInTheDocument()
  })

  it('uses digitLabel for each input aria-label', () => {
    render(<PinInput length={6} digitLabel={(n) => `Dígito ${n}`} />)
    const inputs = screen.getAllByRole('textbox')
    inputs.forEach((input, i) => {
      expect(input).toHaveAttribute('aria-label', `Dígito ${i + 1}`)
    })
  })

  it('applies autoComplete only to the first input', () => {
    render(<PinInput autoComplete="one-time-code" />)
    const [first, ...rest] = screen.getAllByRole('textbox')
    expect(first).toHaveAttribute('autocomplete', 'one-time-code')
    rest.forEach((input) => expect(input).not.toHaveAttribute('autocomplete'))
  })

  it('applies id only to the first input', () => {
    const { container } = render(<PinInput id="mfa-code" />)
    expect(container.querySelectorAll('#mfa-code')).toHaveLength(1)
    expect(screen.getAllByRole('textbox')[0]).toHaveAttribute('id', 'mfa-code')
  })

  it('forwards aria-describedby and aria-invalid to every input', () => {
    render(<PinInput aria-describedby="code-error" aria-invalid="true" />)
    screen.getAllByRole('textbox').forEach((input) => {
      expect(input).toHaveAttribute('aria-describedby', 'code-error')
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })
  })

  it('distributes a multi-digit value set on an empty input (autofill)', () => {
    const onComplete = vi.fn()
    render(<PinInput length={6} autoComplete="one-time-code" onComplete={onComplete} />)
    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[]
    fireEvent.change(inputs[0]!, { target: { value: '123456' } })
    expect(inputs.map((input) => input.value)).toEqual(['1', '2', '3', '4', '5', '6'])
    expect(onComplete).toHaveBeenCalledWith('123456')
  })

  it('integrates with FormField: label focuses the first input and hint/error are linked', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <FormField
        label="Código"
        id="mfa-code"
        hint="Veja o app autenticador"
        error="Código inválido"
      >
        <PinInput groupLabel="Código" />
      </FormField>,
    )
    await user.click(screen.getByText('Código', { selector: 'label' }))
    const inputs = screen.getAllByRole('textbox')
    expect(document.activeElement).toBe(inputs[0])
    inputs.forEach((input) => {
      expect(input).toHaveAttribute('aria-describedby', 'mfa-code-error')
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<PinInput />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
