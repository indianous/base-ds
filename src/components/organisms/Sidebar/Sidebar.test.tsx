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
    const items = [{ label: 'Logout', onClick: vi.fn() }]
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

  describe('asChild', () => {
    it('renders the provided element instead of a native anchor', () => {
      const items = [{ label: 'Orders', asChild: <a href="/orders" aria-label="Orders" /> }]
      render(<Sidebar items={items} />)
      const link = screen.getByRole('link', { name: 'Orders' })
      expect(link).toHaveAttribute('href', '/orders')
    })

    it('injects the icon and label as children of the provided element', () => {
      const items = [
        {
          label: 'Orders',
          icon: <span data-testid="orders-icon" />,
          asChild: <a href="/orders" aria-label="Orders" />,
        },
      ]
      render(<Sidebar items={items} />)
      const link = screen.getByRole('link', { name: 'Orders' })
      expect(link.querySelector('[data-testid="orders-icon"]')).toBeInTheDocument()
      expect(link).toHaveTextContent('Orders')
    })

    it('preserves the className already set on the provided element', () => {
      const items = [
        {
          label: 'Orders',
          asChild: <a href="/orders" aria-label="Orders" className="custom-link" />,
        },
      ]
      render(<Sidebar items={items} />)
      expect(screen.getByRole('link', { name: 'Orders' })).toHaveClass('custom-link')
    })

    it('applies aria-current="page" when active', () => {
      const items = [
        { label: 'Orders', active: true, asChild: <a href="/orders" aria-label="Orders" /> },
      ]
      render(<Sidebar items={items} />)
      expect(screen.getByRole('link', { name: 'Orders' })).toHaveAttribute('aria-current', 'page')
    })

    it('respects collapsed state, hiding the label with sr-only inside the provided element', () => {
      const items = [{ label: 'Orders', asChild: <a href="/orders" aria-label="Orders" /> }]
      render(<Sidebar items={items} collapsed />)
      const label = screen.getByText('Orders')
      expect(label).toHaveClass('sr-only')
    })

    it('calls both the onClick already on the provided element and item.onClick', async () => {
      const elementOnClick = vi.fn()
      const itemOnClick = vi.fn()
      const items = [
        {
          label: 'Orders',
          onClick: itemOnClick,
          asChild: <a href="/orders" aria-label="Orders" onClick={elementOnClick} />,
        },
      ]
      render(<Sidebar items={items} />)
      await userEvent.click(screen.getByRole('link', { name: 'Orders' }))
      expect(elementOnClick).toHaveBeenCalledTimes(1)
      expect(itemOnClick).toHaveBeenCalledTimes(1)
    })

    it('has no accessibility violations', async () => {
      const items = [{ label: 'Orders', asChild: <a href="/orders" aria-label="Orders" /> }]
      const { container } = render(<Sidebar items={items} />)
      expect(await axe(container)).toHaveNoViolations()
    })
  })

  describe('group', () => {
    it('renders a group header before the first item of a group', () => {
      const items = [
        { label: 'Orders', group: 'Sales', href: '/orders' },
        { label: 'Shipping', group: 'Sales', href: '/shipping' },
      ]
      render(<Sidebar items={items} />)
      expect(screen.getByText('Sales')).toBeInTheDocument()
    })

    it('renders a single header for consecutive items sharing the same group', () => {
      const items = [
        { label: 'Orders', group: 'Sales', href: '/orders' },
        { label: 'Shipping', group: 'Sales', href: '/shipping' },
      ]
      render(<Sidebar items={items} />)
      expect(screen.getAllByText('Sales')).toHaveLength(1)
    })

    it('renders no header for items without a group', () => {
      const items = [
        { label: 'Home', href: '/' },
        { label: 'Settings', href: '/settings' },
      ]
      render(<Sidebar items={items} />)
      expect(screen.queryByText('Home')?.closest('li')?.previousElementSibling).toBeNull()
    })

    it('still renders the following group header when an ungrouped item sits between two groups', () => {
      const items = [
        { label: 'Orders', group: 'Sales', href: '/orders' },
        { label: 'External link', href: 'https://example.com' },
        { label: 'Products', group: 'Catalog', href: '/products' },
      ]
      render(<Sidebar items={items} />)
      expect(screen.getByText('Sales')).toBeInTheDocument()
      expect(screen.getByText('Catalog')).toBeInTheDocument()
    })

    it('renders two separate headers for non-contiguous blocks sharing the same group name', () => {
      const items = [
        { label: 'Orders', group: 'Sales', href: '/orders' },
        { label: 'Products', group: 'Catalog', href: '/products' },
        { label: 'Shipping', group: 'Sales', href: '/shipping' },
      ]
      render(<Sidebar items={items} />)
      expect(screen.getAllByText('Sales')).toHaveLength(2)
    })

    it('applies sr-only to the group header text when collapsed', () => {
      const items = [{ label: 'Orders', group: 'Sales', href: '/orders' }]
      render(<Sidebar items={items} collapsed />)
      expect(screen.getByText('Sales')).toHaveClass('sr-only')
    })

    it('has no accessibility violations with grouped items', async () => {
      const items = [
        { label: 'Orders', group: 'Sales', href: '/orders' },
        { label: 'Shipping', group: 'Sales', href: '/shipping' },
        { label: 'Products', group: 'Catalog', href: '/products' },
        { label: 'External link', href: 'https://example.com' },
      ]
      const { container } = render(<Sidebar items={items} />)
      expect(await axe(container)).toHaveNoViolations()
    })

    it('has no accessibility violations with grouped items when collapsed', async () => {
      const items = [
        { label: 'Orders', group: 'Sales', href: '/orders' },
        { label: 'Products', group: 'Catalog', href: '/products' },
      ]
      const { container } = render(<Sidebar items={items} collapsed />)
      expect(await axe(container)).toHaveNoViolations()
    })
  })
})
