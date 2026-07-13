import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Skeleton } from './Skeleton'

describe('Skeleton', () => {
  it('renders with aria-hidden="true"', () => {
    const { container } = render(<Skeleton />)
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
  })

  it('applies bg-muted and animate-pulse base classes', () => {
    const { container } = render(<Skeleton />)
    expect(container.firstChild).toHaveClass('bg-muted', 'animate-pulse')
  })

  it('applies rounded-md for default rect variant', () => {
    const { container } = render(<Skeleton />)
    expect(container.firstChild).toHaveClass('rounded-md')
  })

  it('applies rounded-md for line variant', () => {
    const { container } = render(<Skeleton variant="line" />)
    expect(container.firstChild).toHaveClass('rounded-md')
  })

  it('applies rounded-full for circle variant', () => {
    const { container } = render(<Skeleton variant="circle" />)
    expect(container.firstChild).toHaveClass('rounded-full')
  })

  it('applies width as inline style (string value)', () => {
    const { container } = render(<Skeleton width="100%" />)
    expect(container.firstChild).toHaveStyle({ width: '100%' })
  })

  it('applies height as inline style (string value)', () => {
    const { container } = render(<Skeleton height="2rem" />)
    expect(container.firstChild).toHaveStyle({ height: '2rem' })
  })

  it('converts numeric width to px string in inline style', () => {
    const { container } = render(<Skeleton width={200} />)
    expect(container.firstChild).toHaveStyle({ width: '200px' })
  })

  it('converts numeric height to px string in inline style', () => {
    const { container } = render(<Skeleton height={20} />)
    expect(container.firstChild).toHaveStyle({ height: '20px' })
  })

  it('merges custom className', () => {
    const { container } = render(<Skeleton className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('has no accessibility violations (aria-hidden makes it invisible to AT)', async () => {
    const { container } = render(<Skeleton width={200} height={20} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('spreads rest props onto the div element', () => {
    const { container } = render(<Skeleton data-testid="skeleton-test" />)
    expect(container.firstChild).toHaveAttribute('data-testid', 'skeleton-test')
  })
})
