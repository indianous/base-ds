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

  it('applies the destructive text color for color="destructive"', () => {
    render(<Text color="destructive">Hello</Text>)
    // `text-destructive-foreground` is for text on a destructive background: on the page it had
    // the same color as the background, so error messages were invisible.
    expect(screen.getByText('Hello')).toHaveClass('text-destructive')
    expect(screen.getByText('Hello')).not.toHaveClass('text-destructive-foreground')
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

describe('Text lines', () => {
  const longText = 'A long summary that goes on for more lines than the card has room for.'

  it('clamps to the given number of lines', () => {
    render(<Text lines={2}>{longText}</Text>)
    const text = screen.getByText(longText)
    expect(text.style.getPropertyValue('--text-lines')).toBe('2')
    expect(text).toHaveClass('line-clamp-[var(--text-lines)]')
    expect(text).not.toHaveClass('min-h-[calc(var(--text-lines)*1lh)]')
  })

  it('reserves the height of those lines with reserveLines', () => {
    render(
      <Text lines={2} reserveLines>
        Short
      </Text>,
    )
    expect(screen.getByText('Short')).toHaveClass(
      'line-clamp-[var(--text-lines)]',
      'min-h-[calc(var(--text-lines)*1lh)]',
    )
  })

  it('does nothing without lines, even with reserveLines', () => {
    render(<Text reserveLines>{longText}</Text>)
    const text = screen.getByText(longText)
    expect(text.style.getPropertyValue('--text-lines')).toBe('')
    expect(text.className).not.toContain('line-clamp')
    expect(text.className).not.toContain('min-h-')
  })

  it.each([0, -1, 1.5])('ignores lines={%s}', (lines) => {
    render(<Text lines={lines}>{longText}</Text>)
    expect(screen.getByText(longText).className).not.toContain('line-clamp')
  })

  it('keeps a style passed by the app', () => {
    render(
      <Text lines={2} style={{ marginTop: 4 }}>
        {longText}
      </Text>,
    )
    const text = screen.getByText(longText)
    expect(text.style.marginTop).toBe('4px')
    expect(text.style.getPropertyValue('--text-lines')).toBe('2')
  })
})
