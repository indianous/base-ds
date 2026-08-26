import type { Meta, StoryObj } from '@storybook/react'
import { Sidebar } from './Sidebar'
import { Icon } from '../../atoms/Icon/Icon'

const meta: Meta<typeof Sidebar> = {
  component: Sidebar,
  title: 'Organisms/Sidebar',
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Sidebar>

const items = [
  {
    label: 'Dashboard',
    icon: <Icon name="LayoutDashboard" size="sm" />,
    href: '/dashboard',
    active: true,
  },
  { label: 'Projects', icon: <Icon name="Folder" size="sm" />, href: '/projects' },
  { label: 'Settings', icon: <Icon name="Settings" size="sm" />, href: '/settings' },
]

export const Expanded: Story = {
  args: { items },
}

export const Collapsed: Story = {
  args: { items, collapsed: true },
}

export const WithFooter: Story = {
  args: {
    items,
    footer: <span className="text-xs text-muted-foreground">v1.0.0</span>,
  },
}

const groupedItems = [
  {
    label: 'Orders',
    group: 'Sales',
    icon: <Icon name="ClipboardList" size="sm" />,
    href: '/orders',
    active: true,
  },
  { label: 'Shipping', group: 'Sales', icon: <Icon name="Truck" size="sm" />, href: '/shipping' },
  {
    label: 'Products',
    group: 'Catalog',
    icon: <Icon name="Package" size="sm" />,
    href: '/products',
  },
  {
    label: 'External link',
    icon: <Icon name="ExternalLink" size="sm" />,
    href: 'https://example.com',
  },
]

export const Grouped: Story = {
  args: { items: groupedItems },
}

export const GroupedCollapsed: Story = {
  args: { items: groupedItems, collapsed: true },
}

export const AsChild: Story = {
  args: {
    items: [
      {
        label: 'Dashboard',
        icon: <Icon name="LayoutDashboard" size="sm" />,
        active: true,
        asChild: <a href="/dashboard" aria-label="Dashboard" />,
      },
      {
        label: 'Projects',
        icon: <Icon name="Folder" size="sm" />,
        asChild: <a href="/projects" aria-label="Projects" />,
      },
      {
        label: 'Settings',
        icon: <Icon name="Settings" size="sm" />,
        asChild: <a href="/settings" aria-label="Settings" />,
      },
    ],
  },
}
