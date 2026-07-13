import type { Meta, StoryObj } from '@storybook/react'
import { Toast } from './Toast'
import { ToastProvider } from './ToastProvider'
import { ToastViewport } from './ToastViewport'
import { useToast } from './useToast'
import { Button } from '../../atoms/Button/Button'

const meta: Meta<typeof Toast> = {
  component: Toast,
  title: 'Organisms/Toast',
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Toast>

export const Default: Story = {
  args: {
    variant: 'default',
    title: 'Update available',
    description: 'A new version of the app is ready to install.',
    onDismiss: () => {},
  },
}

export const Success: Story = {
  args: {
    variant: 'success',
    title: 'Saved',
    description: 'Your changes were saved successfully.',
    onDismiss: () => {},
  },
}

export const Warning: Story = {
  args: {
    variant: 'warning',
    title: 'Storage almost full',
    description: 'You are using 90% of your available storage.',
    onDismiss: () => {},
  },
}

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    title: 'Something went wrong',
    description: 'We could not save your changes. Please try again.',
    onDismiss: () => {},
  },
}

export const Info: Story = {
  args: {
    variant: 'info',
    title: 'Heads up',
    description: 'Scheduled maintenance starts at 10 PM.',
    onDismiss: () => {},
  },
}

export const WithAction: Story = {
  args: {
    variant: 'default',
    title: 'Message deleted',
    action: { label: 'Undo', onClick: () => {} },
    onDismiss: () => {},
  },
}

function ToastDemo() {
  const { toast } = useToast()

  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => toast({ title: 'Default notification' })}>Default</Button>
      <Button
        onClick={() => toast({ variant: 'success', title: 'Saved', description: 'Changes saved.' })}
      >
        Success
      </Button>
      <Button
        onClick={() =>
          toast({ variant: 'warning', title: 'Storage almost full', description: '90% used.' })
        }
      >
        Warning
      </Button>
      <Button
        onClick={() =>
          toast({ variant: 'destructive', title: 'Error', description: 'Something failed.' })
        }
      >
        Destructive
      </Button>
      <Button
        onClick={() =>
          toast({
            title: 'Persistent notification',
            description: 'This one stays until dismissed.',
            duration: 0,
          })
        }
      >
        Persistent (no auto-dismiss)
      </Button>
      <Button
        onClick={() =>
          toast({
            title: 'Message deleted',
            action: { label: 'Undo', onClick: () => {} },
          })
        }
      >
        With action
      </Button>
    </div>
  )
}

export const Interactive: Story = {
  render: () => (
    <ToastProvider>
      <ToastDemo />
      <ToastViewport />
    </ToastProvider>
  ),
}
