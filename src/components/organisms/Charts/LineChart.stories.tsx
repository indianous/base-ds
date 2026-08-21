import type { Meta, StoryObj } from '@storybook/react'
import { LineChart } from './LineChart'

const meta: Meta<typeof LineChart> = {
  component: LineChart,
  title: 'Organisms/Charts/LineChart',
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof LineChart>

export const SingleSeries: Story = {
  args: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    series: [{ name: 'Revenue', values: [4200, 5100, 4800, 6200, 7100, 6900] }],
  },
}

export const MultiSeries: Story = {
  args: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    series: [
      { name: 'This year', values: [4200, 5100, 4800, 6200, 7100, 6900] },
      { name: 'Last year', values: [3600, 4200, 4100, 4900, 5300, 5600] },
    ],
  },
}
