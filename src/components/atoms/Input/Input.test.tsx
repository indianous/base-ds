import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Input } from './Input'

describe('Input', () => {
  it('renders an input element', () => {
    render(<Input id="test" />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('applies the required id attribute', () => {
    render(<Input id="my-input" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('id', 'my-input')
  })

  it('renders with type="text" by default', () => {
    render(<Input id="test" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text')
  })

  it('renders with type="email" when type prop is passed', () => {
    render(<Input id="test" type="email" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email')
  })

  it('renders with type="password" when type prop is passed', () => {
    const { container } = render(<Input id="test" type="password" />)
    expect(container.querySelector('input[type="password"]')).toBeInTheDocument()
  })

  it('applies h-10 for default size (md)', () => {
    render(<Input id="test" />)
    expect(screen.getByRole('textbox')).toHaveClass('h-10')
  })

  it('applies h-8 for size="sm"', () => {
    render(<Input id="test" size="sm" />)
    expect(screen.getByRole('textbox')).toHaveClass('h-8')
  })

  it('applies h-12 for size="lg"', () => {
    render(<Input id="test" size="lg" />)
    expect(screen.getByRole('textbox')).toHaveClass('h-12')
  })

  it('applies border-input class for default state', () => {
    render(<Input id="test" />)
    expect(screen.getByRole('textbox')).toHaveClass('border-input')
  })

  it('applies border-destructive class for state="error"', () => {
    render(<Input id="test" state="error" />)
    expect(screen.getByRole('textbox')).toHaveClass('border-destructive')
  })

  it('applies border-success class for state="success"', () => {
    render(<Input id="test" state="success" />)
    expect(screen.getByRole('textbox')).toHaveClass('border-success')
  })

  it('sets aria-invalid="true" when state="error"', () => {
    render(<Input id="test" state="error" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('does not set aria-invalid when state="default"', () => {
    render(<Input id="test" state="default" />)
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid', 'true')
  })

  it('is disabled when disabled prop is passed', () => {
    render(<Input id="test" disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('forwards placeholder prop to input', () => {
    render(<Input id="test" placeholder="Enter text here" />)
    expect(screen.getByPlaceholderText('Enter text here')).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<Input id="name" aria-label="Name" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
