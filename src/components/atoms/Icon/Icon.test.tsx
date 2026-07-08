import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Icon } from './Icon'

describe('Icon', () => {
  it('renders without crashing with a known icon name', () => {
    const { container } = render(<Icon name="Search" />)
    expect(container.firstChild).not.toBeNull()
  })

  it('renders an SVG element', () => {
    const { container } = render(<Icon name="Search" />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('applies aria-hidden="true" when no aria-label provided', () => {
    const { container } = render(<Icon name="Search" />)
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('does not apply role="img" when no aria-label provided', () => {
    const { container } = render(<Icon name="Search" />)
    expect(container.querySelector('svg')).not.toHaveAttribute('role', 'img')
  })

  it('applies role="img" when aria-label is provided', () => {
    render(<Icon name="Search" aria-label="Search" />)
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('applies aria-label attribute when provided', () => {
    render(<Icon name="Search" aria-label="Search" />)
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Search')
  })

  it('does not apply aria-hidden when aria-label is provided', () => {
    render(<Icon name="Search" aria-label="Search" />)
    expect(screen.getByRole('img')).not.toHaveAttribute('aria-hidden')
  })

  it('applies w-4 h-4 classes for size="sm"', () => {
    const { container } = render(<Icon name="Search" size="sm" />)
    expect(container.querySelector('svg')).toHaveClass('w-4', 'h-4')
  })

  it('applies w-5 h-5 classes for size="md" (default)', () => {
    const { container } = render(<Icon name="Search" />)
    expect(container.querySelector('svg')).toHaveClass('w-5', 'h-5')
  })

  it('applies w-6 h-6 classes for size="lg"', () => {
    const { container } = render(<Icon name="Search" size="lg" />)
    expect(container.querySelector('svg')).toHaveClass('w-6', 'h-6')
  })

  it('applies w-8 h-8 classes for size="xl"', () => {
    const { container } = render(<Icon name="Search" size="xl" />)
    expect(container.querySelector('svg')).toHaveClass('w-8', 'h-8')
  })

  it('merges custom className', () => {
    const { container } = render(<Icon name="Search" className="text-red-500" />)
    expect(container.querySelector('svg')).toHaveClass('text-red-500')
  })

  it('has no accessibility violations when decorative (aria-hidden)', async () => {
    const { container } = render(<Icon name="Search" />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no accessibility violations when meaningful (aria-label provided)', async () => {
    const { container } = render(<Icon name="Search" aria-label="Search icon" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
