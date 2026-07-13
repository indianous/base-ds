import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { NumberInput } from './NumberInput'

describe('NumberInput', () => {
  it('renders an input of type number', () => {
    render(<NumberInput id="test" />)
    expect(screen.getByRole('spinbutton')).toBeInTheDocument()
  })

  it('renders decrement and increment buttons', () => {
    render(<NumberInput id="test" />)
    expect(screen.getByRole('button', { name: /decrement/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /increment/i })).toBeInTheDocument()
  })

  it('displays the initial value', () => {
    render(<NumberInput id="test" defaultValue={5} />)
    expect(screen.getByRole('spinbutton')).toHaveValue(5)
  })

  it('increments value when + button is clicked', async () => {
    render(<NumberInput id="test" defaultValue={3} step={1} />)
    await userEvent.click(screen.getByRole('button', { name: /increment/i }))
    expect(screen.getByRole('spinbutton')).toHaveValue(4)
  })

  it('decrements value when − button is clicked', async () => {
    render(<NumberInput id="test" defaultValue={3} step={1} />)
    await userEvent.click(screen.getByRole('button', { name: /decrement/i }))
    expect(screen.getByRole('spinbutton')).toHaveValue(2)
  })

  it('does not go below min when decrement is clicked at min', async () => {
    render(<NumberInput id="test" defaultValue={0} min={0} />)
    await userEvent.click(screen.getByRole('button', { name: /decrement/i }))
    expect(screen.getByRole('spinbutton')).toHaveValue(0)
  })

  it('does not go above max when increment is clicked at max', async () => {
    render(<NumberInput id="test" defaultValue={10} max={10} />)
    await userEvent.click(screen.getByRole('button', { name: /increment/i }))
    expect(screen.getByRole('spinbutton')).toHaveValue(10)
  })

  it('decrement button is disabled when value equals min', () => {
    render(<NumberInput id="test" value={0} min={0} onChange={() => {}} />)
    expect(screen.getByRole('button', { name: /decrement/i })).toBeDisabled()
  })

  it('increment button is disabled when value equals max', () => {
    render(<NumberInput id="test" value={10} max={10} onChange={() => {}} />)
    expect(screen.getByRole('button', { name: /increment/i })).toBeDisabled()
  })

  it('both buttons are disabled when disabled prop is true', () => {
    render(<NumberInput id="test" disabled />)
    expect(screen.getByRole('button', { name: /decrement/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /increment/i })).toBeDisabled()
  })

  it('calls onChange with new value on increment', async () => {
    const onChange = vi.fn()
    render(<NumberInput id="test" defaultValue={2} onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: /increment/i }))
    expect(onChange).toHaveBeenCalledWith(3)
  })

  it('calls onChange with new value on decrement', async () => {
    const onChange = vi.fn()
    render(<NumberInput id="test" defaultValue={2} onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: /decrement/i }))
    expect(onChange).toHaveBeenCalledWith(1)
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <label htmlFor="qty">Quantity</label>
        <NumberInput id="qty" />
      </div>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
