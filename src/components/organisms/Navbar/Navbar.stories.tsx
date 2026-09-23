import type { Meta, StoryObj } from '@storybook/react'
import { Navbar } from './Navbar'
import type { NavItem } from './Navbar'
import { Button } from '../../atoms/Button/Button'
import { Icon } from '../../atoms/Icon/Icon'
import { SearchField } from '../../molecules/SearchField/SearchField'

const meta: Meta<typeof Navbar> = {
  component: Navbar,
  title: 'Organisms/Navbar',
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Navbar>

const items: NavItem[] = [
  { label: 'Home', href: '/', active: true },
  { label: 'Docs', href: '/docs' },
  { label: 'Pricing', href: '/pricing' },
]

const itemsWithDropdown: NavItem[] = [
  { label: 'Home', href: '/', active: true },
  {
    type: 'dropdown',
    label: 'Resources',
    items: [
      { label: 'Docs', href: '/docs' },
      { label: 'Blog', href: '/blog' },
      { type: 'separator' },
      { label: 'Support', onClick: () => {} },
    ],
  },
  { label: 'Pricing', href: '/pricing' },
]

const logo = <span className="text-lg font-bold text-foreground">base-ds</span>

export const Default: Story = {
  args: {
    logo,
    items,
    actions: [
      <Button key="sign-in" size="sm">
        Sign in
      </Button>,
    ],
  },
}

export const Sticky: Story = {
  args: {
    logo,
    items,
    actions: [
      <Button key="sign-in" size="sm">
        Sign in
      </Button>,
    ],
    sticky: true,
  },
}

export const WithoutActions: Story = {
  args: {
    logo,
    items,
  },
}

export const LogoOnly: Story = {
  args: {
    logo,
  },
}

export const WithDropdownItem: Story = {
  args: {
    logo,
    items: itemsWithDropdown,
    actions: [
      <Button key="sign-in" size="sm">
        Sign in
      </Button>,
    ],
  },
}

export const WithMultipleActions: Story = {
  args: {
    logo,
    items,
    actions: [
      <Button key="github" variant="ghost" size="sm" leftIcon={<Icon name="GitBranch" size="sm" />}>
        GitHub
      </Button>,
      <Button key="sign-in" variant="outline" size="sm">
        Sign in
      </Button>,
      <Button key="cta" size="sm">
        Get Started
      </Button>,
    ],
  },
}

export const WithSearch: Story = {
  args: {
    logo,
    items,
    search: <SearchField placeholder="Search..." onSearch={() => {}} />,
    actions: [
      <Button key="sign-in" size="sm">
        Sign in
      </Button>,
    ],
  },
}

export const MobileDrawer: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  args: {
    logo,
    items: itemsWithDropdown,
    search: <SearchField placeholder="Search..." onSearch={() => {}} />,
    actions: [
      <Button key="sign-in" size="sm">
        Sign in
      </Button>,
    ],
  },
  render: (args) => (
    <div className="max-w-sm border border-border rounded-lg overflow-hidden">
      <Navbar {...args} />
    </div>
  ),
}

export const MobileActionsDrawer: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  args: {
    logo,
    items,
    actions: [
      <Button
        key="notifications"
        variant="ghost"
        size="sm"
        leftIcon={<Icon name="Bell" size="sm" />}
      >
        Notifications
      </Button>,
      <Button key="sign-in" variant="outline" size="sm">
        Sign in
      </Button>,
      <Button key="cta" size="sm">
        Get Started
      </Button>,
    ],
  },
  render: (args) => (
    <div className="max-w-sm border border-border rounded-lg overflow-hidden">
      <Navbar {...args} />
    </div>
  ),
}
