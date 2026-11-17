import type { Meta, StoryObj } from '@storybook/react'
import type { AnchorHTMLAttributes } from 'react'
import { Badge } from './Badge'

const meta: Meta<typeof Badge> = {
  component: Badge,
  title: 'Atoms/Badge',
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof Badge>

export const Default: Story = { args: { children: 'Default', variant: 'default' } }
export const Primary: Story = { args: { children: 'Primary', variant: 'primary' } }
export const Success: Story = { args: { children: 'Success', variant: 'success' } }
export const Warning: Story = { args: { children: 'Warning', variant: 'warning' } }
export const Danger: Story = { args: { children: 'Error', variant: 'danger' } }
export const Info: Story = { args: { children: 'Info', variant: 'info' } }

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-2 flex-wrap">
      <Badge variant="default">Default</Badge>
      <Badge variant="primary">Primary</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="danger">Danger</Badge>
      <Badge variant="info">Info</Badge>
    </div>
  ),
}

export const LongTextInNarrowContainer: Story = {
  render: () => (
    <div className="w-16">
      <Badge variant="primary">Casa e Jardim</Badge>
    </div>
  ),
}

const variants = ['default', 'primary', 'success', 'warning', 'danger', 'info'] as const

export const AsLink: Story = {
  render: () => (
    <div className="flex gap-2 flex-wrap">
      {variants.map((variant) => (
        <Badge key={variant} variant={variant} href={`/tags/${variant}`}>
          {variant}
        </Badge>
      ))}
    </div>
  ),
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
  render: () => (
    <div className="flex gap-2 flex-wrap">
      <Badge href="/tags/react" linkComponent={DemoLink} size="sm">
        React
      </Badge>
      <Badge href="/categories/design-systems" linkComponent={DemoLink} size="sm" variant="primary">
        Design systems
      </Badge>
    </div>
  ),
}
