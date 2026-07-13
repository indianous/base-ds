import type { Meta, StoryObj } from '@storybook/react'
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
