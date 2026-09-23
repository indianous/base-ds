import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Container } from './Container'

describe('Container', () => {
  it('renders a <div> by default without creating a landmark', () => {
    render(<Container>Content</Container>)
    expect(screen.getByText('Content').tagName).toBe('DIV')
    expect(screen.queryByRole('main')).not.toBeInTheDocument()
  })

  it.each(['main', 'section', 'article'] as const)('renders as <%s> when as="%s"', (as) => {
    render(<Container as={as}>Content</Container>)
    expect(screen.getByText('Content').tagName).toBe(as.toUpperCase())
  })

  it('applies the centering, gutter and default width/spacing classes', () => {
    render(<Container>Content</Container>)
    expect(screen.getByText('Content')).toHaveClass(
      'mx-auto',
      'w-full',
      'px-4',
      'max-w-5xl',
      'py-8',
    )
  })

  it.each([
    ['sm', 'max-w-sm'],
    ['md', 'max-w-md'],
    ['lg', 'max-w-lg'],
    ['xl', 'max-w-xl'],
    ['2xl', 'max-w-2xl'],
    ['3xl', 'max-w-3xl'],
    ['4xl', 'max-w-4xl'],
    ['5xl', 'max-w-5xl'],
    ['7xl', 'max-w-7xl'],
  ] as const)('applies %s width as %s', (width, expectedClass) => {
    render(<Container width={width}>Content</Container>)
    expect(screen.getByText('Content')).toHaveClass(expectedClass)
  })

  it.each([
    ['default', 'py-8'],
    ['relaxed', 'py-12'],
    ['loose', 'py-16'],
  ] as const)('applies %s spacing as %s', (spacing, expectedClass) => {
    render(<Container spacing={spacing}>Content</Container>)
    expect(screen.getByText('Content')).toHaveClass(expectedClass)
  })

  it('merges a custom className with the base classes', () => {
    render(<Container className="flex flex-col gap-4">Content</Container>)
    expect(screen.getByText('Content')).toHaveClass('flex', 'flex-col', 'gap-4', 'mx-auto', 'px-4')
  })

  it('lets className override the default padding', () => {
    render(<Container className="py-0">Content</Container>)
    const container = screen.getByText('Content')
    expect(container).toHaveClass('py-0')
    expect(container).not.toHaveClass('py-8')
  })

  it('forwards HTML attributes', () => {
    render(
      <Container role="status" aria-label="Loading orders" id="orders" data-testid="container">
        Content
      </Container>,
    )
    const container = screen.getByRole('status', { name: 'Loading orders' })
    expect(container).toHaveAttribute('id', 'orders')
    expect(container).toHaveAttribute('data-testid', 'container')
  })

  it('renders its children', () => {
    render(
      <Container>
        <h1>Orders</h1>
        <p>List of orders</p>
      </Container>,
    )
    expect(screen.getByRole('heading', { name: 'Orders' })).toBeInTheDocument()
    expect(screen.getByText('List of orders')).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Container>
        <h1>Orders</h1>
      </Container>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no accessibility violations as a loading status region', async () => {
    const { container } = render(
      <Container role="status" aria-label="Loading orders">
        Loading...
      </Container>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
