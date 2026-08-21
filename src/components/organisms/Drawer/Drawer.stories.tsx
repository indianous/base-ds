import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Drawer } from './Drawer'
import { Button } from '../../atoms/Button/Button'

const meta: Meta<typeof Drawer> = {
  component: Drawer,
  title: 'Organisms/Drawer',
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Drawer>

export const Right: Story = {
  args: {
    open: true,
    onClose: () => {},
    side: 'right',
    title: 'Settings',
    children: <p>Drawer content goes here.</p>,
  },
}

export const Left: Story = {
  args: {
    open: true,
    onClose: () => {},
    side: 'left',
    title: 'Settings',
    children: <p>Drawer content goes here.</p>,
  },
}

export const Top: Story = {
  args: {
    open: true,
    onClose: () => {},
    side: 'top',
    title: 'Settings',
    children: <p>Drawer content goes here.</p>,
  },
}

export const Bottom: Story = {
  args: {
    open: true,
    onClose: () => {},
    side: 'bottom',
    title: 'Settings',
    children: <p>Drawer content goes here.</p>,
  },
}

function InteractiveDrawer() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open drawer</Button>
      <Drawer open={open} onClose={() => setOpen(false)} title="Settings" side="right">
        <p>Drawer content goes here.</p>
      </Drawer>
    </>
  )
}

export const Interactive: Story = {
  render: () => <InteractiveDrawer />,
}
