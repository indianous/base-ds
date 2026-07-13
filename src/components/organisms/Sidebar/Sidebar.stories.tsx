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
