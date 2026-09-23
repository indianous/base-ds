import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { Navbar } from './Navbar'
import type { NavItem } from './Navbar'

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
    const items: NavItem[] = [
      { label: 'Home', href: '/' },
      { label: 'About', href: '/about' },
    ]
    render(<Navbar items={items} />)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
  })

  it('item with active=true has aria-current="page"', () => {
    const items: NavItem[] = [
      { label: 'Home', href: '/', active: true },
      { label: 'About', href: '/about' },
    ]
    render(<Navbar items={items} />)
    expect(screen.getByText('Home')).toHaveAttribute('aria-current', 'page')
    expect(screen.getByText('About')).not.toHaveAttribute('aria-current', 'page')
  })

  it('item with href renders as an anchor tag', () => {
    const items: NavItem[] = [{ label: 'Docs', href: '/docs' }]
    render(<Navbar items={items} />)
    const link = screen.getByRole('link', { name: 'Docs' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/docs')
  })

  it('item with onClick (no href) renders as a button', () => {
    const items: NavItem[] = [{ label: 'Settings', onClick: vi.fn() }]
    render(<Navbar items={items} />)
    expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument()
  })

  it('calls item onClick when clicked', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    const items: NavItem[] = [{ label: 'Profile', onClick: handleClick }]
    render(<Navbar items={items} />)
    await user.click(screen.getByRole('button', { name: 'Profile' }))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('renders a single action from the actions array', () => {
    // Rendered once in the desktop actions block and once in the mobile actions
    // block (each toggled by CSS at a different breakpoint), same pattern already
    // used for logo/search/items across the desktop row and the mobile drawer.
    render(
      <Navbar
        actions={[
          <button key="login" data-testid="action-btn">
            Login
          </button>,
        ]}
      />,
    )
    expect(screen.getAllByTestId('action-btn')).toHaveLength(2)
  })

  it('renders multiple actions from the actions array', () => {
    render(
      <Navbar actions={[<button key="a">Notifications</button>, <button key="b">Login</button>]} />,
    )
    expect(screen.getByRole('button', { name: 'Notifications' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument()
  })

  it('sticky prop adds sticky positioning class', () => {
    const { container } = render(<Navbar sticky />)
    const header = container.querySelector('header')
    expect(header).toHaveClass('sticky')
    expect(header).toHaveClass('top-0')
    expect(header).toHaveClass('z-50')
  })

  it('has no accessibility violations', async () => {
    const items: NavItem[] = [
      { label: 'Home', href: '/', active: true },
      { label: 'About', href: '/about' },
    ]
    const { container } = render(
      <Navbar
        logo={<span>Brand</span>}
        items={items}
        actions={[<button key="login">Login</button>]}
      />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  describe('dropdown nav items', () => {
    const items: NavItem[] = [
      { label: 'Home', href: '/' },
      {
        type: 'dropdown',
        label: 'Resources',
        items: [
          { label: 'Docs', href: '/docs' },
          { label: 'Blog', onClick: vi.fn() },
        ],
      },
    ]

    it('renders the dropdown label as a trigger button', () => {
      render(<Navbar items={items} />)
      expect(screen.getByRole('button', { name: 'Resources' })).toBeInTheDocument()
    })

    it('opens the dropdown menu and shows its sub-items', async () => {
      render(<Navbar items={items} />)
      await userEvent.click(screen.getByRole('button', { name: 'Resources' }))
      expect(screen.getByRole('menuitem', { name: 'Docs' })).toBeInTheDocument()
      expect(screen.getByRole('menuitem', { name: 'Blog' })).toBeInTheDocument()
    })
  })

  describe('search', () => {
    it('renders the search slot when provided', () => {
      render(<Navbar search={<input aria-label="Search" data-testid="search-slot" />} />)
      expect(screen.getByTestId('search-slot')).toBeInTheDocument()
    })

    it('places nav items after the search slot in the document, moving them to a second row', () => {
      const items: NavItem[] = [{ label: 'Home', href: '/' }]
      render(
        <Navbar search={<input aria-label="Search" data-testid="search-slot" />} items={items} />,
      )
      const searchSlot = screen.getByTestId('search-slot')
      const homeLink = screen.getByText('Home')
      expect(
        searchSlot.compareDocumentPosition(homeLink) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy()
    })

    it('has no accessibility violations with search and items', async () => {
      const items: NavItem[] = [{ label: 'Home', href: '/' }]
      const { container } = render(<Navbar search={<input aria-label="Search" />} items={items} />)
      expect(await axe(container)).toHaveNoViolations()
    })
  })

  describe('mobile menu', () => {
    const items: NavItem[] = [
      { label: 'Home', href: '/', active: true },
      {
        type: 'dropdown',
        label: 'Resources',
        items: [{ label: 'Docs', href: '/docs' }],
      },
    ]

    it('does not render a mobile toggle button when there are no items or search', () => {
      render(<Navbar logo={<span>Brand</span>} />)
      expect(
        screen.queryByRole('button', { name: /open navigation menu/i }),
      ).not.toBeInTheDocument()
    })

    it('renders a mobile toggle button when items are provided', () => {
      render(<Navbar items={items} />)
      expect(screen.getByRole('button', { name: /open navigation menu/i })).toBeInTheDocument()
    })

    it('opens the mobile drawer when the toggle button is clicked', async () => {
      render(<Navbar items={items} />)
      await userEvent.click(screen.getByRole('button', { name: /open navigation menu/i }))
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('renders link items inside the mobile drawer', async () => {
      render(<Navbar items={items} />)
      await userEvent.click(screen.getByRole('button', { name: /open navigation menu/i }))
      const dialog = screen.getByRole('dialog')
      expect(within(dialog).getByRole('link', { name: 'Home' })).toBeInTheDocument()
    })

    it('renders dropdown items inside the mobile drawer as a grouped list, not a popover', async () => {
      render(<Navbar items={items} />)
      await userEvent.click(screen.getByRole('button', { name: /open navigation menu/i }))
      const dialog = screen.getByRole('dialog')
      expect(within(dialog).getByText('Resources')).toBeInTheDocument()
      expect(within(dialog).getByRole('link', { name: 'Docs' })).toBeInTheDocument()
      expect(within(dialog).queryByRole('menu')).not.toBeInTheDocument()
    })

    it('renders the search slot inside the mobile drawer', async () => {
      render(
        <Navbar items={items} search={<input aria-label="Search" data-testid="search-slot" />} />,
      )
      await userEvent.click(screen.getByRole('button', { name: /open navigation menu/i }))
      const dialog = screen.getByRole('dialog')
      expect(within(dialog).getByTestId('search-slot')).toBeInTheDocument()
    })

    it('closes the mobile drawer when the drawer close button is clicked', async () => {
      render(<Navbar items={items} />)
      await userEvent.click(screen.getByRole('button', { name: /open navigation menu/i }))
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      await userEvent.click(screen.getByRole('button', { name: /close drawer/i }))
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('has no accessibility violations with the mobile drawer open', async () => {
      const { container } = render(<Navbar items={items} />)
      await userEvent.click(screen.getByRole('button', { name: /open navigation menu/i }))
      expect(await axe(container)).toHaveNoViolations()
    })

    it('positions the mobile toggle button before the logo in DOM order', () => {
      render(<Navbar logo={<span data-testid="logo">Brand</span>} items={items} />)
      const toggle = screen.getByRole('button', { name: /open navigation menu/i })
      const logo = screen.getByTestId('logo')
      expect(toggle.compareDocumentPosition(logo) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    })
  })

  describe('mobile actions', () => {
    it('does not render a settings/gear button when there is only 1 action', () => {
      render(<Navbar actions={[<button key="a">Login</button>]} />)
      expect(screen.queryByRole('button', { name: /more actions/i })).not.toBeInTheDocument()
    })

    it('renders a settings/gear button when there is more than 1 action', () => {
      render(
        <Navbar
          actions={[<button key="a">Notifications</button>, <button key="b">Login</button>]}
        />,
      )
      expect(screen.getByRole('button', { name: /more actions/i })).toBeInTheDocument()
    })

    it('does not duplicate the action buttons themselves when there is more than 1 action', () => {
      render(
        <Navbar
          actions={[<button key="a">Notifications</button>, <button key="b">Login</button>]}
        />,
      )
      expect(screen.getAllByRole('button', { name: 'Notifications' })).toHaveLength(1)
    })

    it('opens a right-side drawer listing the actions when the gear button is clicked', async () => {
      render(
        <Navbar
          actions={[<button key="a">Notifications</button>, <button key="b">Login</button>]}
        />,
      )
      await userEvent.click(screen.getByRole('button', { name: /more actions/i }))
      const dialog = screen.getByRole('dialog')
      expect(within(dialog).getByRole('button', { name: 'Notifications' })).toBeInTheDocument()
      expect(within(dialog).getByRole('button', { name: 'Login' })).toBeInTheDocument()
    })

    it('opens the actions drawer on the right side', async () => {
      render(
        <Navbar
          actions={[<button key="a">Notifications</button>, <button key="b">Login</button>]}
        />,
      )
      await userEvent.click(screen.getByRole('button', { name: /more actions/i }))
      expect(screen.getByRole('dialog').className).toMatch(/right-0/)
    })

    it('closes the actions drawer when its close button is clicked', async () => {
      render(
        <Navbar
          actions={[<button key="a">Notifications</button>, <button key="b">Login</button>]}
        />,
      )
      await userEvent.click(screen.getByRole('button', { name: /more actions/i }))
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      await userEvent.click(screen.getByRole('button', { name: /close drawer/i }))
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('has no accessibility violations with the actions drawer open', async () => {
      const { container } = render(
        <Navbar
          actions={[<button key="a">Notifications</button>, <button key="b">Login</button>]}
        />,
      )
      await userEvent.click(screen.getByRole('button', { name: /more actions/i }))
      expect(await axe(container)).toHaveNoViolations()
    })
  })
})
