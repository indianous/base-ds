import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { Drawer } from './Drawer'

function DrawerWrapper({
  open: init = false,
  side,
}: {
  open?: boolean
  side?: 'left' | 'right' | 'top' | 'bottom'
}) {
  const [open, setOpen] = React.useState(init)
  return (
    <>
      <button onClick={() => setOpen(true)}>Open</button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Test Drawer"
        {...(side ? { side } : {})}
      >
        <p>Drawer content</p>
      </Drawer>
    </>
  )
}

describe('Drawer', () => {
  afterEach(() => {
    document.body.style.overflow = ''
  })

  it('locks body scroll while open', () => {
    render(<DrawerWrapper open={true} />)
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('does not lock body scroll when closed', () => {
    render(<DrawerWrapper open={false} />)
    expect(document.body.style.overflow).toBe('')
  })

  it('does not render when open=false', () => {
    render(<DrawerWrapper open={false} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders when open=true with role="dialog"', () => {
    render(<DrawerWrapper open={true} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('drawer has aria-modal="true"', () => {
    render(<DrawerWrapper open={true} />)
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
  })

  it('renders title when provided', () => {
    render(<DrawerWrapper open={true} />)
    expect(screen.getByText('Test Drawer')).toBeInTheDocument()
  })

  it('renders children content', () => {
    render(<DrawerWrapper open={true} />)
    expect(screen.getByText('Drawer content')).toBeInTheDocument()
  })

  it('renders a close button', () => {
    render(<DrawerWrapper open={true} />)
    expect(screen.getByRole('button', { name: /close drawer/i })).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <Drawer open={true} onClose={onClose} title="Test">
        <p>Content</p>
      </Drawer>,
    )
    await user.click(screen.getByRole('button', { name: /close drawer/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when Escape key is pressed', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <Drawer open={true} onClose={onClose} title="Test">
        <p>Content</p>
      </Drawer>,
    )
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('when two Drawers are stacked, Escape closes only the topmost one', async () => {
    const user = userEvent.setup()
    const onCloseOuter = vi.fn()
    const onCloseInner = vi.fn()
    const { rerender } = render(
      <Drawer open={true} onClose={onCloseOuter} title="Outer">
        <Drawer open={false} onClose={onCloseInner} title="Inner" />
      </Drawer>,
    )
    rerender(
      <Drawer open={true} onClose={onCloseOuter} title="Outer">
        <Drawer open={true} onClose={onCloseInner} title="Inner" />
      </Drawer>,
    )
    await user.keyboard('{Escape}')
    expect(onCloseInner).toHaveBeenCalledOnce()
    expect(onCloseOuter).not.toHaveBeenCalled()
  })

  it('closes the next drawer in the stack after the topmost is dismissed', async () => {
    const user = userEvent.setup()
    const onCloseOuter = vi.fn()
    const onCloseInner = vi.fn()
    const { rerender } = render(
      <Drawer open={true} onClose={onCloseOuter} title="Outer">
        <Drawer open={false} onClose={onCloseInner} title="Inner" />
      </Drawer>,
    )
    rerender(
      <Drawer open={true} onClose={onCloseOuter} title="Outer">
        <Drawer open={true} onClose={onCloseInner} title="Inner" />
      </Drawer>,
    )
    rerender(
      <Drawer open={true} onClose={onCloseOuter} title="Outer">
        <Drawer open={false} onClose={onCloseInner} title="Inner" />
      </Drawer>,
    )
    await user.keyboard('{Escape}')
    expect(onCloseOuter).toHaveBeenCalledOnce()
  })

  it('calls onClose when backdrop is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <Drawer open={true} onClose={onClose} title="Test">
        <p>Content</p>
      </Drawer>,
    )
    await user.click(screen.getByRole('button', { name: 'Dismiss drawer' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose when the drawer panel itself is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <Drawer open={true} onClose={onClose} title="Test">
        <p>Content</p>
      </Drawer>,
    )
    await user.click(screen.getByText('Test'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('renders footer slot when provided', () => {
    render(
      <Drawer open={true} onClose={() => {}} footer={<button>Save</button>}>
        <p>Content</p>
      </Drawer>,
    )
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
  })

  it('right side is the default positioning', () => {
    render(<DrawerWrapper open={true} />)
    const dialog = screen.getByRole('dialog')
    expect(dialog.className).toMatch(/right-0/)
  })

  it('left side applies different positioning class', () => {
    render(<DrawerWrapper open={true} side="left" />)
    const dialog = screen.getByRole('dialog')
    expect(dialog.className).toMatch(/left-0/)
  })

  it('has no accessibility violations when open', async () => {
    const { container } = render(
      <Drawer open={true} onClose={() => {}} title="Accessible Drawer">
        <p>Content</p>
      </Drawer>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
