import type { Meta, StoryObj } from '@storybook/react'
import { Textarea } from './Textarea'

const meta: Meta<typeof Textarea> = {
  component: Textarea,
  title: 'Atoms/Textarea',
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof Textarea>

export const Default: Story = {
  args: { id: 'default-textarea', placeholder: 'Enter text...', size: 'md', state: 'default' },
}
export const Error: Story = {
  args: { id: 'error-textarea', placeholder: 'Invalid input', state: 'error', value: 'Too short' },
}
export const Success: Story = {
  args: {
    id: 'success-textarea',
    placeholder: 'Valid input',
    state: 'success',
    value: 'Looks good',
  },
}
export const Small: Story = {
  args: { id: 'small-textarea', placeholder: 'Small textarea', size: 'sm' },
}
export const Large: Story = {
  args: { id: 'large-textarea', placeholder: 'Large textarea', size: 'lg' },
}
export const Disabled: Story = {
  args: { id: 'disabled-textarea', placeholder: 'Disabled', disabled: true },
}
