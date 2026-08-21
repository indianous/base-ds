import type { Meta, StoryObj } from '@storybook/react'
import { Candlestick } from './Candlestick'

const meta: Meta<typeof Candlestick> = {
  component: Candlestick,
  title: 'Organisms/Charts/Candlestick',
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof Candlestick>

export const Default: Story = {
  args: {
    data: [
      { label: 'Mon', open: 100, high: 110, low: 95, close: 105 },
      { label: 'Tue', open: 105, high: 108, low: 98, close: 99 },
      { label: 'Wed', open: 99, high: 115, low: 97, close: 112 },
      { label: 'Thu', open: 112, high: 118, low: 108, close: 109 },
      { label: 'Fri', open: 109, high: 121, low: 107, close: 119 },
    ],
    valueFormatter: (v) => `$${v.toFixed(2)}`,
  },
}
