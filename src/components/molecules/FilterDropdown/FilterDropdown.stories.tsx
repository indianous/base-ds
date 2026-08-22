import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FilterDropdown } from './FilterDropdown'
import type { FilterDropdownOption, FilterDropdownProps } from './FilterDropdown'

const meta: Meta<typeof FilterDropdown> = {
  component: FilterDropdown,
  title: 'Molecules/FilterDropdown',
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof FilterDropdown>

const statusOptions: FilterDropdownOption[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

function ControlledFilterDropdown(args: FilterDropdownProps) {
  const [value, setValue] = useState<string[]>(args.value)
  return <FilterDropdown {...args} value={value} onApply={setValue} />
}

export const Default: Story = {
  render: (args) => <ControlledFilterDropdown {...args} />,
  args: {
    label: 'Status',
    options: statusOptions,
    value: [],
    onApply: () => {},
  },
}

export const WithSelection: Story = {
  render: (args) => <ControlledFilterDropdown {...args} />,
  args: {
    label: 'Status',
    options: statusOptions,
    value: ['pending', 'shipped'],
    onApply: () => {},
  },
}

export const Empty: Story = {
  render: (args) => <ControlledFilterDropdown {...args} />,
  args: {
    label: 'Status',
    options: statusOptions,
    value: [],
    onApply: () => {},
  },
}

export const Disabled: Story = {
  args: {
    label: 'Status',
    options: statusOptions,
    value: ['pending'],
    onApply: () => {},
    disabled: true,
  },
}

export const AlignEnd: Story = {
  render: (args) => (
    <div className="flex justify-end">
      <ControlledFilterDropdown {...args} />
    </div>
  ),
  args: {
    label: 'Status',
    options: statusOptions,
    value: [],
    onApply: () => {},
    align: 'end',
  },
}

export const InOverflowContainer: Story = {
  render: (args) => (
    <div className="h-24 w-64 overflow-hidden rounded-md border border-border p-4">
      <ControlledFilterDropdown {...args} />
    </div>
  ),
  args: {
    label: 'Status',
    options: statusOptions,
    value: [],
    onApply: () => {},
  },
}
