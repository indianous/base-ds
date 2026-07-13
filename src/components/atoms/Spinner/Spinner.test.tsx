import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Spinner } from './Spinner'

describe('Spinner', () => {
  it('renders an element with role="status"', () => {
    render(<Spinner />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('has default aria-label "Carregando..."', () => {
    render(<Spinner />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Carregando...')
  })

  it('accepts and applies a custom aria-label', () => {
    render(<Spinner aria-label="Loading data..." />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading data...')
  })

  it('applies w-4 h-4 classes for size="sm"', () => {
    render(<Spinner size="sm" />)
    expect(screen.getByRole('status')).toHaveClass('w-4', 'h-4')
  })

  it('applies w-6 h-6 classes for size="md" (default)', () => {
    render(<Spinner />)
    expect(screen.getByRole('status')).toHaveClass('w-6', 'h-6')
  })

  it('applies w-8 h-8 classes for size="lg"', () => {
    render(<Spinner size="lg" />)
    expect(screen.getByRole('status')).toHaveClass('w-8', 'h-8')
  })

  it('applies animate-spin class', () => {
    render(<Spinner />)
    expect(screen.getByRole('status')).toHaveClass('animate-spin')
  })

  it('merges custom className', () => {
    render(<Spinner className="text-primary" />)
    expect(screen.getByRole('status')).toHaveClass('text-primary')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<Spinner />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
