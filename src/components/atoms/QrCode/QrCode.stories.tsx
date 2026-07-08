import type { Meta, StoryObj } from '@storybook/react'
import { QrCode } from './QrCode'

const meta: Meta<typeof QrCode> = {
  component: QrCode,
  title: 'Atoms/QrCode',
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof QrCode>

export const Default: Story = { args: { value: 'https://example.com', size: 128 } }
export const Large: Story = { args: { value: 'https://example.com', size: 256 } }
export const HighCorrection: Story = {
  args: { value: 'https://example.com', size: 200, errorCorrection: 'H' },
}
