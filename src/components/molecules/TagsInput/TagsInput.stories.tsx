import type { Meta, StoryObj } from '@storybook/react'
import { TagsInput } from './TagsInput'

const meta: Meta<typeof TagsInput> = {
  component: TagsInput,
  title: 'Molecules/TagsInput',
  tags: ['autodocs'],
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
