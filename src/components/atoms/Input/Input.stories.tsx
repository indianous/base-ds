import type { Meta, StoryObj } from '@storybook/react'
import { Input } from './Input'

const meta: Meta<typeof Input> = {
  component: Input,
  title: 'Atoms/Input',
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof Input>

export const Default: Story = { args: { id: 'default-input', placeholder: 'Enter text...', size: 'md', state: 'default' } }
export const Error: Story = { args: { id: 'error-input', placeholder: 'Invalid input', state: 'error', value: 'bad@value' } }
export const Success: Story = { args: { id: 'success-input', placeholder: 'Valid input', state: 'success', value: 'good@value.com' } }
export const Small: Story = { args: { id: 'small-input', placeholder: 'Small input', size: 'sm' } }
export const Large: Story = { args: { id: 'large-input', placeholder: 'Large input', size: 'lg' } }
export const Disabled: Story = { args: { id: 'disabled-input', placeholder: 'Disabled', disabled: true } }
export const Password: Story = { args: { id: 'password-input', type: 'password', placeholder: 'Enter password' } }
