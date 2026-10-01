import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Code } from './Code'

describe('Code', () => {
  it('renders its children in a <code> element', () => {
    render(<Code>npm install</Code>)
    expect(screen.getByText('npm install').tagName).toBe('CODE')
  })

  it('uses the code tokens for its background and text', () => {
    render(<Code>npm install</Code>)
    expect(screen.getByText('npm install')).toHaveClass(
      'bg-code-background',
      'text-code-foreground',
      'font-mono',
    )
  })

  it('merges a custom className', () => {
    render(<Code className="custom-code">npm install</Code>)
    expect(screen.getByText('npm install')).toHaveClass('custom-code', 'bg-code-background')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <p>
        Run <Code>npm install</Code> first.
      </p>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
