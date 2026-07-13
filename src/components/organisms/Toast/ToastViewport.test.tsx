import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { ToastProvider } from './ToastProvider'
import { ToastViewport } from './ToastViewport'
import { useToast } from './useToast'

function TestTrigger() {
  const { toast } = useToast()
  return (
    <div>
      <button onClick={() => toast({ title: 'Saved', variant: 'success' })}>Add success</button>
      <button onClick={() => toast({ title: 'Failed', variant: 'destructive' })}>
        Add destructive
      </button>
    </div>
  )
}

function renderViewport() {
  return render(
    <ToastProvider>
      <TestTrigger />
      <ToastViewport />
    </ToastProvider>,
  )
}

describe('ToastViewport', () => {
  it('renders inside a portal on document.body', async () => {
    const user = userEvent.setup()
    const { container } = renderViewport()
    await user.click(screen.getByRole('button', { name: 'Add success' }))

    expect(container.querySelector('[aria-label="Notifications"]')).not.toBeInTheDocument()
    expect(document.body.querySelector('[aria-label="Notifications"]')).toBeInTheDocument()
  })

  it('renders one Toast per queued item', async () => {
    const user = userEvent.setup()
    renderViewport()
    await user.click(screen.getByRole('button', { name: 'Add success' }))
    await user.click(screen.getByRole('button', { name: 'Add destructive' }))

    expect(screen.getByText('Saved')).toBeInTheDocument()
    expect(screen.getByText('Failed')).toBeInTheDocument()
  })

  it('uses role="alert" for destructive variant and role="status" otherwise', async () => {
    const user = userEvent.setup()
    renderViewport()
    await user.click(screen.getByRole('button', { name: 'Add success' }))
    await user.click(screen.getByRole('button', { name: 'Add destructive' }))

    expect(screen.getByRole('status')).toHaveTextContent('Saved')
    expect(screen.getByRole('alert')).toHaveTextContent('Failed')
  })

  it('has no accessibility violations', async () => {
    const user = userEvent.setup()
    renderViewport()
    await user.click(screen.getByRole('button', { name: 'Add success' }))
    expect(await axe(document.body)).toHaveNoViolations()
  })
})
