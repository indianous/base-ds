import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Avatar } from './Avatar'

describe('Avatar', () => {
  it('renders an img element when src is provided', () => {
    render(<Avatar src="https://example.com/photo.jpg" alt="User" />)
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('img has correct src attribute', () => {
    render(<Avatar src="https://example.com/photo.jpg" alt="User" />)
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.com/photo.jpg')
  })

  it('img has correct alt attribute', () => {
    render(<Avatar src="https://example.com/photo.jpg" alt="John Doe" />)
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'John Doe')
  })

  it('renders fallback text when no src provided', () => {
    render(<Avatar alt="John Doe" fallback="JD" />)
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('renders fallback text when image fails to load', () => {
    render(<Avatar src="https://example.com/broken.jpg" alt="John Doe" fallback="JD" />)
    const img = screen.getByRole('img')
    fireEvent.error(img)
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('applies w-8 h-8 for size="sm"', () => {
    const { container } = render(<Avatar alt="User" size="sm" fallback="U" />)
    expect(container.firstChild).toHaveClass('w-8', 'h-8')
  })

  it('applies w-10 h-10 for size="md" (default)', () => {
    const { container } = render(<Avatar alt="User" fallback="U" />)
    expect(container.firstChild).toHaveClass('w-10', 'h-10')
  })

  it('applies w-12 h-12 for size="lg"', () => {
    const { container } = render(<Avatar alt="User" size="lg" fallback="U" />)
    expect(container.firstChild).toHaveClass('w-12', 'h-12')
  })

  it('applies w-16 h-16 for size="xl"', () => {
    const { container } = render(<Avatar alt="User" size="xl" fallback="U" />)
    expect(container.firstChild).toHaveClass('w-16', 'h-16')
  })

  it('applies rounded-full for shape="circle" (default)', () => {
    const { container } = render(<Avatar alt="User" fallback="U" />)
    expect(container.firstChild).toHaveClass('rounded-full')
  })

  it('applies rounded-md for shape="square"', () => {
    const { container } = render(<Avatar alt="User" shape="square" fallback="U" />)
    expect(container.firstChild).toHaveClass('rounded-md')
  })

  it('merges custom className', () => {
    const { container } = render(<Avatar alt="User" fallback="U" className="border-2" />)
    expect(container.firstChild).toHaveClass('border-2')
  })

  it('has no accessibility violations (with src and alt)', async () => {
    const { container } = render(
      <Avatar src="https://example.com/photo.jpg" alt="John Doe" />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('has no accessibility violations (without src, with fallback)', async () => {
    const { container } = render(<Avatar alt="John Doe" fallback="JD" />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
