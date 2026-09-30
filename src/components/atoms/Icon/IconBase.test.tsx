import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { SearchIcon } from 'lucide-react'
import { IconBase } from './IconBase'

describe('IconBase', () => {
  it('renders the given lucide icon as an SVG', () => {
    const { container } = render(<IconBase icon={SearchIcon} />)
    expect(container.querySelector('svg')).toHaveClass('lucide-search')
  })

  it('is decorative (aria-hidden) without aria-label', () => {
    const { container } = render(<IconBase icon={SearchIcon} />)
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('is an img with its aria-label when one is given', () => {
    render(<IconBase icon={SearchIcon} aria-label="Buscar" />)
    const icon = screen.getByRole('img', { name: 'Buscar' })
    expect(icon).not.toHaveAttribute('aria-hidden')
  })

  it('applies the size classes (md by default) and merges className', () => {
    const { container, rerender } = render(<IconBase icon={SearchIcon} className="text-primary" />)
    expect(container.querySelector('svg')).toHaveClass('w-5', 'h-5', 'text-primary')
    rerender(<IconBase icon={SearchIcon} size="sm" />)
    expect(container.querySelector('svg')).toHaveClass('w-4', 'h-4')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<IconBase icon={SearchIcon} aria-label="Buscar" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
