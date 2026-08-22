import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { FilterDropdown } from './FilterDropdown'
import type { FilterDropdownOption } from './FilterDropdown'

const options: FilterDropdownOption[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
]

describe('FilterDropdown', () => {
  it('renders a trigger button with the label and no count badge when value is empty', () => {
    render(<FilterDropdown label="Status" options={options} value={[]} onApply={vi.fn()} />)
    const trigger = screen.getByRole('button', { name: 'Status' })
    expect(trigger).toBeInTheDocument()
  })

  it('renders a count badge with value.length when value is non-empty', () => {
    render(
      <FilterDropdown
        label="Status"
        options={options}
        value={['pending', 'shipped']}
        onApply={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: 'Status 2' })).toBeInTheDocument()
  })

  it('does not render the checklist panel before the trigger is clicked', () => {
    render(<FilterDropdown label="Status" options={options} value={[]} onApply={vi.fn()} />)
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0)
  })

  it('opens the panel on trigger click, with one checkbox per option', async () => {
    render(<FilterDropdown label="Status" options={options} value={[]} onApply={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: 'Status' }))
    expect(screen.getAllByRole('checkbox')).toHaveLength(3)
  })

  it('reflects value as checked when the panel opens', async () => {
    render(
      <FilterDropdown label="Status" options={options} value={['shipped']} onApply={vi.fn()} />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Status 1' }))
    expect(screen.getByRole('checkbox', { name: 'Shipped' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Pending' })).not.toBeChecked()
  })

  it('toggling a checkbox does not call onApply', async () => {
    const onApply = vi.fn()
    render(<FilterDropdown label="Status" options={options} value={[]} onApply={onApply} />)
    await userEvent.click(screen.getByRole('button', { name: 'Status' }))
    await userEvent.click(screen.getByRole('checkbox', { name: 'Pending' }))
    expect(screen.getByRole('checkbox', { name: 'Pending' })).toBeChecked()
    expect(onApply).not.toHaveBeenCalled()
  })

  it('"Select all" checks every option without calling onApply', async () => {
    const onApply = vi.fn()
    render(<FilterDropdown label="Status" options={options} value={[]} onApply={onApply} />)
    await userEvent.click(screen.getByRole('button', { name: 'Status' }))
    await userEvent.click(screen.getByRole('button', { name: 'Selecionar todos' }))
    for (const checkbox of screen.getAllByRole('checkbox')) {
      expect(checkbox).toBeChecked()
    }
    expect(onApply).not.toHaveBeenCalled()
  })

  it('"Clear" unchecks every option without calling onApply', async () => {
    const onApply = vi.fn()
    render(
      <FilterDropdown
        label="Status"
        options={options}
        value={['pending', 'shipped']}
        onApply={onApply}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Status 2' }))
    await userEvent.click(screen.getByRole('button', { name: 'Limpar' }))
    for (const checkbox of screen.getAllByRole('checkbox')) {
      expect(checkbox).not.toBeChecked()
    }
    expect(onApply).not.toHaveBeenCalled()
  })

  it('"Apply" calls onApply with the in-progress selection and closes the panel', async () => {
    const onApply = vi.fn()
    render(<FilterDropdown label="Status" options={options} value={[]} onApply={onApply} />)
    await userEvent.click(screen.getByRole('button', { name: 'Status' }))
    await userEvent.click(screen.getByRole('checkbox', { name: 'Delivered' }))
    await userEvent.click(screen.getByRole('button', { name: 'Aplicar' }))
    expect(onApply).toHaveBeenCalledWith(['delivered'])
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0)
  })

  it('discards in-progress changes when closed via outside click', async () => {
    const onApply = vi.fn()
    render(
      <FilterDropdown label="Status" options={options} value={['pending']} onApply={onApply} />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Status 1' }))
    await userEvent.click(screen.getByRole('checkbox', { name: 'Shipped' }))
    await userEvent.click(document.body)
    expect(onApply).not.toHaveBeenCalled()

    await userEvent.click(screen.getByRole('button', { name: 'Status 1' }))
    expect(screen.getByRole('checkbox', { name: 'Pending' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Shipped' })).not.toBeChecked()
  })

  it('discards in-progress changes when closed via Escape', async () => {
    const onApply = vi.fn()
    render(
      <FilterDropdown label="Status" options={options} value={['pending']} onApply={onApply} />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Status 1' }))
    await userEvent.click(screen.getByRole('checkbox', { name: 'Shipped' }))
    await userEvent.keyboard('{Escape}')
    expect(onApply).not.toHaveBeenCalled()
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0)
  })

  it('returns focus to the trigger button on Escape', async () => {
    render(<FilterDropdown label="Status" options={options} value={[]} onApply={vi.fn()} />)
    const trigger = screen.getByRole('button', { name: 'Status' })
    await userEvent.click(trigger)
    await userEvent.keyboard('{Escape}')
    expect(trigger).toHaveFocus()
  })

  it('toggles aria-expanded on the trigger from false to true', async () => {
    render(<FilterDropdown label="Status" options={options} value={[]} onApply={vi.fn()} />)
    const trigger = screen.getByRole('button', { name: 'Status' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  it('does not open the panel when disabled', async () => {
    render(
      <FilterDropdown label="Status" options={options} value={[]} onApply={vi.fn()} disabled />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Status' }))
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0)
  })

  it('has no accessibility violations when closed', async () => {
    const { container } = render(
      <FilterDropdown label="Status" options={options} value={[]} onApply={vi.fn()} />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no accessibility violations when open', async () => {
    const { container } = render(
      <FilterDropdown label="Status" options={options} value={['pending']} onApply={vi.fn()} />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Status 1' }))
    expect(await axe(container)).toHaveNoViolations()
  })
})
