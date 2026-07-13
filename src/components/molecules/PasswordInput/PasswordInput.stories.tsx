import type { Meta, StoryObj } from '@storybook/react'
import { PasswordInput } from './PasswordInput'

const meta: Meta<typeof PasswordInput> = {
  component: PasswordInput,
  title: 'Molecules/PasswordInput',
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj<typeof PasswordInput>

export const Default: Story = {
  args: { id: 'password', placeholder: 'Enter your password' },
}

export const WithError: Story = {
  args: { id: 'pwd-err', placeholder: 'Invalid password', state: 'error' },
}

export const Disabled: Story = {
  args: { id: 'pwd-dis', placeholder: 'Disabled', disabled: true },
}
