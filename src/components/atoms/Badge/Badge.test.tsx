import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Badge } from './Badge'

describe('Badge', () => {
  it('renders children text', () => {
    render(<Badge>Label</Badge>)
    expect(screen.getByText('Label')).toBeInTheDocument()
  })

  it('renders as a span element', () => {
    render(<Badge>Label</Badge>)
    expect(screen.getByText('Label').tagName).toBe('SPAN')
  })

  it('applies bg-muted and text-muted-foreground for default variant', () => {
    render(<Badge variant="default">Label</Badge>)
    expect(screen.getByText('Label')).toHaveClass('bg-muted', 'text-muted-foreground')
  })

  it('applies bg-primary and text-primary-foreground for primary variant', () => {
    render(<Badge variant="primary">Label</Badge>)
    expect(screen.getByText('Label')).toHaveClass('bg-primary', 'text-primary-foreground')
  })

  it('applies bg-success and text-success-foreground for success variant', () => {
    render(<Badge variant="success">Label</Badge>)
    expect(screen.getByText('Label')).toHaveClass('bg-success', 'text-success-foreground')
  })

  it('applies bg-warning and text-warning-foreground for warning variant', () => {
    render(<Badge variant="warning">Label</Badge>)
    expect(screen.getByText('Label')).toHaveClass('bg-warning', 'text-warning-foreground')
  })

  it('applies bg-destructive and text-destructive-foreground for danger variant', () => {
    render(<Badge variant="danger">Label</Badge>)
    expect(screen.getByText('Label')).toHaveClass('bg-destructive', 'text-destructive-foreground')
  })

  it('applies bg-info and text-info-foreground for info variant', () => {
    render(<Badge variant="info">Label</Badge>)
    expect(screen.getByText('Label')).toHaveClass('bg-info', 'text-info-foreground')
  })

  it('applies sm size classes (text-xs, px-2) for size="sm"', () => {
    render(<Badge size="sm">Label</Badge>)
    expect(screen.getByText('Label')).toHaveClass('text-xs', 'px-2')
  })

  it('applies md size classes (text-sm, px-3) for size="md" (default)', () => {
    render(<Badge>Label</Badge>)
    expect(screen.getByText('Label')).toHaveClass('text-sm', 'px-3')
  })

  it('merges custom className', () => {
    render(<Badge className="custom-class">Label</Badge>)
    expect(screen.getByText('Label')).toHaveClass('custom-class')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<Badge>Status</Badge>)
    expect(await axe(container)).toHaveNoViolations()
  })
})
