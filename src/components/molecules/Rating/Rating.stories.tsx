import type { Meta, StoryObj } from '@storybook/react'
import { Rating } from './Rating'

const meta: Meta<typeof Rating> = {
  component: Rating,
  title: 'Molecules/Rating',
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Rating>

export const Default: Story = { args: { value: 0 } }
export const WithValue: Story = { args: { value: 3, max: 5 } }
export const ReadOnly: Story = { args: { value: 4, readOnly: true } }
export const Small: Story = { args: { value: 3, size: 'sm' } }
export const Large: Story = { args: { value: 2, size: 'lg' } }
export const TenStars: Story = { args: { value: 7, max: 10 } }
