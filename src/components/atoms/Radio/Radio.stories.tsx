import type { Meta, StoryObj } from '@storybook/react'
import { Radio } from './Radio'

const meta: Meta<typeof Radio> = {
  component: Radio,
  title: 'Atoms/Radio',
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof Radio>

export const Default: Story = { args: { id: 'radio-a', value: 'a', label: 'Option A' } }
export const Selected: Story = { args: { id: 'radio-b', value: 'b', label: 'Option B', checked: true, onChange: () => {} } }
export const Disabled: Story = { args: { id: 'radio-c', value: 'c', label: 'Disabled option', disabled: true } }
export const RadioGroup: Story = {
  render: () => (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-foreground mb-2">Select an option</legend>
      <Radio id="opt-a" name="options" value="a" label="Option A" />
      <Radio id="opt-b" name="options" value="b" label="Option B" />
      <Radio id="opt-c" name="options" value="c" label="Option C" />
    </fieldset>
  ),
}
