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

export const CustomLabels: Story = {
  args: {
    maxSize: 5 * 1024 * 1024,
    multiple: true,
    label: 'Enviar arquivos',
    dropzoneMessage: 'Arraste arquivos ou clique para escolher',
    removeFileLabel: (fileName) => `Remover ${fileName}`,
    maxSizeMessage: (maxSize) => `O arquivo passa do limite de ${maxSize}`,
  },
}

export const CustomLabelsNoDragDrop: Story = {
  args: { dragAndDrop: false, label: 'Enviar arquivos', selectFilesLabel: 'Escolher arquivos' },
}
