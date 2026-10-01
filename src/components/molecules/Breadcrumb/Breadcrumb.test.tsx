import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import type { AnchorHTMLAttributes } from 'react'
import { Breadcrumb } from './Breadcrumb'
import type { BreadcrumbItem, BreadcrumbProps } from '../../../index'

const items = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Details' },
]

describe('Breadcrumb', () => {
  it('renders a nav element with aria-label="Breadcrumb"', () => {
    render(<Breadcrumb items={items} />)
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument()
  })

  it('renders all breadcrumb items', () => {
    render(<Breadcrumb items={items} />)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Products')).toBeInTheDocument()
    expect(screen.getByText('Details')).toBeInTheDocument()
  })

  it('last item has aria-current="page"', () => {
    render(<Breadcrumb items={items} />)
    expect(screen.getByText('Details')).toHaveAttribute('aria-current', 'page')
  })

  it('last item is not a link', () => {
    render(<Breadcrumb items={items} />)
    const links = screen.getAllByRole('link')
    const linkTexts = links.map((l) => l.textContent)
    expect(linkTexts).not.toContain('Details')
  })

  it('non-last items with href render as anchor tags', () => {
    render(<Breadcrumb items={items} />)
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Products' })).toHaveAttribute('href', '/products')
  })

  it('non-last items with onClick render as buttons', () => {
    const clickItems = [
      { label: 'Dashboard', onClick: vi.fn() },
      { label: 'Settings', onClick: vi.fn() },
      { label: 'Profile' },
    ]
    render(<Breadcrumb items={clickItems} />)
    expect(screen.getByRole('button', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument()
  })

  it('renders separator between items', () => {
    render(<Breadcrumb items={items} />)
    // There should be separators between items (items.length - 1 = 2 separators)
    const separators = document.querySelectorAll('[aria-hidden="true"]')
    expect(separators.length).toBeGreaterThanOrEqual(items.length - 1)
  })

  it('does not render separator after last item', () => {
    render(<Breadcrumb items={items} />)
    const listItems = screen.getAllByRole('listitem')
    // Last listitem should not contain an aria-hidden separator
    const lastItem = listItems[listItems.length - 1]!
    const separatorInLast = lastItem.querySelector('[aria-hidden="true"]')
    expect(separatorInLast).toBeNull()
  })

  it('calls onClick when a button item is clicked', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    const clickItems = [{ label: 'Dashboard', onClick: handleClick }, { label: 'Profile' }]
    render(<Breadcrumb items={clickItems} />)
    await user.click(screen.getByRole('button', { name: 'Dashboard' }))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('renders custom separator when provided', () => {
    render(<Breadcrumb items={items} separator={<span data-testid="custom-sep">/</span>} />)
    const customSeps = screen.getAllByTestId('custom-sep')
    expect(customSeps).toHaveLength(items.length - 1)
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<Breadcrumb items={items} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('Breadcrumb custom labels', () => {
  it('uses label for the navigation landmark', () => {
    render(<Breadcrumb items={items} label="Trilha de navegação" />)
    expect(screen.getByRole('navigation', { name: 'Trilha de navegação' })).toBeInTheDocument()
  })
})

// Stands in for a router link (e.g. Next.js `Link`): renders its own <a>.
function TestLink({
  href,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return (
    <a {...props} href={href} data-custom-link="">
      {children}
    </a>
  )
}

describe('Breadcrumb linkComponent', () => {
  const trail: BreadcrumbItem[] = [
    { label: 'Projetos', href: '/projects' },
    { label: 'Arquivo', onClick: vi.fn() },
    { label: 'base-ds' },
  ]
  const renderTrail = (props: Partial<BreadcrumbProps> = {}) =>
    render(<Breadcrumb items={trail} linkComponent={TestLink} {...props} />)

  it('renders items with href using linkComponent, keeping href and classes', () => {
    renderTrail()
    const link = screen.getByRole('link', { name: 'Projetos' })
    expect(link).toHaveAttribute('data-custom-link')
    expect(link).toHaveAttribute('href', '/projects')
    expect(link).toHaveClass('text-sm', 'text-muted-foreground')
  })

  it('keeps the last item as the current page and onClick items as buttons', () => {
    renderTrail()
    expect(screen.getByText('base-ds')).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: 'Arquivo' })).toBeInTheDocument()
    expect(screen.getAllByRole('link')).toHaveLength(1)
  })

  it('has no accessibility violations with linkComponent', async () => {
    const { container } = renderTrail({ label: 'Trilha de navegação' })
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('Breadcrumb focus', () => {
  it('shows a focus ring on links and buttons', () => {
    render(
      <Breadcrumb
        items={[
          { label: 'Projetos', href: '/projects' },
          { label: 'Arquivo', onClick: vi.fn() },
          { label: 'base-ds' },
        ]}
      />,
    )
    for (const element of [
      screen.getByRole('link', { name: 'Projetos' }),
      screen.getByRole('button', { name: 'Arquivo' }),
    ]) {
      expect(element).toHaveClass('focus:ring-2', 'focus:ring-ring')
    }
  })
})
