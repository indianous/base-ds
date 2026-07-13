import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { Sidebar } from './Sidebar'

const defaultItems = [
  { label: 'Home', href: '/' },
  { label: 'Settings', href: '/settings' },
  { label: 'Profile', onClick: vi.fn() },
]

describe('Sidebar', () => {
  it('renders with role="navigation" and aria-label="Sidebar navigation"', () => {
    render(<Sidebar items={defaultItems} />)
    expect(screen.getByRole('navigation', { name: 'Sidebar navigation' })).toBeInTheDocument()
  })

  it('renders all item labels when expanded', () => {
    render(<Sidebar items={defaultItems} />)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('Profile')).toBeInTheDocument()
  })

  it('renders a collapse toggle button', () => {
    render(<Sidebar items={defaultItems} />)
    expect(screen.getByRole('button', { name: 'Toggle sidebar' })).toBeInTheDocument()
  })

  it('toggle button has aria-expanded reflecting the collapsed state', () => {
    const { unmount } = render(<Sidebar items={defaultItems} />)
    const toggle = screen.getByRole('button', { name: 'Toggle sidebar' })
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    unmount()

    render(<Sidebar items={defaultItems} collapsed={true} />)
    const toggleCollapsed = screen.getByRole('button', { name: 'Toggle sidebar' })
    expect(toggleCollapsed).toHaveAttribute('aria-expanded', 'false')
  })

  it('calls onCollapse with toggled value when toggle is clicked', async () => {
    const user = userEvent.setup()
    const handleCollapse = vi.fn()
    render(<Sidebar items={defaultItems} onCollapse={handleCollapse} />)
    await user.click(screen.getByRole('button', { name: 'Toggle sidebar' }))
    expect(handleCollapse).toHaveBeenCalledTimes(1)
    expect(handleCollapse).toHaveBeenCalledWith(true)
  })

  it('item with active=true has aria-current="page"', () => {
    const items = [
      { label: 'Dashboard', href: '/dashboard', active: true },
      { label: 'Settings', href: '/settings' },
    ]
    render(<Sidebar items={items} />)
    const activeItem = screen.getByRole('link', { name: 'Dashboard' })
    expect(activeItem).toHaveAttribute('aria-current', 'page')
  })

  it('item with href renders as anchor', () => {
    const items = [{ label: 'Docs', href: '/docs' }]
    render(<Sidebar items={items} />)
    const link = screen.getByRole('link', { name: 'Docs' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/docs')
  })

  it('item with onClick renders as button', () => {
    const items = [
      { label: 'Logout', onClick: vi.fn() },
    ]
    render(<Sidebar items={items} />)
    expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument()
  })

  it('calls item onClick when clicked', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    const items = [{ label: 'Logout', onClick: handleClick }]
    render(<Sidebar items={items} />)
    await user.click(screen.getByRole('button', { name: 'Logout' }))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('when collapsed, item labels are visually hidden (have sr-only class or similar)', () => {
    const items = [{ label: 'Home', href: '/' }]
    render(<Sidebar items={items} collapsed={true} />)
    const label = screen.getByText('Home')
    expect(label).toHaveClass('sr-only')
  })

  it('renders footer slot when provided', () => {
    const footer = <div data-testid="sidebar-footer">Footer content</div>
    render(<Sidebar items={defaultItems} footer={footer} />)
    expect(screen.getByTestId('sidebar-footer')).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Profile', onClick: vi.fn() },
      { label: 'Dashboard', href: '/dashboard', active: true },
    ]
    const { container } = render(<Sidebar items={items} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
