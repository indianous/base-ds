import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { codeToHtml, createCssVariablesTheme } from 'shiki'
import { CodeBlock } from './CodeBlock'

const baseDsTheme = createCssVariablesTheme({
  name: 'base-ds',
  variablePrefix: '--color-code-',
  fontStyle: true,
})

const highlight = (code: string) => codeToHtml(code, { lang: 'ts', theme: baseDsTheme })

describe('CodeBlock', () => {
  it('renders plain children in <pre><code>', () => {
    render(<CodeBlock>{'const answer = 42'}</CodeBlock>)
    const code = screen.getByText('const answer = 42')
    expect(code.tagName).toBe('CODE')
    expect(code.parentElement?.tagName).toBe('PRE')
  })

  it('makes the scrollable <pre> reachable by keyboard', () => {
    render(<CodeBlock>{'const answer = 42'}</CodeBlock>)
    expect(screen.getByText('const answer = 42').parentElement).toHaveAttribute('tabindex', '0')
  })

  it('is a figure named "Code" by default', () => {
    render(<CodeBlock>{'const answer = 42'}</CodeBlock>)
    expect(screen.getByRole('figure', { name: 'Code' })).toBeInTheDocument()
  })

  it('uses label for the accessible name', () => {
    render(<CodeBlock label="Código de exemplo">{'const answer = 42'}</CodeBlock>)
    expect(screen.getByRole('figure', { name: 'Código de exemplo' })).toBeInTheDocument()
  })

  it('shows language in a header and in data-language', () => {
    render(<CodeBlock language="TypeScript">{'const answer = 42'}</CodeBlock>)
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
    expect(screen.getByRole('figure')).toHaveAttribute('data-language', 'TypeScript')
  })

  it('renders the HTML of a highlighter, using the code tokens', async () => {
    const html = await highlight('const answer = 42')
    const { container } = render(<CodeBlock html={html} language="TypeScript" />)
    const pre = container.querySelector('figure pre.shiki')
    expect(pre).toBeInTheDocument()
    expect(pre?.getAttribute('style')).toContain('var(--color-code-background)')
    expect(pre?.innerHTML).toContain('var(--color-code-token-keyword)')
  })

  it('merges a custom className', () => {
    render(<CodeBlock className="custom-block">{'x'}</CodeBlock>)
    expect(screen.getByRole('figure')).toHaveClass('custom-block', 'bg-code-background')
  })

  it('has no accessibility violations with plain children', async () => {
    const { container } = render(<CodeBlock language="Bash">{'npm install'}</CodeBlock>)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no accessibility violations with highlighted HTML', async () => {
    const html = await highlight('export const answer: number = 42 // the answer')
    const { container } = render(<CodeBlock html={html} language="TypeScript" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
