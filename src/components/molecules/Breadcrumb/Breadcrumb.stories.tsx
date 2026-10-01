import type { Meta, StoryObj } from '@storybook/react'
import type { AnchorHTMLAttributes } from 'react'
import { Breadcrumb } from './Breadcrumb'

const meta: Meta<typeof Breadcrumb> = {
  component: Breadcrumb,
  title: 'Molecules/Breadcrumb',
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Breadcrumb>

export const Default: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Products', href: '/products' },
      { label: 'Laptop Pro X' },
    ],
  },
}

export const WithClick: Story = {
  args: {
    items: [
      { label: 'Dashboard', onClick: () => {} },
      { label: 'Settings', onClick: () => {} },
      { label: 'Profile' },
    ],
  },
}

export const TwoItems: Story = {
  args: { items: [{ label: 'Home', href: '/' }, { label: 'Current page' }] },
}

export const CustomLabels: Story = {
  args: {
    items: [
      { label: 'Início', href: '/' },
      { label: 'Produtos', href: '/produtos' },
      { label: 'Notebook Pro X' },
    ],
    label: 'Trilha de navegação',
  },
}

// Stands in for a router link such as Next.js `Link`, which base-ds doesn't depend on: it renders
// its own <a> and skips the browser navigation, as client-side routing would.
function DemoLink({
  href,
  children,
  onClick,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return (
    <a
      {...props}
      href={href}
      data-router-link=""
      onClick={(e) => {
        onClick?.(e)
        e.preventDefault()
      }}
    >
      {children}
    </a>
  )
}

export const CustomLinkComponent: Story = {
  args: {
    items: [
      { label: 'Projetos', href: '/projects' },
      { label: 'Arquivo', onClick: () => {} },
      { label: 'base-ds' },
    ],
    label: 'Trilha de navegação',
    linkComponent: DemoLink,
  },
}
