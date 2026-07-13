import type { Meta, StoryObj } from '@storybook/react'
import { Skeleton } from './Skeleton'

const meta: Meta<typeof Skeleton> = {
  component: Skeleton,
  title: 'Atoms/Skeleton',
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof Skeleton>

export const Line: Story = { args: { variant: 'line', width: '100%', height: 16 } }
export const Circle: Story = { args: { variant: 'circle', width: 48, height: 48 } }
export const Rect: Story = { args: { variant: 'rect', width: '100%', height: 120 } }
export const CardSkeleton: Story = {
  render: () => (
    <div className="space-y-3 p-4 w-64">
      <Skeleton variant="circle" width={48} height={48} />
      <Skeleton variant="line" width="60%" height={16} />
      <Skeleton variant="rect" width="100%" height={100} />
    </div>
  ),
}
