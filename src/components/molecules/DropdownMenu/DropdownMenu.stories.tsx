import type { Meta, StoryObj } from '@storybook/react'
import { DropdownMenu } from './DropdownMenu'
import { Button } from '../../atoms/Button/Button'
import { Icon } from '../../atoms/Icon/Icon'

const meta: Meta<typeof DropdownMenu> = {
  component: DropdownMenu,
  title: 'Molecules/DropdownMenu',
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof DropdownMenu>

export const Default: Story = {
  args: {
    trigger: <Button>Options</Button>,
    items: [
      { label: 'Edit', onClick: () => {} },
      { label: 'Duplicate', onClick: () => {} },
      { label: 'Archive', onClick: () => {} },
    ],
  },
}

export const WithIcons: Story = {
  args: {
    trigger: <Button>Actions</Button>,
    items: [
      { label: 'Edit', icon: <Icon name="Pencil" size="sm" />, onClick: () => {} },
      { label: 'Duplicate', icon: <Icon name="Copy" size="sm" />, onClick: () => {} },
      { label: 'Share', icon: <Icon name="Share2" size="sm" />, onClick: () => {} },
    ],
  },
}

export const WithSeparatorAndDanger: Story = {
  args: {
    trigger: <Button variant="outline">Options</Button>,
    items: [
      { label: 'Edit', icon: <Icon name="Pencil" size="sm" />, onClick: () => {} },
      { label: 'Duplicate', icon: <Icon name="Copy" size="sm" />, onClick: () => {} },
      { type: 'separator' },
      { label: 'Delete', icon: <Icon name="Trash2" size="sm" />, danger: true, onClick: () => {} },
    ],
  },
}

export const WithLinkItem: Story = {
  args: {
    trigger: <Button>Navigate</Button>,
    items: [
      { label: 'Home', href: '/' },
      { label: 'Docs', href: '/docs' },
      { label: 'Trigger action', onClick: () => {} },
    ],
  },
}

export const WithDisabledItem: Story = {
  args: {
    trigger: <Button>Options</Button>,
    items: [
      { label: 'Edit', onClick: () => {} },
      { label: 'Duplicate (unavailable)', disabled: true },
      { label: 'Delete', danger: true, onClick: () => {} },
    ],
  },
}

export const Positions: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-16 p-16">
      {(['top', 'bottom', 'left', 'right'] as const).map((position) => (
        <DropdownMenu
          key={position}
          trigger={<Button>{position}</Button>}
          position={position}
          items={[
            { label: 'Edit', onClick: () => {} },
            { label: 'Duplicate', onClick: () => {} },
          ]}
        />
      ))}
    </div>
  ),
}

export const AlignEnd: Story = {
  render: () => (
    <div className="flex justify-end">
      <DropdownMenu
        trigger={<Button>Options</Button>}
        align="end"
        items={[
          { label: 'Edit', onClick: () => {} },
          { label: 'Duplicate', onClick: () => {} },
        ]}
      />
    </div>
  ),
}
