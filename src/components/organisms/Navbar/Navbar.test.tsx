import { describe, it, expect, vi } from 'vitest'
import { useRef } from 'react'
import type { AnchorHTMLAttributes } from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { Navbar } from './Navbar'
import type { NavItem } from './Navbar'
import { useNavbarAction } from '../../../index'
import type { NavbarActionContextValue } from '../../../index'

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

describe('Navbar logoAlign', () => {
  const items: NavItem[] = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
  ]
  // The logo is wrapped in a flex-shrink-0 div inside its layout cell
  const getLogoCell = () => screen.getByTestId('logo').parentElement!.parentElement!

  it('keeps the logo on the left from md by default (logoAlign="start")', () => {
    render(<Navbar logo={<span data-testid="logo">Brand</span>} items={items} />)
    expect(getLogoCell()).toHaveClass('justify-center', 'md:justify-start')
    const logo = screen.getByTestId('logo')
    const firstItem = screen.getByRole('link', { name: 'Home' })
    expect(logo.compareDocumentPosition(firstItem) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('centers the logo at every width when logoAlign="center"', () => {
    render(<Navbar logo={<span data-testid="logo">Brand</span>} logoAlign="center" />)
    expect(getLogoCell()).toHaveClass('justify-center')
    expect(getLogoCell()).not.toHaveClass('md:justify-start')
  })

  it('places nav items before the logo in DOM order when logoAlign="center"', () => {
    render(<Navbar logo={<span data-testid="logo">Brand</span>} items={items} logoAlign="center" />)
    const logo = screen.getByTestId('logo')
    const firstItem = screen.getByRole('link', { name: 'Home' })
    expect(firstItem.compareDocumentPosition(logo) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('keeps the mobile toggle before the logo when logoAlign="center"', () => {
    render(<Navbar logo={<span data-testid="logo">Brand</span>} items={items} logoAlign="center" />)
    const toggle = screen.getByRole('button', { name: /open navigation menu/i })
    const logo = screen.getByTestId('logo')
    expect(toggle.compareDocumentPosition(logo) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('has no accessibility violations with logoAlign="center"', async () => {
    const { container } = render(
      <Navbar
        logo={<span>Brand</span>}
        items={items}
        actions={[<button key="login">Login</button>]}
        logoAlign="center"
      />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('Navbar custom labels', () => {
  const items: NavItem[] = [
    { label: 'Início', href: '/' },
    { label: 'Projetos', href: '/projects' },
  ]
  const actions = [<button key="a">Notificações</button>, <button key="b">Entrar</button>]

  it('uses label as the navigation aria-label', () => {
    render(<Navbar label="Navegação principal" />)
    expect(screen.getByRole('navigation', { name: 'Navegação principal' })).toBeInTheDocument()
  })

  it('uses menuButtonLabel and menuTitle for the mobile menu', async () => {
    render(
      <Navbar items={items} menuButtonLabel="Abrir menu de navegação" menuTitle="Menu principal" />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Abrir menu de navegação' }))
    expect(screen.getByRole('dialog', { name: 'Menu principal' })).toBeInTheDocument()
  })

  it('uses actionsButtonLabel and actionsTitle for the actions drawer', async () => {
    render(<Navbar actions={actions} actionsButtonLabel="Mais ações" actionsTitle="Ações" />)
    await userEvent.click(screen.getByRole('button', { name: 'Mais ações' }))
    expect(screen.getByRole('dialog', { name: 'Ações' })).toBeInTheDocument()
  })

  it('passes drawerCloseLabel and drawerDismissLabel to both drawers', async () => {
    render(
      <Navbar
        items={items}
        actions={actions}
        drawerCloseLabel="Fechar"
        drawerDismissLabel="Fechar painel"
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: /open navigation menu/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /more actions/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Fechar painel' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

// Stands in for a router link (e.g. Next.js `Link`): renders its own <a> and navigates on the
// client, so the click never reaches the browser's default navigation.
function TestLink({
  href,
  children,
  onClick,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return (
    <a
      {...props}
      href={href}
      data-custom-link=""
      onClick={(e) => {
        onClick?.(e)
        e.preventDefault()
      }}
    >
      {children}
    </a>
  )
}

describe('Navbar linkComponent', () => {
  const items: NavItem[] = [
    { label: 'Home', href: '/', active: true },
    { label: 'Projects', href: '/projects' },
    {
      type: 'dropdown',
      label: 'Resources',
      items: [{ label: 'Docs', href: '/docs' }],
    },
  ]

  it('renders desktop link items with linkComponent, keeping href, aria-current and classes', () => {
    render(<Navbar items={items} linkComponent={TestLink} />)
    const home = screen.getByRole('link', { name: 'Home' })
    expect(home).toHaveAttribute('data-custom-link')
    expect(home).toHaveAttribute('href', '/')
    expect(home).toHaveAttribute('aria-current', 'page')
    expect(home).toHaveClass('text-primary')
    expect(screen.getByRole('link', { name: 'Projects' })).toHaveAttribute('data-custom-link')
  })

  it('renders desktop dropdown sub-items with linkComponent', async () => {
    render(<Navbar items={items} linkComponent={TestLink} />)
    await userEvent.click(screen.getByRole('button', { name: 'Resources' }))
    const docs = screen.getByRole('menuitem', { name: 'Docs' })
    expect(docs).toHaveAttribute('data-custom-link')
    expect(docs).toHaveAttribute('href', '/docs')
  })

  it('renders mobile drawer link items and dropdown sub-items with linkComponent', async () => {
    render(<Navbar items={items} linkComponent={TestLink} />)
    await userEvent.click(screen.getByRole('button', { name: /open navigation menu/i }))
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByRole('link', { name: 'Home' })).toHaveAttribute('data-custom-link')
    expect(within(dialog).getByRole('link', { name: 'Docs' })).toHaveAttribute('data-custom-link')
  })

  it('closes the mobile drawer when a link item is clicked', async () => {
    render(<Navbar items={items} linkComponent={TestLink} />)
    await userEvent.click(screen.getByRole('button', { name: /open navigation menu/i }))
    await userEvent.click(
      within(screen.getByRole('dialog')).getByRole('link', { name: 'Projects' }),
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes the mobile drawer when a dropdown sub-item is clicked', async () => {
    render(<Navbar items={items} linkComponent={TestLink} />)
    await userEvent.click(screen.getByRole('button', { name: /open navigation menu/i }))
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('link', { name: 'Docs' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes the mobile drawer and calls onClick when a button item is clicked', async () => {
    const onClick = vi.fn()
    render(<Navbar items={[{ label: 'Settings', onClick }]} />)
    await userEvent.click(screen.getByRole('button', { name: /open navigation menu/i }))
    await userEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Settings' }),
    )
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes the mobile drawer when a plain <a> item is clicked', async () => {
    render(<Navbar items={[{ label: 'About', href: '#about' }]} />)
    await userEvent.click(screen.getByRole('button', { name: /open navigation menu/i }))
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('link', { name: 'About' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('has no accessibility violations with linkComponent', async () => {
    const { container } = render(<Navbar items={items} linkComponent={TestLink} />)
    await userEvent.click(screen.getByRole('button', { name: /open navigation menu/i }))
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('useNavbarAction', () => {
  // Shows where it is rendered and closes the drawer, like an app's user menu would.
  function PlacementAwareAction() {
    const { inDrawer, closeDrawer }: NavbarActionContextValue = useNavbarAction()
    return (
      <button type="button" onClick={closeDrawer}>
        {inDrawer ? 'Profile (drawer)' : 'Profile (header)'}
      </button>
    )
  }

  const twoActions = [<button key="a">Notifications</button>, <PlacementAwareAction key="b" />]

  const openActionsDrawer = () =>
    userEvent.click(screen.getByRole('button', { name: /more actions/i }))

  it('reports inDrawer: false for an action in the header', () => {
    render(<Navbar actions={twoActions} />)
    expect(screen.getByRole('button', { name: 'Profile (header)' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Profile (drawer)' })).not.toBeInTheDocument()
  })

  it('reports inDrawer: true for the copy inside the actions drawer, from the first render', async () => {
    // The value each instance had on its very first render: an app that reads it in render
    // (e.g. `align={inDrawer ? 'start' : 'end'}`) must not flash the header layout in the drawer.
    const firstRenderValues: boolean[] = []
    function RecordingAction() {
      const { inDrawer } = useNavbarAction()
      const first = useRef<boolean | null>(null)
      if (first.current === null) {
        first.current = inDrawer
        firstRenderValues.push(inDrawer)
      }
      return <span>{inDrawer ? 'in drawer' : 'in header'}</span>
    }
    render(
      <Navbar actions={[<button key="a">Notifications</button>, <RecordingAction key="b" />]} />,
    )
    expect(firstRenderValues).toEqual([false])

    firstRenderValues.length = 0
    await openActionsDrawer()
    expect(within(screen.getByRole('dialog')).getByText('in drawer')).toBeInTheDocument()
    expect(firstRenderValues).toEqual([true])
  })

  it('closes the actions drawer when closeDrawer is called from inside it', async () => {
    render(<Navbar actions={twoActions} />)
    await openActionsDrawer()
    const dialog = screen.getByRole('dialog')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Profile (drawer)' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('does nothing when closeDrawer is called from the header', async () => {
    render(<Navbar actions={twoActions} />)
    await openActionsDrawer()
    await userEvent.click(screen.getByRole('button', { name: 'Profile (header)' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('reports inDrawer: false for a single action, which stays in the header on mobile', () => {
    render(<Navbar actions={[<PlacementAwareAction key="a" />]} />)
    // Both copies (desktop row and mobile header) are in the header.
    expect(screen.getAllByRole('button', { name: 'Profile (header)' })).toHaveLength(2)
    expect(screen.queryByRole('button', { name: 'Profile (drawer)' })).not.toBeInTheDocument()
  })

  it('returns a no-op default outside a Navbar instead of throwing', async () => {
    render(<PlacementAwareAction />)
    const button = screen.getByRole('button', { name: 'Profile (header)' })
    await userEvent.click(button)
    expect(button).toBeInTheDocument()
  })

  it('has no accessibility violations with a placement-aware action in the open drawer', async () => {
    const { container } = render(<Navbar actions={twoActions} />)
    await openActionsDrawer()
    expect(await axe(container)).toHaveNoViolations()
  })
})
