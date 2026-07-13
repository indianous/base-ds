import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Text } from './Text'

describe('Text', () => {
  it('renders as <p> by default', () => {
    render(<Text>Hello</Text>)
    expect(screen.getByText('Hello').tagName).toBe('P')
  })

  it('renders as <span> when as="span"', () => {
    render(<Text as="span">Hello</Text>)
    expect(screen.getByText('Hello').tagName).toBe('SPAN')
  })

  it('renders as <label> when as="label"', () => {
    render(<Text as="label">Hello</Text>)
    expect(screen.getByText('Hello').tagName).toBe('LABEL')
  })

  it('applies text-xs class for size="xs"', () => {
    render(<Text size="xs">Hello</Text>)
    expect(screen.getByText('Hello')).toHaveClass('text-xs')
  })

  it('applies text-base class for default size (md)', () => {
    render(<Text>Hello</Text>)
    expect(screen.getByText('Hello')).toHaveClass('text-base')
  })

  it('applies text-lg class for size="lg"', () => {
    render(<Text size="lg">Hello</Text>)
    expect(screen.getByText('Hello')).toHaveClass('text-lg')
  })

  it('applies text-foreground class for default color', () => {
    render(<Text>Hello</Text>)
    expect(screen.getByText('Hello')).toHaveClass('text-foreground')
  })

  it('applies text-muted-foreground class for color="muted"', () => {
    render(<Text color="muted">Hello</Text>)
    expect(screen.getByText('Hello')).toHaveClass('text-muted-foreground')
  })

  it('applies text-destructive-foreground class for color="destructive"', () => {
    render(<Text color="destructive">Hello</Text>)
    expect(screen.getByText('Hello')).toHaveClass('text-destructive-foreground')
  })

  it('applies font-normal by default', () => {
    render(<Text>Hello</Text>)
    expect(screen.getByText('Hello')).toHaveClass('font-normal')
  })

  it('applies font-semibold for weight="semibold"', () => {
    render(<Text weight="semibold">Hello</Text>)
    expect(screen.getByText('Hello')).toHaveClass('font-semibold')
  })

  it('merges custom className', () => {
    render(<Text className="uppercase">Hello</Text>)
    expect(screen.getByText('Hello')).toHaveClass('uppercase')
  })

  it('renders children content', () => {
    render(<Text>Sample text content</Text>)
    expect(screen.getByText('Sample text content')).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<Text>Accessible text</Text>)
    expect(await axe(container)).toHaveNoViolations()
  })
})
