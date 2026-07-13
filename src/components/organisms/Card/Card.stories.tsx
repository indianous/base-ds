import type { Meta, StoryObj } from '@storybook/react'
import { Card } from './Card'

const meta: Meta<typeof Card> = {
  component: Card,
  title: 'Organisms/Card',
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Card>

export const Flat: Story = {
  args: {
    variant: 'flat',
    children: <p>Card content goes here.</p>,
  },
}

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    children: <p>Card content goes here.</p>,
  },
}

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    children: <p>Card content goes here.</p>,
  },
}

export const WithHeaderAndFooter: Story = {
  args: {
    variant: 'outlined',
    header: <span className="font-semibold text-foreground">Card title</span>,
    footer: <button className="text-sm text-primary">Action</button>,
    children: <p>Card content goes here.</p>,
  },
}
