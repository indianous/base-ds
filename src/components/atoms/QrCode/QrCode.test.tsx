import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { QrCode } from './QrCode'

vi.mock('qrcode', () => ({
  default: {
    toCanvas: vi.fn().mockResolvedValue(undefined),
  },
}))

describe('QrCode', () => {
  it('renders a canvas element', () => {
    render(<QrCode value="https://example.com" />)
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('canvas has role="img"', () => {
    const { container } = render(<QrCode value="test" />)
    expect(container.querySelector('canvas')).toHaveAttribute('role', 'img')
  })

  it('has aria-label containing the value', () => {
    render(<QrCode value="https://example.com" />)
    expect(screen.getByRole('img')).toHaveAttribute(
      'aria-label',
      expect.stringContaining('https://example.com'),
    )
  })

  it('applies default size 128', () => {
    const { container } = render(<QrCode value="test" />)
    const canvas = container.querySelector('canvas')!
    expect(canvas).toHaveAttribute('width', '128')
    expect(canvas).toHaveAttribute('height', '128')
  })

  it('applies custom size', () => {
    const { container } = render(<QrCode value="test" size={256} />)
    const canvas = container.querySelector('canvas')!
    expect(canvas).toHaveAttribute('width', '256')
  })

  it('applies custom className', () => {
    const { container } = render(<QrCode value="test" className="rounded-md" />)
    expect(container.querySelector('canvas')).toHaveClass('rounded-md')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<QrCode value="https://example.com" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
