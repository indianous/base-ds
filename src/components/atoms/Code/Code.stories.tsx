import type { Meta, StoryObj } from '@storybook/react'
import { Code } from './Code'

const meta: Meta<typeof Code> = {
  component: Code,
  title: 'Atoms/Code',
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof Code>

export const Default: Story = { args: { children: 'npm install' } }

export const InText: Story = {
  render: () => (
    <p className="text-base text-foreground">
      Install it with <Code>npm install @indianous/base-ds</Code> and import the styles from{' '}
      <Code>@indianous/base-ds/styles</Code>.
    </p>
  ),
}
