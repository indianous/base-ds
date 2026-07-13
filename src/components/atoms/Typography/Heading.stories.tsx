import type { Meta, StoryObj } from '@storybook/react'
import { Heading } from './Heading'

const meta: Meta<typeof Heading> = {
  component: Heading,
  title: 'Atoms/Typography/Heading',
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj<typeof Heading>

export const Default: Story = {
  args: { children: 'Design System Heading', size: '2xl', weight: 'semibold' },
}

export const H1Large: Story = {
  args: { as: 'h1', size: '4xl', weight: 'bold', children: 'Page Title' },
}

export const H3Medium: Story = {
  args: { as: 'h3', size: 'xl', weight: 'medium', children: 'Section Heading' },
}

export const AllSizes: Story = {
  render: () => (
    <div className="space-y-4">
      <Heading size="xl">Heading XL</Heading>
      <Heading size="2xl">Heading 2XL</Heading>
      <Heading size="3xl">Heading 3XL</Heading>
      <Heading size="4xl">Heading 4XL</Heading>
    </div>
  ),
}
