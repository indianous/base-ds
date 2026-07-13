import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { Checkbox } from './Checkbox'

describe('Checkbox', () => {
  it('renders a checkbox input', () => {
    render(<Checkbox id="test-checkbox" />)
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })

  it('renders label text when label prop is provided', () => {
    render(<Checkbox id="test-checkbox" label="Accept terms" />)
    expect(screen.getByText('Accept terms')).toBeInTheDocument()
  })

  it('label has correct htmlFor attribute matching the input id', () => {
    render(<Checkbox id="my-id" label="Label" />)
    expect(screen.getByText('Label')).toHaveAttribute('for', 'my-id')
  })

  it('input has correct id attribute', () => {
    render(<Checkbox id="my-checkbox-id" />)
    expect(screen.getByRole('checkbox')).toHaveAttribute('id', 'my-checkbox-id')
  })

  it('checkbox is checked when checked=true', () => {
    render(<Checkbox id="test-checkbox" checked={true} onChange={() => {}} />)
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('checkbox is unchecked when checked=false', () => {
    render(<Checkbox id="test-checkbox" checked={false} onChange={() => {}} />)
    expect(screen.getByRole('checkbox')).not.toBeChecked()
  })

  it('checkbox is disabled when disabled prop is passed', () => {
    render(<Checkbox id="test-checkbox" disabled />)
    expect(screen.getByRole('checkbox')).toBeDisabled()
  })

  it('indeterminate property is set on the input when indeterminate=true', () => {
    render(<Checkbox id="test-checkbox" indeterminate={true} onChange={() => {}} />)
    expect(screen.getByRole('checkbox')).toHaveProperty('indeterminate', true)
  })

  it('calls onChange when checkbox is clicked', async () => {
    const onChange = vi.fn()
    render(<Checkbox id="test" label="Check me" onChange={onChange} />)
    await userEvent.click(screen.getByRole('checkbox'))
    expect(onChange).toHaveBeenCalled()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<Checkbox id="test" label="Accept terms" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
