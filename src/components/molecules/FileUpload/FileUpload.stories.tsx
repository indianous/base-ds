import type { Meta, StoryObj } from '@storybook/react'
import { FileUpload } from './FileUpload'

const meta: Meta<typeof FileUpload> = {
  component: FileUpload,
  title: 'Molecules/FileUpload',
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof FileUpload>

export const Default: Story = { args: {} }

export const ImageOnly: Story = { args: { accept: 'image/*', multiple: true } }

export const WithSizeLimit: Story = { args: { maxSize: 5 * 1024 * 1024, multiple: true } }

export const NoDragDrop: Story = { args: { dragAndDrop: false } }

export const Disabled: Story = { args: { disabled: true } }
