import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { DropdownMenu, type DropdownMenuItem } from './DropdownMenu'
import { Button } from '../../atoms/Button/Button'
import { Tooltip } from '../Tooltip/Tooltip'

const items: DropdownMenuItem[] = [
  { label: 'Edit', onClick: vi.fn() },
  { label: 'Duplicate', onClick: vi.fn() },
  { type: 'separator' },
  { label: 'Delete', onClick: vi.fn(), danger: true },
]

describe('DropdownMenu', () => {
  it('renders the trigger and keeps the menu closed by default', () => {
    render(<DropdownMenu trigger={<Button>Options</Button>} items={items} />)
    expect(screen.getByRole('button', { name: 'Options' })).toBeInTheDocument()
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('opens the menu when the trigger is clicked', async () => {
    render(<DropdownMenu trigger={<Button>Options</Button>} items={items} />)
    await userEvent.click(screen.getByRole('button', { name: 'Options' }))
    expect(screen.getByRole('menu')).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument()
  })

  it('closes the menu when the trigger is clicked again', async () => {
    render(<DropdownMenu trigger={<Button>Options</Button>} items={items} />)
    const trigger = screen.getByRole('button', { name: 'Options' })
    await userEvent.click(trigger)
    await userEvent.click(trigger)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('sets aria-expanded on the trigger', async () => {
    render(<DropdownMenu trigger={<Button>Options</Button>} items={items} />)
    const trigger = screen.getByRole('button', { name: 'Options' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  it('closes the menu when Escape is pressed', async () => {
    render(<DropdownMenu trigger={<Button>Options</Button>} items={items} />)
    await userEvent.click(screen.getByRole('button', { name: 'Options' }))
    expect(screen.getByRole('menu')).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('closes the menu when clicking outside', async () => {
    render(
      <div>
        <DropdownMenu trigger={<Button>Options</Button>} items={items} />
        <button>Outside</button>
      </div>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Options' }))
    expect(screen.getByRole('menu')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Outside' }))
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('calls the item onClick and closes the menu when an item is selected', async () => {
    const onClick = vi.fn()
    render(<DropdownMenu trigger={<Button>Options</Button>} items={[{ label: 'Edit', onClick }]} />)
    await userEvent.click(screen.getByRole('button', { name: 'Options' }))
    await userEvent.click(screen.getByRole('menuitem', { name: 'Edit' }))
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('does not call onClick for a disabled item', async () => {
    const onClick = vi.fn()
    render(
      <DropdownMenu
        trigger={<Button>Options</Button>}
        items={[{ label: 'Edit', onClick, disabled: true }]}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Options' }))
    await userEvent.click(screen.getByRole('menuitem', { name: 'Edit' }))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('renders an item with href as a real link', async () => {
    render(
      <DropdownMenu trigger={<Button>Options</Button>} items={[{ label: 'Home', href: '/' }]} />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Options' }))
    const menu = screen.getByRole('menu')
    const link = within(menu).getByRole('menuitem', { name: 'Home' })
    expect(link.tagName).toBe('A')
    expect(link).toHaveAttribute('href', '/')
  })

  it('renders separators with role="separator"', async () => {
    render(<DropdownMenu trigger={<Button>Options</Button>} items={items} />)
    await userEvent.click(screen.getByRole('button', { name: 'Options' }))
    expect(screen.getByRole('separator')).toBeInTheDocument()
  })

  it('focuses the first menu item when opened', async () => {
    render(<DropdownMenu trigger={<Button>Options</Button>} items={items} />)
    await userEvent.click(screen.getByRole('button', { name: 'Options' }))
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveFocus()
  })

  it('moves focus to the next item with ArrowDown', async () => {
    render(<DropdownMenu trigger={<Button>Options</Button>} items={items} />)
    await userEvent.click(screen.getByRole('button', { name: 'Options' }))
    await userEvent.keyboard('{ArrowDown}')
    expect(screen.getByRole('menuitem', { name: 'Duplicate' })).toHaveFocus()
  })

  it('wraps focus to the last item with ArrowUp from the first item', async () => {
    render(<DropdownMenu trigger={<Button>Options</Button>} items={items} />)
    await userEvent.click(screen.getByRole('button', { name: 'Options' }))
    await userEvent.keyboard('{ArrowUp}')
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveFocus()
  })

  it('calls onOpenChange when opening and closing', async () => {
    const onOpenChange = vi.fn()
    render(
      <DropdownMenu trigger={<Button>Options</Button>} items={items} onOpenChange={onOpenChange} />,
    )
    const trigger = screen.getByRole('button', { name: 'Options' })
    await userEvent.click(trigger)
    expect(onOpenChange).toHaveBeenLastCalledWith(true)
    await userEvent.click(trigger)
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it('has no accessibility violations when open', async () => {
    const { container } = render(<DropdownMenu trigger={<Button>Options</Button>} items={items} />)
    await userEvent.click(screen.getByRole('button', { name: 'Options' }))
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('opens when the trigger is wrapped in a Tooltip', async () => {
    render(
      <DropdownMenu
        trigger={
          <Tooltip label="User menu">
            <Button aria-label="User menu">Avatar</Button>
          </Tooltip>
        }
        items={items}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'User menu' }))
    expect(screen.getByRole('menu')).toBeInTheDocument()
  })
})
