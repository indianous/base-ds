import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { Toast } from './Toast'
import type { ToastVariant } from './Toast'

describe('Toast', () => {
  it('renders title and description', () => {
    render(<Toast title="Saved" description="Your changes were saved." onDismiss={() => {}} />)
    expect(screen.getByText('Saved')).toBeInTheDocument()
    expect(screen.getByText('Your changes were saved.')).toBeInTheDocument()
  })

  it('calls onDismiss when close button is clicked', async () => {
    const user = userEvent.setup()
    const onDismiss = vi.fn()
    render(<Toast title="Saved" onDismiss={onDismiss} />)
    await user.click(screen.getByRole('button', { name: /close notification/i }))
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('renders action button and calls its onClick when clicked', async () => {
    const user = userEvent.setup()
    const onActionClick = vi.fn()
    render(
      <Toast
        title="Update available"
        action={{ label: 'Reload', onClick: onActionClick }}
        onDismiss={() => {}}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Reload' }))
    expect(onActionClick).toHaveBeenCalledOnce()
  })

  it('does not render action button when action is not provided', () => {
    render(<Toast title="Saved" onDismiss={() => {}} />)
    expect(screen.queryByRole('button', { name: 'Reload' })).not.toBeInTheDocument()
  })

  it('renders the default (Bell) icon when no variant is provided', () => {
    const { container } = render(<Toast title="Test" onDismiss={() => {}} />)
    expect(container.querySelector('.lucide-bell')).toBeInTheDocument()
  })

  it.each<[ToastVariant, string]>([
    ['default', 'lucide-bell'],
    ['success', 'lucide-circle-check'],
    ['warning', 'lucide-triangle-alert'],
    ['destructive', 'lucide-circle-x'],
    ['info', 'lucide-info'],
  ])('renders the correct icon for variant=%s', (variant, iconClass) => {
    const { container } = render(<Toast variant={variant} title="Test" onDismiss={() => {}} />)
    expect(container.querySelector(`.${iconClass}`)).toBeInTheDocument()
  })

  it('has role="status" for non-destructive variants', () => {
    render(<Toast variant="success" title="Saved" onDismiss={() => {}} />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('has role="alert" for the destructive variant', () => {
    render(<Toast variant="destructive" title="Something failed" onDismiss={() => {}} />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Toast
        variant="success"
        title="Saved"
        description="Your changes were saved."
        action={{ label: 'Undo', onClick: () => {} }}
        onDismiss={() => {}}
      />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
