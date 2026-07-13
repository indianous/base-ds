import type { Meta, StoryObj } from '@storybook/react'
import { PinInput } from './PinInput'

const meta: Meta<typeof PinInput> = {
  component: PinInput,
  title: 'Molecules/PinInput',
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj<typeof PinInput>

export const Default: Story = { args: { length: 4 } }

export const SixDigit: Story = { args: { length: 6 } }

export const Masked: Story = { args: { length: 4, mask: true } }

export const Disabled: Story = { args: { length: 4, disabled: true } }
