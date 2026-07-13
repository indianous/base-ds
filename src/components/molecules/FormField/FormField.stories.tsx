import type { Meta, StoryObj } from '@storybook/react'
import { FormField } from './FormField'
import { Input } from '../../atoms/Input/Input'
import { Select } from '../../atoms/Select/Select'

const meta: Meta<typeof FormField> = {
  component: FormField,
  title: 'Molecules/FormField',
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof FormField>

export const Default: Story = {
  render: () => (
    <FormField label="Email address" id="email">
      <Input id="email" type="email" placeholder="you@example.com" />
    </FormField>
  ),
}

export const WithHint: Story = {
  render: () => (
    <FormField
      label="Username"
      id="username"
      hint="Must be 3–20 characters, letters and numbers only"
    >
      <Input id="username" placeholder="johndoe" />
    </FormField>
  ),
}

export const WithError: Story = {
  render: () => (
    <FormField
      label="Password"
      id="password"
      error="Password must be at least 8 characters"
    >
      <Input id="password" type="password" state="error" />
    </FormField>
  ),
}

export const Required: Story = {
  render: () => (
    <FormField label="Full name" id="fullname" required>
      <Input id="fullname" placeholder="John Doe" />
    </FormField>
  ),
}

export const WithSelect: Story = {
  render: () => (
    <FormField label="Framework" id="framework" hint="Choose your primary framework">
      <Select
        id="framework"
        options={[
          { value: 'react', label: 'React' },
          { value: 'vue', label: 'Vue' },
        ]}
        placeholder="Select..."
      />
    </FormField>
  ),
}
