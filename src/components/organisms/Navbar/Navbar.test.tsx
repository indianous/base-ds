import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { Navbar } from './Navbar'

describe('Navbar', () => {
  it('renders with role="navigation" and aria-label="Main navigation"', () => {
    render(<Navbar />)
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument()
  })

  it('renders logo slot when provided', () => {
    render(<Navbar logo={<span data-testid="logo">BrandLogo</span>} />)
    expect(screen.getByTestId('logo')).toBeInTheDocument()
  })

  it('renders nav items', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'About', href: '/about' },
    ]
    render(<Navbar items={items} />)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
  })

  it('item with active=true has aria-current="page"', () => {
    const items = [
      { label: 'Home', href: '/', active: true },
      { label: 'About', href: '/about' },
    ]
    render(<Navbar items={items} />)
    expect(screen.getByText('Home')).toHaveAttribute('aria-current', 'page')
    expect(screen.getByText('About')).not.toHaveAttribute('aria-current', 'page')
  })

  it('item with href renders as an anchor tag', () => {
    const items = [{ label: 'Docs', href: '/docs' }]
    render(<Navbar items={items} />)
    const link = screen.getByRole('link', { name: 'Docs' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/docs')
  })

  it('item with onClick (no href) renders as a button', () => {
    const items = [{ label: 'Settings', onClick: vi.fn() }]
    render(<Navbar items={items} />)
    expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument()
  })

  it('calls item onClick when clicked', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    const items = [{ label: 'Profile', onClick: handleClick }]
    render(<Navbar items={items} />)
    await user.click(screen.getByRole('button', { name: 'Profile' }))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('renders actions slot when provided', () => {
    render(<Navbar actions={<button data-testid="action-btn">Login</button>} />)
    expect(screen.getByTestId('action-btn')).toBeInTheDocument()
  })

  it('sticky prop adds sticky positioning class', () => {
    const { container } = render(<Navbar sticky />)
    const header = container.querySelector('header')
    expect(header).toHaveClass('sticky')
    expect(header).toHaveClass('top-0')
    expect(header).toHaveClass('z-50')
  })

  it('has no accessibility violations', async () => {
    const items = [
      { label: 'Home', href: '/', active: true },
      { label: 'About', href: '/about' },
    ]
    const { container } = render(
      <Navbar
        logo={<span>Brand</span>}
        items={items}
        actions={<button>Login</button>}
      />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
