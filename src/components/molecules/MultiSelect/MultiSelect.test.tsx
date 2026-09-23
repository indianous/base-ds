import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { FormField } from '../FormField/FormField'
import { MultiSelect } from './MultiSelect'
import type { MultiSelectOption } from './MultiSelect'

const options: MultiSelectOption[] = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'books', label: 'Books' },
  { value: 'clothing', label: 'Clothing' },
]

describe('MultiSelect', () => {
  it('renders a combobox input', () => {
    render(<MultiSelect id="categories" options={options} value={[]} onChange={vi.fn()} />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('renders selected options as removable chips', () => {
    render(
      <MultiSelect id="categories" options={options} value={['electronics']} onChange={vi.fn()} />,
    )
    expect(screen.getByText('Electronics')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove Electronics' })).toBeInTheDocument()
  })

  it('opens the listbox on focus', async () => {
    render(<MultiSelect id="categories" options={options} value={[]} onChange={vi.fn()} />)
    await userEvent.click(screen.getByRole('combobox'))
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(screen.getAllByRole('option')).toHaveLength(3)
  })

  it('filters options as the user types', async () => {
    render(<MultiSelect id="categories" options={options} value={[]} onChange={vi.fn()} />)
    await userEvent.type(screen.getByRole('combobox'), 'boo')
    expect(screen.getAllByRole('option')).toHaveLength(1)
    expect(screen.getByRole('option', { name: 'Books' })).toBeInTheDocument()
  })

  it('shows a "no results" message when filter matches nothing', async () => {
    render(<MultiSelect id="categories" options={options} value={[]} onChange={vi.fn()} />)
    await userEvent.type(screen.getByRole('combobox'), 'zzz')
    expect(screen.getByText('Nenhum resultado')).toBeInTheDocument()
  })

  it('calls onChange with the option added when clicking an unselected option', async () => {
    const onChange = vi.fn()
    render(<MultiSelect id="categories" options={options} value={[]} onChange={onChange} />)
    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(screen.getByRole('option', { name: 'Books' }))
    expect(onChange).toHaveBeenCalledWith(['books'])
  })

  it('calls onChange with the option removed when clicking a selected option', async () => {
    const onChange = vi.fn()
    render(<MultiSelect id="categories" options={options} value={['books']} onChange={onChange} />)
    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(screen.getByRole('option', { name: 'Books' }))
    expect(onChange).toHaveBeenCalledWith([])
  })

  it('calls onChange when removing a chip via its remove button', async () => {
    const onChange = vi.fn()
    render(<MultiSelect id="categories" options={options} value={['books']} onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'Remove Books' }))
    expect(onChange).toHaveBeenCalledWith([])
  })

  it('removes the last selected option on Backspace when input is empty', async () => {
    const onChange = vi.fn()
    render(
      <MultiSelect
        id="categories"
        options={options}
        value={['books', 'clothing']}
        onChange={onChange}
      />,
    )
    const input = screen.getByRole('combobox')
    await userEvent.click(input)
    await userEvent.keyboard('{Backspace}')
    expect(onChange).toHaveBeenCalledWith(['books'])
  })

  it('toggles the highlighted option on Enter', async () => {
    const onChange = vi.fn()
    render(<MultiSelect id="categories" options={options} value={[]} onChange={onChange} />)
    const input = screen.getByRole('combobox')
    await userEvent.click(input)
    await userEvent.keyboard('{ArrowDown}{Enter}')
    expect(onChange).toHaveBeenCalledWith(['books'])
  })

  it('closes the listbox on Escape', async () => {
    render(<MultiSelect id="categories" options={options} value={[]} onChange={vi.fn()} />)
    await userEvent.click(screen.getByRole('combobox'))
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('marks selected options with aria-selected', async () => {
    render(<MultiSelect id="categories" options={options} value={['books']} onChange={vi.fn()} />)
    await userEvent.click(screen.getByRole('combobox'))
    expect(screen.getByRole('option', { name: /Books/ })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('option', { name: /Electronics/ })).toHaveAttribute(
      'aria-selected',
      'false',
    )
  })

  it('is disabled when disabled prop is passed', () => {
    render(<MultiSelect id="categories" options={options} value={[]} onChange={vi.fn()} disabled />)
    expect(screen.getByRole('combobox')).toBeDisabled()
  })

  it('does not open the listbox when disabled', async () => {
    render(<MultiSelect id="categories" options={options} value={[]} onChange={vi.fn()} disabled />)
    await userEvent.click(screen.getByRole('combobox'))
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <>
        <label htmlFor="categories">Categories</label>
        <MultiSelect id="categories" options={options} value={['books']} onChange={vi.fn()} />
      </>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('forwards aria-label to the input', () => {
    render(
      <MultiSelect
        id="categories"
        options={options}
        value={[]}
        onChange={() => {}}
        aria-label="Categories"
      />,
    )
    expect(screen.getByRole('combobox', { name: 'Categories' })).toBeInTheDocument()
  })

  it('forwards aria-labelledby to the input', () => {
    render(
      <>
        <span id="categories-label">Categories</span>
        <MultiSelect
          id="categories"
          options={options}
          value={[]}
          onChange={() => {}}
          aria-labelledby="categories-label"
        />
      </>,
    )
    expect(screen.getByRole('combobox', { name: 'Categories' })).toBeInTheDocument()
  })

  it('forwards aria-describedby and aria-invalid from FormField', () => {
    render(
      <FormField id="categories" label="Categories" error="This field is required">
        <MultiSelect id="categories" options={options} value={[]} onChange={() => {}} />
      </FormField>,
    )
    const input = screen.getByRole('combobox', { name: 'Categories' })
    expect(input).toHaveAccessibleDescription('This field is required')
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  it('has no accessibility violations inside a FormField with a hint', async () => {
    const { container } = render(
      <FormField id="categories" label="Categories" hint="Helpful hint">
        <MultiSelect id="categories" options={options} value={[]} onChange={() => {}} />
      </FormField>,
    )
    expect(screen.getByRole('combobox', { name: 'Categories' })).toHaveAccessibleDescription(
      'Helpful hint',
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('marks the selected-values area as aria-disabled when disabled', () => {
    render(
      <MultiSelect
        id="categories"
        options={options}
        value={['books']}
        onChange={() => {}}
        disabled
        aria-label="Categories"
      />,
    )
    const area = screen.getByRole('combobox', { name: 'Categories' }).parentElement
    expect(area).toHaveAttribute('aria-disabled', 'true')
  })

  it('has no accessibility violations when disabled with selected values', async () => {
    const { container } = render(
      <MultiSelect
        id="categories"
        options={options}
        value={['books']}
        onChange={() => {}}
        disabled
        aria-label="Categories"
      />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
