import type { Meta, StoryObj } from '@storybook/react'
import { Funnel } from './Funnel'

const meta: Meta<typeof Funnel> = {
  component: Funnel,
  title: 'Organisms/Charts/Funnel',
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof Funnel>

export const ConversionFunnel: Story = {
  args: {
    steps: [
      { label: 'Visitors', value: 12500 },
      { label: 'Added to cart', value: 4200 },
      { label: 'Checkout started', value: 2100 },
      { label: 'Payment info added', value: 1450 },
      { label: 'Purchased', value: 980 },
    ],
  },
}

export const FewSteps: Story = {
  args: {
    steps: [
      { label: 'Signed up', value: 3000 },
      { label: 'Activated', value: 1200 },
    ],
  },
}
