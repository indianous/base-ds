import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Card } from './Card'

describe('Card', () => {
  it('renders children content', () => {
    render(<Card>Hello Card</Card>)
    expect(screen.getByText('Hello Card')).toBeInTheDocument()
  })

  it('renders header slot when provided', () => {
    render(<Card header={<span>Card Header</span>}>Body</Card>)
    expect(screen.getByText('Card Header')).toBeInTheDocument()
  })

  it('does not render header when not provided', () => {
    const { container } = render(<Card>Body</Card>)
    // No header div — the first child of the root should be the content div
    const root = container.firstElementChild!
    expect(root.children).toHaveLength(1)
  })

  it('renders footer slot when provided', () => {
    render(<Card footer={<span>Card Footer</span>}>Body</Card>)
    expect(screen.getByText('Card Footer')).toBeInTheDocument()
  })

  it('does not render footer when not provided', () => {
    const { container } = render(<Card>Body</Card>)
    const root = container.firstElementChild!
    expect(root.children).toHaveLength(1)
  })

  it('applies elevated variant styles (has shadow)', () => {
    const { container } = render(<Card variant="elevated">Body</Card>)
    const root = container.firstElementChild!
    expect(root.className).toContain('shadow-md')
  })

  it('applies outlined variant styles (has border)', () => {
    const { container } = render(<Card variant="outlined">Body</Card>)
    const root = container.firstElementChild!
    expect(root.className).toContain('border')
    expect(root.className).toContain('border-border')
  })

  it('flat variant has no shadow (default)', () => {
    const { container } = render(<Card>Body</Card>)
    const root = container.firstElementChild!
    expect(root.className).not.toContain('shadow')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Card header={<span>Header</span>} footer={<span>Footer</span>}>
        Content
      </Card>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
