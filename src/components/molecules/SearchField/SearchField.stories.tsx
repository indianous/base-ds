import type { Meta, StoryObj } from '@storybook/react'
import { SearchField } from './SearchField'

const meta: Meta<typeof SearchField> = {
  component: SearchField,
  title: 'Molecules/SearchField',
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof SearchField>

export const Default: Story = {
  args: {
    onSearch: (v) => console.log('Search:', v),
    placeholder: 'Search...',
  },
}

export const Loading: Story = {
  args: {
    onSearch: () => {},
    isLoading: true,
    defaultValue: 'react',
  },
}

export const WithDefaultValue: Story = {
  args: {
    onSearch: () => {},
    defaultValue: 'typescript',
  },
}

export const Localized: Story = {
  args: {
    onSearch: (v) => console.log('Buscar:', v),
    id: 'products-search',
    label: 'Buscar produtos',
    buttonLabel: 'Buscar',
    placeholder: 'Buscar por nome...',
  },
}

export const IconOnlyButton: Story = {
  args: {
    onSearch: (v) => console.log('Buscar:', v),
    buttonLabel: 'Buscar',
    buttonIconOnly: true,
    placeholder: 'Buscar por nome...',
  },
}
