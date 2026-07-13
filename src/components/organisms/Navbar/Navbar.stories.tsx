import type { Meta, StoryObj } from '@storybook/react'
import { Navbar } from './Navbar'
import { Button } from '../../atoms/Button/Button'

const meta: Meta<typeof Navbar> = {
  component: Navbar,
  title: 'Organisms/Navbar',
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Navbar>

const items = [
  { label: 'Home', href: '/', active: true },
  { label: 'Docs', href: '/docs' },
  { label: 'Pricing', href: '/pricing' },
]

export const Default: Story = {
  args: {
    logo: <span className="text-lg font-bold text-foreground">base-ds</span>,
    items,
    actions: <Button size="sm">Sign in</Button>,
  },
}

export const Sticky: Story = {
  args: {
    logo: <span className="text-lg font-bold text-foreground">base-ds</span>,
    items,
    actions: <Button size="sm">Sign in</Button>,
    sticky: true,
  },
}

export const WithoutActions: Story = {
  args: {
    logo: <span className="text-lg font-bold text-foreground">base-ds</span>,
    items,
  },
}

export const LogoOnly: Story = {
  args: {
    logo: <span className="text-lg font-bold text-foreground">base-ds</span>,
  },
}
