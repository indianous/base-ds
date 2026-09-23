import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { TransferList } from './TransferList'
import type { TransferListOption } from './TransferList'

const options: TransferListOption[] = [
  { value: 'read', label: 'Read' },
  { value: 'write', label: 'Write' },
  { value: 'delete', label: 'Delete' },
]

describe('TransferList', () => {
  it('renders all options in the available column when value is empty', () => {
    render(<TransferList options={options} value={[]} onChange={vi.fn()} />)
    const listboxes = screen.getAllByRole('listbox')
    expect(listboxes).toHaveLength(1)
    expect(within(listboxes[0] as HTMLElement).getAllByRole('option')).toHaveLength(3)
  })

  it('renders an empty column as a labelled group instead of an empty listbox', () => {
    render(<TransferList options={options} value={[]} onChange={vi.fn()} />)
    const emptyColumn = screen.getByRole('group', { name: 'Selected' })
    expect(within(emptyColumn).getByText('Empty')).toBeInTheDocument()
    expect(emptyColumn).not.toHaveAttribute('tabindex')
    expect(screen.queryByRole('listbox', { name: 'Selected' })).not.toBeInTheDocument()
  })

  it('has no accessibility violations with an empty column', async () => {
    const { container } = render(<TransferList options={options} value={[]} onChange={vi.fn()} />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('renders options already in value in the selected column', () => {
    render(<TransferList options={options} value={['write']} onChange={vi.fn()} />)
    const listboxes = screen.getAllByRole('listbox')
    expect(within(listboxes[0]).getAllByRole('option')).toHaveLength(2)
    expect(within(listboxes[1]).getAllByRole('option')).toHaveLength(1)
    expect(within(listboxes[1]).getByText('Write')).toBeInTheDocument()
  })

  it('uses custom column labels', () => {
    render(
      <TransferList
        options={options}
        value={[]}
        onChange={vi.fn()}
        availableLabel="Disponível"
        selectedLabel="Selecionado"
      />,
    )
    expect(screen.getByText('Disponível')).toBeInTheDocument()
    expect(screen.getByText('Selecionado')).toBeInTheDocument()
  })

  it('highlights an option on click', async () => {
    render(<TransferList options={options} value={[]} onChange={vi.fn()} />)
    await userEvent.click(screen.getByText('Read'))
    expect(screen.getByText('Read').closest('[role="option"]')).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  it('moves the highlighted item to selected via the single-move button', async () => {
    const onChange = vi.fn()
    render(<TransferList options={options} value={[]} onChange={onChange} />)
    await userEvent.click(screen.getByText('Read'))
    await userEvent.click(screen.getByRole('button', { name: /Move to Selected/ }))
    expect(onChange).toHaveBeenCalledWith(['read'])
  })

  it('moves the highlighted item back to available via the single-move button', async () => {
    const onChange = vi.fn()
    render(<TransferList options={options} value={['read', 'write']} onChange={onChange} />)
    await userEvent.click(screen.getByText('Read'))
    await userEvent.click(screen.getByRole('button', { name: /Move to Available/ }))
    expect(onChange).toHaveBeenCalledWith(['write'])
  })

  it('moves all available items to selected', async () => {
    const onChange = vi.fn()
    render(<TransferList options={options} value={[]} onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: /Move all to Selected/ }))
    expect(onChange).toHaveBeenCalledWith(['read', 'write', 'delete'])
  })

  it('moves all selected items back to available', async () => {
    const onChange = vi.fn()
    render(<TransferList options={options} value={['read', 'write']} onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: /Move all to Available/ }))
    expect(onChange).toHaveBeenCalledWith([])
  })

  it('moves an item on double-click', async () => {
    const onChange = vi.fn()
    render(<TransferList options={options} value={[]} onChange={onChange} />)
    await userEvent.dblClick(screen.getByText('Write'))
    expect(onChange).toHaveBeenCalledWith(['write'])
  })

  it('disables the single-move button when nothing is highlighted', () => {
    render(<TransferList options={options} value={[]} onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: /Move to Selected/ })).toBeDisabled()
  })

  it('disables the move-all button when the source column is empty', () => {
    render(<TransferList options={options} value={[]} onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: /Move all to Available/ })).toBeDisabled()
  })

  it('moves highlight to the next option on ArrowDown', async () => {
    render(<TransferList options={options} value={[]} onChange={vi.fn()} />)
    const user = userEvent.setup()
    await user.click(screen.getByText('Read'))
    const listbox = screen.getAllByRole('listbox')[0]
    listbox.focus()
    await user.keyboard('{ArrowDown}')
    expect(screen.getByText('Write').closest('[role="option"]')).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  it('moves highlight to the previous option on ArrowUp', async () => {
    render(<TransferList options={options} value={[]} onChange={vi.fn()} />)
    const user = userEvent.setup()
    await user.click(screen.getByText('Delete'))
    const listbox = screen.getAllByRole('listbox')[0]
    listbox.focus()
    await user.keyboard('{ArrowUp}')
    expect(screen.getByText('Write').closest('[role="option"]')).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  it('disables all interaction when disabled is true', () => {
    render(<TransferList options={options} value={[]} onChange={vi.fn()} disabled />)
    screen.getAllByRole('button').forEach((button) => expect(button).toBeDisabled())
  })

  it('marks the listboxes and their options as aria-disabled when disabled', () => {
    render(<TransferList options={options} value={['write']} onChange={vi.fn()} disabled />)
    screen
      .getAllByRole('listbox')
      .forEach((listbox) => expect(listbox).toHaveAttribute('aria-disabled', 'true'))
    screen
      .getAllByRole('option')
      .forEach((option) => expect(option).toHaveAttribute('aria-disabled', 'true'))
  })

  it('does not set aria-disabled when enabled', () => {
    render(<TransferList options={options} value={['write']} onChange={vi.fn()} />)
    screen
      .getAllByRole('listbox')
      .forEach((listbox) => expect(listbox).not.toHaveAttribute('aria-disabled'))
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <TransferList options={options} value={['write']} onChange={vi.fn()} />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  describe('custom move button labels', () => {
    it('uses moveLabel for the single move-to-selected button', () => {
      render(<TransferList options={options} value={[]} onChange={vi.fn()} moveLabel="Atribuir" />)
      expect(screen.getByRole('button', { name: 'Atribuir' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /Move to Selected/ })).not.toBeInTheDocument()
    })

    it('uses moveAllLabel for the move-all-to-selected button', () => {
      render(
        <TransferList
          options={options}
          value={[]}
          onChange={vi.fn()}
          moveAllLabel="Atribuir todas"
        />,
      )
      expect(screen.getByRole('button', { name: 'Atribuir todas' })).toBeInTheDocument()
    })

    it('uses moveBackLabel for the single move-to-available button', () => {
      render(
        <TransferList
          options={options}
          value={['write']}
          onChange={vi.fn()}
          moveBackLabel="Remover"
        />,
      )
      expect(screen.getByRole('button', { name: 'Remover' })).toBeInTheDocument()
    })

    it('uses moveAllBackLabel for the move-all-to-available button', () => {
      render(
        <TransferList
          options={options}
          value={['write']}
          onChange={vi.fn()}
          moveAllBackLabel="Remover todas"
        />,
      )
      expect(screen.getByRole('button', { name: 'Remover todas' })).toBeInTheDocument()
    })

    it('falls back to the default English template when not customized', () => {
      render(<TransferList options={options} value={[]} onChange={vi.fn()} />)
      expect(screen.getByRole('button', { name: 'Move to Selected' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Move all to Selected' })).toBeInTheDocument()
    })
  })
})
