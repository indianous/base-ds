import type { Meta, StoryObj } from '@storybook/react'
import { FormField } from '../../molecules/FormField/FormField'
import { Select } from './Select'

const options = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'angular', label: 'Angular' },
  { value: 'svelte', label: 'Svelte' },
]

const meta: Meta<typeof Select> = {
  component: Select,
  title: 'Atoms/Select',
  tags: ['autodocs'],
  args: { 'aria-label': 'Framework' },
}
export default meta
type Story = StoryObj<typeof Select>

export const Default: Story = {
  args: { id: 'framework', options, placeholder: 'Select a framework...', state: 'default' },
}
export const WithValue: Story = {
  args: { id: 'framework-v', options, value: 'react', onChange: () => {} },
}
export const Error: Story = {
  args: { id: 'framework-err', options, state: 'error', placeholder: 'Required field' },
}
export const Success: Story = {
  args: { id: 'framework-ok', options, state: 'success', value: 'vue', onChange: () => {} },
}
export const Disabled: Story = {
  args: { id: 'framework-dis', options, disabled: true, placeholder: 'Disabled' },
}

export const InFormField: Story = {
  render: (args) => (
    <FormField id="framework-field" label="Framework" hint="Used to scaffold the project">
      <Select {...args} aria-label={undefined} />
    </FormField>
  ),
  args: { options, placeholder: 'Select a framework...' },
}
