import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { Dialog } from './Dialog'

describe('Dialog', () => {
  it('does not render when open=false', () => {
    render(<Dialog open={false} onClose={() => {}} />)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('renders when open=true with role="dialog"', () => {
    render(<Dialog open={true} onClose={() => {}} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('renders title when provided', () => {
    render(<Dialog open={true} onClose={() => {}} title="Test Title" />)
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(<Dialog open={true} onClose={() => {}} description="Test description" />)
    expect(screen.getByText('Test description')).toBeInTheDocument()
  })

  it('renders children content', () => {
    render(
      <Dialog open={true} onClose={() => {}}>
        <p>Dialog body</p>
      </Dialog>,
    )
    expect(screen.getByText('Dialog body')).toBeInTheDocument()
  })

  it('renders a close button', () => {
    render(<Dialog open={true} onClose={() => {}} />)
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<Dialog open={true} onClose={onClose} />)
    await user.click(screen.getByRole('button', { name: /close/i }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when Escape key is pressed', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<Dialog open={true} onClose={onClose} />)
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when backdrop (overlay) is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<Dialog open={true} onClose={onClose} />)
    await user.click(screen.getByTestId('dialog-backdrop'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('dialog has aria-modal="true"', () => {
    render(<Dialog open={true} onClose={() => {}} />)
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
  })

  it('dialog has aria-labelledby pointing to the title element', () => {
    render(<Dialog open={true} onClose={() => {}} title="My Title" />)
    const dialog = screen.getByRole('dialog')
    const labelledBy = dialog.getAttribute('aria-labelledby')
    expect(labelledBy).toBeTruthy()
    const titleEl = document.getElementById(labelledBy!)
    expect(titleEl).toBeInTheDocument()
    expect(titleEl!.textContent).toBe('My Title')
  })

  it('dialog has aria-describedby pointing to the description element', () => {
    render(<Dialog open={true} onClose={() => {}} description="My description" />)
    const dialog = screen.getByRole('dialog')
    const describedBy = dialog.getAttribute('aria-describedby')
    expect(describedBy).toBeTruthy()
    const descEl = document.getElementById(describedBy!)
    expect(descEl).toBeInTheDocument()
    expect(descEl!.textContent).toBe('My description')
  })

  it('renders footer slot when provided', () => {
    render(<Dialog open={true} onClose={() => {}} footer={<button>Confirm</button>} />)
    expect(screen.getByText('Confirm')).toBeInTheDocument()
  })

  it('has no accessibility violations when open', async () => {
    render(
      <Dialog open={true} onClose={() => {}} title="Accessible Dialog" description="This is accessible">
        <p>Content</p>
      </Dialog>,
    )
    expect(await axe(document.body)).toHaveNoViolations()
  })
})
