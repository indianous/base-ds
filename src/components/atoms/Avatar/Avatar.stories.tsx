import type { Meta, StoryObj } from '@storybook/react'
import { Avatar } from './Avatar'

const meta: Meta<typeof Avatar> = {
  component: Avatar,
  title: 'Atoms/Avatar',
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof Avatar>

export const WithImage: Story = {
  args: { src: 'https://i.pravatar.cc/150?img=1', alt: 'John Doe', size: 'md' },
}

export const WithFallback: Story = {
  args: { alt: 'John Doe', fallback: 'JD', size: 'md' },
}

export const Square: Story = {
  args: { alt: 'User', fallback: 'AB', size: 'lg', shape: 'square' },
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar alt="User" fallback="U" size="sm" />
      <Avatar alt="User" fallback="U" size="md" />
      <Avatar alt="User" fallback="U" size="lg" />
      <Avatar alt="User" fallback="U" size="xl" />
    </div>
  ),
}
