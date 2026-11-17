import type { AnchorHTMLAttributes } from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Badge } from './Badge'
import type { BadgeProps } from '../../../index'

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

  it('does not wrap text by default (whitespace-nowrap)', () => {
    render(<Badge>Casa e Jardim</Badge>)
    expect(screen.getByText('Casa e Jardim')).toHaveClass('whitespace-nowrap')
  })

  it('lets className override the no-wrap behavior', () => {
    render(<Badge className="whitespace-normal">Casa e Jardim</Badge>)
    const badge = screen.getByText('Casa e Jardim')
    expect(badge).toHaveClass('whitespace-normal')
    expect(badge).not.toHaveClass('whitespace-nowrap')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<Badge>Status</Badge>)
    expect(await axe(container)).toHaveNoViolations()
  })

  describe('as a link', () => {
    function TestLink({
      href,
      children,
      ...props
    }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
      return (
        <a {...props} href={href} data-custom-link="">
          {children}
        </a>
      )
    }

    it('is not a link without href', () => {
      render(<Badge>React</Badge>)
      expect(screen.queryByRole('link')).not.toBeInTheDocument()
    })

    it('renders an anchor with href, keeping variant and size classes', () => {
      render(
        <Badge href="/tags/react" variant="primary" size="sm">
          React
        </Badge>,
      )
      const link = screen.getByRole('link', { name: 'React' })
      expect(link.tagName).toBe('A')
      expect(link).toHaveAttribute('href', '/tags/react')
      expect(link).toHaveClass('bg-primary', 'text-primary-foreground', 'text-xs', 'px-2')
    })

    it.each([
      ['default', 'hover:text-foreground'],
      ['primary', 'hover:bg-primary-hover'],
      ['success', 'hover:bg-success-hover'],
      ['warning', 'hover:bg-warning-hover'],
      ['danger', 'hover:bg-destructive-hover'],
      ['info', 'hover:bg-info-hover'],
    ] as const)('applies the hover class for the %s variant', (variant, hoverClass) => {
      render(
        <Badge href="/tags/react" variant={variant}>
          React
        </Badge>,
      )
      expect(screen.getByRole('link')).toHaveClass(hoverClass)
    })

    it('has a visible keyboard focus ring', () => {
      render(<Badge href="/tags/react">React</Badge>)
      expect(screen.getByRole('link')).toHaveClass(
        'focus-visible:ring-2',
        'focus-visible:ring-ring',
      )
    })

    it('does not add hover or focus classes to the plain span', () => {
      render(<Badge variant="primary">React</Badge>)
      const badge = screen.getByText('React')
      expect(badge).not.toHaveClass('hover:bg-primary-hover')
      expect(badge).not.toHaveClass('focus-visible:ring-2')
    })

    it('renders linkComponent in place of <a>, with href, className and children', () => {
      render(
        <Badge href="/tags/react" linkComponent={TestLink} className="custom-class">
          React
        </Badge>,
      )
      const link = screen.getByRole('link', { name: 'React' })
      expect(link).toHaveAttribute('data-custom-link')
      expect(link).toHaveAttribute('href', '/tags/react')
      expect(link).toHaveClass('bg-muted', 'custom-class')
    })

    it('ignores linkComponent without href', () => {
      render(<Badge linkComponent={TestLink}>React</Badge>)
      expect(screen.queryByRole('link')).not.toBeInTheDocument()
      expect(screen.getByText('React').tagName).toBe('SPAN')
    })

    it('accepts href and linkComponent through the exported BadgeProps', () => {
      const props: BadgeProps = { href: '/tags/react', linkComponent: TestLink, children: 'React' }
      render(<Badge {...props} />)
      expect(screen.getByRole('link', { name: 'React' })).toHaveAttribute('data-custom-link')
    })

    it('has no accessibility violations as a link', async () => {
      const { container } = render(
        <Badge href="/tags/react" linkComponent={TestLink}>
          React
        </Badge>,
      )
      expect(await axe(container)).toHaveNoViolations()
    })
  })
})
