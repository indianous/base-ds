import type { Meta, StoryObj } from '@storybook/react'
import { Correlation } from './Correlation'

const meta: Meta<typeof Correlation> = {
  component: Correlation,
  title: 'Organisms/Charts/Correlation',
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof Correlation>

export const AdSpendVsRevenue: Story = {
  args: {
    xLabel: 'Ad spend (R$)',
    yLabel: 'Revenue (R$)',
    points: [
      { x: 500, y: 3200, label: 'Week 1' },
      { x: 800, y: 4100, label: 'Week 2' },
      { x: 650, y: 3800, label: 'Week 3' },
      { x: 1200, y: 6200, label: 'Week 4' },
      { x: 950, y: 5100, label: 'Week 5' },
      { x: 1400, y: 7300, label: 'Week 6' },
    ],
  },
}

export const ByPlanTier: Story = {
  args: {
    xLabel: 'Seats',
    yLabel: 'MRR (R$)',
    points: [
      { x: 3, y: 90, label: 'Acme', group: 'Free' },
      { x: 12, y: 480, label: 'Globex', group: 'Pro' },
      { x: 40, y: 2100, label: 'Initech', group: 'Enterprise' },
      { x: 5, y: 150, label: 'Umbrella', group: 'Free' },
      { x: 20, y: 900, label: 'Soylent', group: 'Pro' },
    ],
  },
}
