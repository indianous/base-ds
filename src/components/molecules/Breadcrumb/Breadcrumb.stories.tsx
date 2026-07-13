import type { Meta, StoryObj } from '@storybook/react'
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
