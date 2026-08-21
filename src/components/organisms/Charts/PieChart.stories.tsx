import type { Meta, StoryObj } from '@storybook/react'
import { PieChart } from './PieChart'

const meta: Meta<typeof PieChart> = {
  component: PieChart,
  title: 'Organisms/Charts/PieChart',
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof PieChart>

export const DeviceShare: Story = {
  args: {
    data: [
      { label: 'Desktop', value: 60 },
      { label: 'Mobile', value: 32 },
      { label: 'Tablet', value: 8 },
    ],
  },
}

export const WithOtherBucket: Story = {
  args: {
    data: [
      { label: 'Organic search', value: 40 },
      { label: 'Paid search', value: 25 },
      { label: 'Social', value: 15 },
      { label: 'Email', value: 10 },
      { label: 'Referral', value: 6 },
      { label: 'Direct', value: 4 },
    ],
  },
}
