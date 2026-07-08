import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { Button } from './Button'

describe('Button', () => {
  it('renders a button element', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('renders children text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('applies bg-primary class for default variant (primary)', () => {
    render(<Button>Submit</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-primary')
  })

  it('applies bg-secondary class for variant="secondary"', () => {
    render(<Button variant="secondary">Submit</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-secondary')
  })

  it('applies bg-transparent class for variant="ghost"', () => {
    render(<Button variant="ghost">Submit</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-transparent')
  })

  it('applies border and bg-transparent for variant="outline"', () => {
    render(<Button variant="outline">Submit</Button>)
    const btn = screen.getByRole('button')
    expect(btn).toHaveClass('border')
    expect(btn).toHaveClass('bg-transparent')
  })

  it('applies bg-destructive class for variant="danger"', () => {
    render(<Button variant="danger">Submit</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-destructive')
  })

  it('applies h-8 class for size="sm"', () => {
    render(<Button size="sm">Submit</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-8')
  })

  it('applies h-10 class for size="md" (default)', () => {
    render(<Button>Submit</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-10')
  })

  it('applies h-12 class for size="lg"', () => {
    render(<Button size="lg">Submit</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-12')
  })

  it('calls onClick when button is clicked', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('does not call onClick when button is disabled', async () => {
    const onClick = vi.fn()
    render(<Button disabled onClick={onClick}>Click</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('renders leftIcon slot content', () => {
    render(
      <Button leftIcon={<span data-testid="left-icon">L</span>}>Text</Button>,
    )
    expect(screen.getByTestId('left-icon')).toBeInTheDocument()
  })

  it('renders rightIcon slot content', () => {
    render(
      <Button rightIcon={<span data-testid="right-icon">R</span>}>Text</Button>,
    )
    expect(screen.getByTestId('right-icon')).toBeInTheDocument()
  })

  it('shows Spinner when isLoading=true', () => {
    render(<Button isLoading>Submit</Button>)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('button has aria-busy="true" when isLoading=true', () => {
    render(<Button isLoading>Submit</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true')
  })

  it('button is disabled when isLoading=true', () => {
    render(<Button isLoading>Submit</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('does not call onClick when isLoading=true', async () => {
    const onClick = vi.fn()
    render(<Button isLoading onClick={onClick}>Submit</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<Button>Submit</Button>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
