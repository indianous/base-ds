import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Dialog } from './Dialog'
import { Button } from '../../atoms/Button/Button'

const meta: Meta<typeof Dialog> = {
  component: Dialog,
  title: 'Organisms/Dialog',
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Dialog>

export const Open: Story = {
  args: {
    open: true,
    onClose: () => {},
    title: 'Delete item',
    description: 'This action cannot be undone.',
    footer: (
      <>
        <Button variant="ghost" size="sm">
          Cancel
        </Button>
        <Button variant="danger" size="sm">
          Delete
        </Button>
      </>
    ),
    children: <p>Are you sure you want to delete this item?</p>,
  },
}

export const Interactive: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open dialog</Button>
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          title="Confirm action"
          description="Click outside, press Escape, or use the close button to dismiss."
        >
          <p>Dialog body content.</p>
        </Dialog>
      </>
    )
  },
}
