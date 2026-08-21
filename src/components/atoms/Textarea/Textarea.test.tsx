import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { Textarea } from './Textarea'

describe('Textarea', () => {
  it('renders a textarea element', () => {
    render(<Textarea id="test" />)
    expect(screen.getByRole('textbox').tagName).toBe('TEXTAREA')
  })

  it('applies the required id attribute', () => {
    render(<Textarea id="my-textarea" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('id', 'my-textarea')
  })

  it('applies min-h-[6rem] for default size (md)', () => {
    render(<Textarea id="test" />)
    expect(screen.getByRole('textbox')).toHaveClass('min-h-[6rem]')
  })

  it('applies min-h-[4.5rem] for size="sm"', () => {
    render(<Textarea id="test" size="sm" />)
    expect(screen.getByRole('textbox')).toHaveClass('min-h-[4.5rem]')
  })

  it('applies min-h-[8rem] for size="lg"', () => {
    render(<Textarea id="test" size="lg" />)
    expect(screen.getByRole('textbox')).toHaveClass('min-h-[8rem]')
  })

  it('applies border-input class for default state', () => {
    render(<Textarea id="test" />)
    expect(screen.getByRole('textbox')).toHaveClass('border-input')
  })

  it('applies border-destructive class for state="error"', () => {
    render(<Textarea id="test" state="error" />)
    expect(screen.getByRole('textbox')).toHaveClass('border-destructive')
  })

  it('applies border-success class for state="success"', () => {
    render(<Textarea id="test" state="success" />)
    expect(screen.getByRole('textbox')).toHaveClass('border-success')
  })

  it('sets aria-invalid="true" when state="error"', () => {
    render(<Textarea id="test" state="error" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('does not set aria-invalid when state="default"', () => {
    render(<Textarea id="test" state="default" />)
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid', 'true')
  })

  it('is disabled when disabled prop is passed', () => {
    render(<Textarea id="test" disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('forwards placeholder prop to textarea', () => {
    render(<Textarea id="test" placeholder="Enter text here" />)
    expect(screen.getByPlaceholderText('Enter text here')).toBeInTheDocument()
  })

  it('accepts typed input from the user', async () => {
    render(<Textarea id="test" />)
    const textarea = screen.getByRole('textbox')
    await userEvent.type(textarea, 'Hello world')
    expect(textarea).toHaveValue('Hello world')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<Textarea id="notes" aria-label="Notes" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
