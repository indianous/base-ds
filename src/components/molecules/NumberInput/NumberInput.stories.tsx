import type { Meta, StoryObj } from '@storybook/react'
import { FormField } from '../FormField/FormField'
import { NumberInput } from './NumberInput'

const meta: Meta<typeof NumberInput> = {
  component: NumberInput,
  title: 'Molecules/NumberInput',
  tags: ['autodocs'],
  args: { 'aria-label': 'Quantity' },
}

export default meta

type Story = StoryObj<typeof NumberInput>

export const Default: Story = { args: { id: 'qty', defaultValue: 1 } }

export const WithMinMax: Story = {
  args: { id: 'qty-minmax', value: 5, min: 0, max: 10, onChange: () => {} },
}

export const Disabled: Story = { args: { id: 'qty-disabled', value: 3, disabled: true } }

export const InFormField: Story = {
  render: (args) => (
    <FormField id="qty-field" label="Quantity" error="Only 10 items left in stock">
      <NumberInput {...args} aria-label={undefined} />
    </FormField>
  ),
  args: { id: 'qty-field', value: 12, onChange: () => {} },
}
