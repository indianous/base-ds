import type { Meta, StoryObj } from '@storybook/react'
import { FormField } from '../FormField/FormField'
import { TagsInput } from './TagsInput'

const meta: Meta<typeof TagsInput> = {
  component: TagsInput,
  title: 'Molecules/TagsInput',
  tags: ['autodocs'],
  args: { 'aria-label': 'Tags' },
}

export default meta

type Story = StoryObj<typeof TagsInput>

export const Default: Story = {
  args: { id: 'tags', placeholder: 'Add a tag...' },
}

export const WithTags: Story = {
  args: {
    id: 'tags-pre',
    value: ['React', 'TypeScript', 'Tailwind'],
    onChange: () => {},
  },
}

export const MaxTags: Story = {
  args: {
    id: 'tags-max',
    value: ['React', 'Vue'],
    maxTags: 3,
    placeholder: 'Max 3 tags',
    onChange: () => {},
  },
}

export const Disabled: Story = {
  args: { id: 'tags-dis', value: ['React'], disabled: true },
}

export const InFormField: Story = {
  render: (args) => (
    <FormField id="tags-field" label="Tags" hint="Press Enter or comma to add a tag">
      <TagsInput {...args} aria-label={undefined} />
    </FormField>
  ),
  args: { id: 'tags-field', value: ['React'], onChange: () => {} },
}
