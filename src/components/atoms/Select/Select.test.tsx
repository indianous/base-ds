import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { Select } from './Select'

const options = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
  { value: 'c', label: 'Option C' },
]

describe('Select', () => {
  // Must stay the first test in this file: React logs each warning only once per module instance,
  // so a placeholder rendered by an earlier test would hide it.
  it('does not trigger React warnings when a placeholder is rendered', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<Select id="s" options={options} placeholder="Choose..." aria-label="Pick" />)
    expect(consoleError).not.toHaveBeenCalled()
    consoleError.mockRestore()
  })

  it('renders a select element', () => {
    render(<Select id="s" options={options} />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('renders all options from the options prop', () => {
    render(<Select id="s" options={options} />)
    expect(screen.getByRole('option', { name: 'Option A' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Option B' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Option C' })).toBeInTheDocument()
  })

  it('renders placeholder option when placeholder is provided', () => {
    render(<Select id="s" options={options} placeholder="Choose..." />)
    expect(screen.getByRole('option', { name: 'Choose...' })).toBeInTheDocument()
  })

  it('placeholder option is disabled', () => {
    render(<Select id="s" options={options} placeholder="Choose..." />)
    expect(screen.getByRole('option', { name: 'Choose...' })).toBeDisabled()
  })

  it('applies border-input class for default state', () => {
    render(<Select id="s" options={options} />)
    expect(screen.getByRole('combobox')).toHaveClass('border-input')
  })

  it('applies border-destructive class for state="error"', () => {
    render(<Select id="s" options={options} state="error" />)
    expect(screen.getByRole('combobox')).toHaveClass('border-destructive')
  })

  it('applies border-success class for state="success"', () => {
    render(<Select id="s" options={options} state="success" />)
    expect(screen.getByRole('combobox')).toHaveClass('border-success')
  })

  it('sets aria-invalid="true" when state="error"', () => {
    render(<Select id="s" options={options} state="error" />)
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('does not set aria-invalid when state="default"', () => {
    render(<Select id="s" options={options} state="default" />)
    expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-invalid', 'true')
  })

  it('is disabled when disabled prop is passed', () => {
    render(<Select id="s" options={options} disabled />)
    expect(screen.getByRole('combobox')).toBeDisabled()
  })

  it('fires onChange when an option is selected', async () => {
    const onChange = vi.fn()
    render(<Select id="s" options={options} onChange={onChange} aria-label="Pick option" />)
    await userEvent.selectOptions(screen.getByRole('combobox'), 'a')
    expect(onChange).toHaveBeenCalled()
  })

  describe('placeholder selection', () => {
    const noop = () => {}

    it('selects the placeholder when uncontrolled without defaultValue', () => {
      render(<Select id="s" options={options} placeholder="Choose..." aria-label="Pick" />)
      expect(screen.getByRole('combobox')).toHaveValue('')
      expect(
        (screen.getByRole('option', { name: 'Choose...' }) as HTMLOptionElement).selected,
      ).toBe(true)
    })

    it('honors defaultValue when uncontrolled', () => {
      render(
        <Select
          id="s"
          options={options}
          placeholder="Choose..."
          defaultValue="b"
          aria-label="Pick"
        />,
      )
      expect(screen.getByRole('combobox')).toHaveValue('b')
    })

    it('selects the first option when uncontrolled without placeholder', () => {
      render(<Select id="s" options={options} aria-label="Pick" />)
      expect(screen.getByRole('combobox')).toHaveValue('a')
    })

    it('follows the value prop when controlled', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(noop)
      const { rerender } = render(
        <Select
          id="s"
          options={options}
          placeholder="Choose..."
          value=""
          onChange={noop}
          aria-label="Pick"
        />,
      )
      expect(screen.getByRole('combobox')).toHaveValue('')

      rerender(
        <Select
          id="s"
          options={options}
          placeholder="Choose..."
          value="c"
          onChange={noop}
          aria-label="Pick"
        />,
      )
      expect(screen.getByRole('combobox')).toHaveValue('c')
      expect(consoleError).not.toHaveBeenCalled()
      consoleError.mockRestore()
    })
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<Select id="s" options={options} aria-label="Select option" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
