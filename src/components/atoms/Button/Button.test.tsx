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
    render(
      <Button disabled onClick={onClick}>
        Click
      </Button>,
    )
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('renders leftIcon slot content', () => {
    render(<Button leftIcon={<span data-testid="left-icon">L</span>}>Text</Button>)
    expect(screen.getByTestId('left-icon')).toBeInTheDocument()
  })

  it('renders rightIcon slot content', () => {
    render(<Button rightIcon={<span data-testid="right-icon">R</span>}>Text</Button>)
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
    render(
      <Button isLoading onClick={onClick}>
        Submit
      </Button>,
    )
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<Button>Submit</Button>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  describe('as="a"', () => {
    it('renders an anchor element instead of a button', () => {
      render(
        <Button as="a" href="/docs">
          Docs
        </Button>,
      )
      const link = screen.getByRole('link')
      expect(link.tagName).toBe('A')
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('propagates href to the anchor', () => {
      render(
        <Button as="a" href="/docs">
          Docs
        </Button>,
      )
      expect(screen.getByRole('link')).toHaveAttribute('href', '/docs')
    })

    it('applies the same variant and size classes as the button mode', () => {
      render(
        <Button as="a" href="/docs" variant="secondary" size="lg">
          Docs
        </Button>,
      )
      const link = screen.getByRole('link')
      expect(link).toHaveClass('bg-secondary')
      expect(link).toHaveClass('h-12')
    })

    it('calls onClick when the link is not disabled', async () => {
      const onClick = vi.fn()
      render(
        <Button as="a" href="/docs" onClick={onClick}>
          Docs
        </Button>,
      )
      await userEvent.click(screen.getByRole('link'))
      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('sets aria-disabled and blocks onClick when disabled', async () => {
      const onClick = vi.fn()
      render(
        <Button as="a" href="/docs" disabled onClick={onClick}>
          Docs
        </Button>,
      )
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('aria-disabled', 'true')
      expect(link).not.toHaveAttribute('disabled')
      await userEvent.click(link)
      expect(onClick).not.toHaveBeenCalled()
    })

    it('sets aria-disabled and blocks onClick when isLoading', async () => {
      const onClick = vi.fn()
      render(
        <Button as="a" href="/docs" isLoading onClick={onClick}>
          Docs
        </Button>,
      )
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('aria-disabled', 'true')
      expect(link).toHaveAttribute('aria-busy', 'true')
      await userEvent.click(link)
      expect(onClick).not.toHaveBeenCalled()
    })

    it('shows Spinner when isLoading=true', () => {
      render(
        <Button as="a" href="/docs" isLoading>
          Docs
        </Button>,
      )
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('is not reachable by keyboard tab order when disabled', () => {
      render(
        <Button as="a" href="/docs" disabled>
          Docs
        </Button>,
      )
      expect(screen.getByRole('link')).toHaveAttribute('tabIndex', '-1')
    })

    it('has no accessibility violations', async () => {
      const { container } = render(
        <Button as="a" href="/docs">
          Docs
        </Button>,
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('iconOnly', () => {
    it('applies square h-8/w-8 classes for size="sm"', () => {
      render(
        <Button iconOnly size="sm" aria-label="Remove">
          <span data-testid="icon" />
        </Button>,
      )
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-8')
      expect(button).toHaveClass('w-8')
      expect(button).toHaveClass('p-0')
    })

    it('applies square h-10/w-10 classes for size="md" (default)', () => {
      render(
        <Button iconOnly aria-label="Remove">
          <span data-testid="icon" />
        </Button>,
      )
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-10')
      expect(button).toHaveClass('w-10')
    })

    it('applies square h-12/w-12 classes for size="lg"', () => {
      render(
        <Button iconOnly size="lg" aria-label="Remove">
          <span data-testid="icon" />
        </Button>,
      )
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-12')
      expect(button).toHaveClass('w-12')
    })

    it('does not apply the text-oriented horizontal padding', () => {
      render(
        <Button iconOnly aria-label="Remove">
          <span data-testid="icon" />
        </Button>,
      )
      expect(screen.getByRole('button')).not.toHaveClass('px-4')
    })

    it('works together with variant="ghost"', () => {
      render(
        <Button iconOnly variant="ghost" aria-label="Remove">
          <span data-testid="icon" />
        </Button>,
      )
      expect(screen.getByRole('button')).toHaveClass('bg-transparent')
    })

    it('applies square classes when as="a" too', () => {
      render(
        <Button as="a" href="/docs" iconOnly aria-label="Docs">
          <span data-testid="icon" />
        </Button>,
      )
      const link = screen.getByRole('link')
      expect(link).toHaveClass('h-10')
      expect(link).toHaveClass('w-10')
    })

    it('has no accessibility violations when given an aria-label', async () => {
      const { container } = render(
        <Button iconOnly aria-label="Remove item">
          <span data-testid="icon" />
        </Button>,
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
