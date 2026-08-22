import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { Dialog } from './Dialog'

describe('Dialog', () => {
  afterEach(() => {
    document.body.style.overflow = ''
  })

  it('locks body scroll while open', () => {
    render(<Dialog open={true} onClose={() => {}} />)
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('restores body scroll when closed', () => {
    const { rerender } = render(<Dialog open={true} onClose={() => {}} />)
    expect(document.body.style.overflow).toBe('hidden')
    rerender(<Dialog open={false} onClose={() => {}} />)
    expect(document.body.style.overflow).toBe('')
  })

  it('lets the backdrop scroll instead of capping the dialog height', () => {
    render(<Dialog open={true} onClose={() => {}} />)
    expect(screen.getByTestId('dialog-backdrop')).toHaveClass('overflow-y-auto')
    const dialog = screen.getByRole('dialog')
    expect(dialog.className).not.toMatch(/max-h-|overflow-y-auto/)
  })

  it('pins the overlay with position:fixed so it does not scroll away with the backdrop content', () => {
    render(<Dialog open={true} onClose={() => {}} />)
    const overlay = document.querySelector('.bg-overlay')
    expect(overlay).toHaveClass('fixed')
    expect(overlay).not.toHaveClass('absolute')
  })

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

  it('when two Dialogs are stacked, Escape closes only the topmost one', async () => {
    const user = userEvent.setup()
    const onCloseOuter = vi.fn()
    const onCloseInner = vi.fn()
    // The inner (confirmation) dialog opens after the outer one is already
    // mounted, in a separate commit — matching how stacking happens in
    // practice (a user action opens the second dialog on top of the first).
    const { rerender } = render(
      <Dialog open={true} onClose={onCloseOuter} title="Outer">
        <Dialog open={false} onClose={onCloseInner} title="Inner" />
      </Dialog>,
    )
    rerender(
      <Dialog open={true} onClose={onCloseOuter} title="Outer">
        <Dialog open={true} onClose={onCloseInner} title="Inner" />
      </Dialog>,
    )
    await user.keyboard('{Escape}')
    expect(onCloseInner).toHaveBeenCalledOnce()
    expect(onCloseOuter).not.toHaveBeenCalled()
  })

  it('closes the next dialog in the stack after the topmost is dismissed', async () => {
    const user = userEvent.setup()
    const onCloseOuter = vi.fn()
    const onCloseInner = vi.fn()
    const { rerender } = render(
      <Dialog open={true} onClose={onCloseOuter} title="Outer">
        <Dialog open={false} onClose={onCloseInner} title="Inner" />
      </Dialog>,
    )
    rerender(
      <Dialog open={true} onClose={onCloseOuter} title="Outer">
        <Dialog open={true} onClose={onCloseInner} title="Inner" />
      </Dialog>,
    )
    rerender(
      <Dialog open={true} onClose={onCloseOuter} title="Outer">
        <Dialog open={false} onClose={onCloseInner} title="Inner" />
      </Dialog>,
    )
    await user.keyboard('{Escape}')
    expect(onCloseOuter).toHaveBeenCalledOnce()
  })

  it('calls onClose when backdrop (overlay) is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<Dialog open={true} onClose={onClose} />)
    await user.click(screen.getByRole('button', { name: 'Dismiss dialog' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('does not call onClose when the dialog panel itself is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <Dialog open={true} onClose={onClose} title="Test Title">
        <p>Dialog body</p>
      </Dialog>,
    )
    await user.click(screen.getByText('Test Title'))
    expect(onClose).not.toHaveBeenCalled()
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
      <Dialog
        open={true}
        onClose={() => {}}
        title="Accessible Dialog"
        description="This is accessible"
      >
        <p>Content</p>
      </Dialog>,
    )
    expect(await axe(document.body)).toHaveNoViolations()
  })
})
