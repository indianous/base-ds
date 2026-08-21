import type { Meta, StoryObj } from '@storybook/react'
import { BarChart } from './BarChart'

const meta: Meta<typeof BarChart> = {
  component: BarChart,
  title: 'Organisms/Charts/BarChart',
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof BarChart>

export const ConversionByChannel: Story = {
  args: {
    data: [
      { label: 'Organic search', values: [420] },
      { label: 'Paid search', values: [180] },
      { label: 'Social', values: [90] },
      { label: 'Email', values: [60] },
      { label: 'Direct', values: [210] },
    ],
    valueFormatter: (v) => `${v} conv.`,
  },
}

export const RevenueByChannel: Story = {
  args: {
    data: [
      { label: 'Organic search', values: [84200] },
      { label: 'Paid search', values: [36500] },
      { label: 'Social', values: [12800] },
    ],
    valueFormatter: (v) =>
      v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }),
  },
}

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
    data: [
      { label: 'Organic', values: [420] },
      { label: 'Paid', values: [180] },
      { label: 'Social', values: [90] },
      { label: 'Email', values: [60] },
    ],
  },
}

export const MultiSeries: Story = {
  args: {
    data: [
      { label: 'Organic search', values: [420, 380] },
      { label: 'Paid search', values: [180, 150] },
      { label: 'Social', values: [90, 110] },
    ],
    seriesNames: ['This month', 'Last month'],
  },
}
