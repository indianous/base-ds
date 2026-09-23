import type { Meta, StoryObj } from '@storybook/react'
import { Icon } from './Icon'

const meta: Meta<typeof Icon> = {
  component: Icon,
  title: 'Atoms/Icon',
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof Icon>

export const Default: Story = { args: { name: 'Search', size: 'md' } }
export const Decorative: Story = { args: { name: 'Star', size: 'lg' } }
export const Meaningful: Story = {
  args: { name: 'AlertCircle', size: 'md', 'aria-label': 'Warning' },
}
export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Icon name="Heart" size="sm" aria-label="Heart small" />
      <Icon name="Heart" size="md" aria-label="Heart medium" />
      <Icon name="Heart" size="lg" aria-label="Heart large" />
      <Icon name="Heart" size="xl" aria-label="Heart extra large" />
    </div>
  ),
}
