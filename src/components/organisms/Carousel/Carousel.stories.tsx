import type { Meta, StoryObj } from '@storybook/react'
import { Carousel } from './Carousel'

const meta: Meta<typeof Carousel> = {
  component: Carousel,
  title: 'Organisms/Carousel',
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Carousel>

const slides = [
  <div key="1" className="flex h-48 items-center justify-center bg-muted text-foreground">
    Slide 1
  </div>,
  <div key="2" className="flex h-48 items-center justify-center bg-muted text-foreground">
    Slide 2
  </div>,
  <div key="3" className="flex h-48 items-center justify-center bg-muted text-foreground">
    Slide 3
  </div>,
]

export const Default: Story = {
  args: { items: slides },
}

export const Looping: Story = {
  args: { items: slides, loop: true },
}

export const WithoutDots: Story = {
  args: { items: slides, showDots: false },
}

export const WithoutArrows: Story = {
  args: { items: slides, showArrows: false },
}
