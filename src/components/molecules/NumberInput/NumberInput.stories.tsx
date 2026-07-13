import type { Meta, StoryObj } from '@storybook/react'
import { NumberInput } from './NumberInput'

const meta: Meta<typeof NumberInput> = {
  component: NumberInput,
  title: 'Molecules/NumberInput',
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj<typeof NumberInput>

export const Default: Story = { args: { id: 'qty', defaultValue: 1 } }

export const WithMinMax: Story = {
  args: { id: 'qty-minmax', value: 5, min: 0, max: 10, onChange: () => {} },
}

export const Disabled: Story = { args: { id: 'qty-disabled', value: 3, disabled: true } }
