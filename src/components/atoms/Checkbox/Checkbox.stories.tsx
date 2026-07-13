import type { Meta, StoryObj } from '@storybook/react'
import { Checkbox } from './Checkbox'

const meta: Meta<typeof Checkbox> = {
  component: Checkbox,
  title: 'Atoms/Checkbox',
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof Checkbox>

export const Default: Story = { args: { id: 'default-checkbox', label: 'Accept terms and conditions' } }
export const Checked: Story = { args: { id: 'checked-checkbox', label: 'Remember me', checked: true, onChange: () => {} } }
export const Indeterminate: Story = { args: { id: 'indeterminate-checkbox', label: 'Select all', indeterminate: true, onChange: () => {} } }
export const Disabled: Story = { args: { id: 'disabled-checkbox', label: 'Disabled option', disabled: true } }
export const DisabledChecked: Story = { args: { id: 'disabled-checked', label: 'Disabled checked', disabled: true, checked: true, onChange: () => {} } }
export const NoLabel: Story = { args: { id: 'no-label-checkbox', 'aria-label': 'Toggle option' } }
