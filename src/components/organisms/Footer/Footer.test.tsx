import { describe, it, expect } from 'vitest'
import type { AnchorHTMLAttributes } from 'react'
import { render, screen, within } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Footer } from './Footer'

describe('Footer', () => {
  it('renders as a contentinfo landmark', () => {
    render(<Footer />)
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('renders logo slot when provided', () => {
    render(<Footer logo={<span data-testid="logo">BrandLogo</span>} />)
    expect(screen.getByTestId('logo')).toBeInTheDocument()
  })

  it('does not render logo slot when not provided', () => {
    render(<Footer />)
    expect(screen.queryByTestId('logo')).not.toBeInTheDocument()
  })

  it('renders link columns with correct titles and links', () => {
    const columns = [
      {
        title: 'Product',
        links: [
          { label: 'Features', href: '/features' },
          { label: 'Pricing', href: '/pricing' },
        ],
      },
      {
        title: 'Company',
        links: [{ label: 'About', href: '/about' }],
      },
    ]
    render(<Footer columns={columns} />)

    const productNav = screen.getByRole('navigation', { name: 'Product' })
    expect(within(productNav).getByRole('link', { name: 'Features' })).toHaveAttribute(
      'href',
      '/features',
    )
    expect(within(productNav).getByRole('link', { name: 'Pricing' })).toHaveAttribute(
      'href',
      '/pricing',
    )

    const companyNav = screen.getByRole('navigation', { name: 'Company' })
    expect(within(companyNav).getByRole('link', { name: 'About' })).toHaveAttribute(
      'href',
      '/about',
    )
  })

  it('renders social links with accessible labels', () => {
    const socialLinks = [
      { icon: <span data-testid="icon-github" />, href: 'https://github.com/x', label: 'GitHub' },
      {
        icon: <span data-testid="icon-twitter" />,
        href: 'https://twitter.com/x',
        label: 'Twitter',
      },
    ]
    render(<Footer socialLinks={socialLinks} />)

    const githubLink = screen.getByRole('link', { name: 'GitHub' })
    expect(githubLink).toHaveAttribute('href', 'https://github.com/x')
    const twitterLink = screen.getByRole('link', { name: 'Twitter' })
    expect(twitterLink).toHaveAttribute('href', 'https://twitter.com/x')
  })

  it('renders provided copyright text', () => {
    render(<Footer copyright="© 2026 Acme Inc." />)
    expect(screen.getByText('© 2026 Acme Inc.')).toBeInTheDocument()
  })

  it('renders default copyright with current year when not provided', () => {
    render(<Footer />)
    const year = new Date().getFullYear()
    expect(screen.getByText(`© ${year} base-ds`)).toBeInTheDocument()
  })

  it('applies additional className to the root element', () => {
    const { container } = render(<Footer className="custom-footer" />)
    expect(container.querySelector('footer')).toHaveClass('custom-footer')
  })

  it('has no accessibility violations', async () => {
    const columns = [
      {
        title: 'Product',
        links: [{ label: 'Features', href: '/features' }],
      },
    ]
    const socialLinks = [
      { icon: <span data-testid="icon-github" />, href: 'https://github.com/x', label: 'GitHub' },
    ]
    const { container } = render(
      <Footer
        logo={<span>Brand</span>}
        columns={columns}
        socialLinks={socialLinks}
        copyright="© 2026 base-ds"
      />,
    )
    expect(await axe(container)).toHaveNoViolations()
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

describe('Footer linkComponent', () => {
  const columns = [{ title: 'Product', links: [{ label: 'Features', href: '/features' }] }]
  const socialLinks = [
    { icon: <span data-testid="icon-github" />, href: 'https://github.com/x', label: 'GitHub' },
  ]

  it('renders column links with linkComponent, keeping href and classes', () => {
    render(<Footer columns={columns} linkComponent={TestLink} />)
    const link = screen.getByRole('link', { name: 'Features' })
    expect(link).toHaveAttribute('data-custom-link')
    expect(link).toHaveAttribute('href', '/features')
    expect(link).toHaveClass('text-muted-foreground')
  })

  it('renders social links with linkComponent, keeping href and aria-label', () => {
    render(<Footer socialLinks={socialLinks} linkComponent={TestLink} />)
    const link = screen.getByRole('link', { name: 'GitHub' })
    expect(link).toHaveAttribute('data-custom-link')
    expect(link).toHaveAttribute('href', 'https://github.com/x')
  })

  it('has no accessibility violations with linkComponent', async () => {
    const { container } = render(
      <Footer columns={columns} socialLinks={socialLinks} linkComponent={TestLink} />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
