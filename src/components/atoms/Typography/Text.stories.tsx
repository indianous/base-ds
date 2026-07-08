import type { Meta, StoryObj } from '@storybook/react'
import { Text } from './Text'

const meta: Meta<typeof Text> = {
  component: Text,
  title: 'Atoms/Typography/Text',
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof Text>

export const Default: Story = {
  args: {
    children: 'The quick brown fox jumps over the lazy dog.',
    size: 'md',
    color: 'default',
  },
}

export const Muted: Story = {
  args: {
    children: 'Muted helper text',
    color: 'muted',
    size: 'sm',
  },
}

export const Destructive: Story = {
  args: {
    children: 'Error message text',
    color: 'destructive',
    size: 'sm',
  },
}

export const AllSizes: Story = {
  render: () => (
    <div className="space-y-2">
      <Text size="xs">Extra small text</Text>
      <Text size="sm">Small text</Text>
      <Text size="md">Medium text (default)</Text>
      <Text size="lg">Large text</Text>
    </div>
  ),
}
