import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'
import { Icon } from '../Icon/Icon'

const meta: Meta<typeof Button> = {
  component: Button,
  title: 'Atoms/Button',
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof Button>

export const Primary: Story = { args: { children: 'Primary Button', variant: 'primary' } }
export const Secondary: Story = { args: { children: 'Secondary Button', variant: 'secondary' } }
export const Ghost: Story = { args: { children: 'Ghost Button', variant: 'ghost' } }
export const Outline: Story = { args: { children: 'Outline Button', variant: 'outline' } }
export const Danger: Story = { args: { children: 'Delete', variant: 'danger' } }
export const Small: Story = { args: { children: 'Small', size: 'sm' } }
export const Large: Story = { args: { children: 'Large', size: 'lg' } }
export const Loading: Story = { args: { children: 'Submit', isLoading: true } }
export const Disabled: Story = { args: { children: 'Disabled', disabled: true } }
export const WithIcons: Story = {
  args: { children: 'With Icon', leftIcon: <Icon name="Search" size="sm" /> },
}
export const AsLink: Story = {
  args: { as: 'a', href: 'https://example.com/docs', children: 'Go to docs' },
}
export const AsLinkDisabled: Story = {
  args: { as: 'a', href: 'https://example.com/docs', disabled: true, children: 'Go to docs' },
}
export const Brutalist: Story = { args: { children: 'Brutalist', variant: 'brutalist' } }
export const BrutalistDisabled: Story = {
  args: { children: 'Brutalist', variant: 'brutalist', disabled: true },
}
export const BrutalistAsLink: Story = {
  args: { as: 'a', href: '#', variant: 'brutalist', children: 'Brutalist link' },
}
export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-3 flex-wrap p-2">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="brutalist">Brutalist</Button>
    </div>
  ),
}
