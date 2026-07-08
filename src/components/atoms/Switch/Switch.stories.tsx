import type { Meta, StoryObj } from '@storybook/react'
import { Switch } from './Switch'

const meta: Meta<typeof Switch> = {
  component: Switch,
  title: 'Atoms/Switch',
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof Switch>

export const Default: Story = {
  args: {
    id: 'switch-default',
    label: 'Enable notifications',
    checked: false,
    onChange: () => {},
  },
}

export const Checked: Story = {
  args: {
    id: 'switch-on',
    label: 'Dark mode',
    checked: true,
    onChange: () => {},
  },
}

export const Disabled: Story = {
  args: {
    id: 'switch-disabled',
    label: 'Disabled',
    disabled: true,
  },
}

export const DisabledChecked: Story = {
  args: {
    id: 'switch-disabled-on',
    label: 'Disabled (on)',
    checked: true,
    disabled: true,
    onChange: () => {},
  },
}
