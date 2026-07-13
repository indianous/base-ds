import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
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

  it('has no accessibility violations', async () => {
    const { container } = render(<PinInput />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
