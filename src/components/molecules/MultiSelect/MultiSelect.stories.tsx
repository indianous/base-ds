import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FormField } from '../FormField/FormField'
import { MultiSelect } from './MultiSelect'
import type { MultiSelectOption, MultiSelectProps } from './MultiSelect'

const meta: Meta<typeof MultiSelect> = {
  component: MultiSelect,
  title: 'Molecules/MultiSelect',
  tags: ['autodocs'],
  args: { 'aria-label': 'Categories' },
}
export default meta

type Story = StoryObj<typeof MultiSelect>

const categoryOptions: MultiSelectOption[] = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'books', label: 'Books' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'home', label: 'Home & Garden' },
  { value: 'sports', label: 'Sports' },
  { value: 'toys', label: 'Toys' },
  { value: 'beauty', label: 'Beauty' },
]

function ControlledMultiSelect(args: MultiSelectProps) {
  const [value, setValue] = useState<string[]>(args.value)
  return <MultiSelect {...args} value={value} onChange={setValue} />
}

export const Default: Story = {
  render: (args) => <ControlledMultiSelect {...args} />,
  args: {
    id: 'categories',
    options: categoryOptions,
    value: ['electronics'],
    onChange: () => {},
    placeholder: 'Select categories...',
  },
}

export const Empty: Story = {
  render: (args) => <ControlledMultiSelect {...args} />,
  args: {
    id: 'categories-empty',
    options: categoryOptions,
    value: [],
    onChange: () => {},
    placeholder: 'Select categories...',
  },
}

export const Disabled: Story = {
  args: {
    id: 'categories-disabled',
    options: categoryOptions,
    value: ['books'],
    onChange: () => {},
    disabled: true,
  },
}

export const InFormField: Story = {
  render: (args) => (
    <FormField id="categories-field" label="Categories" hint="Pick at least one category">
      <ControlledMultiSelect {...args} aria-label={undefined} />
    </FormField>
  ),
  args: {
    id: 'categories-field',
    options: categoryOptions,
    value: ['books'],
    onChange: () => {},
  },
}
