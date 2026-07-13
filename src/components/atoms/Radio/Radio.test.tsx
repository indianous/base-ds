import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { Radio } from './Radio'

describe('Radio', () => {
  it('renders a radio input', () => {
    render(<Radio id="r1" value="option1" />)
    expect(screen.getByRole('radio')).toBeInTheDocument()
  })

  it('input has correct id attribute', () => {
    render(<Radio id="my-radio" value="option1" />)
    expect(screen.getByRole('radio')).toHaveAttribute('id', 'my-radio')
  })

  it('input has correct value attribute', () => {
    render(<Radio id="r1" value="option1" />)
    expect(screen.getByRole('radio')).toHaveAttribute('value', 'option1')
  })

  it('renders label text when label prop is provided', () => {
    render(<Radio id="r1" value="option1" label="Option A" />)
    expect(screen.getByText('Option A')).toBeInTheDocument()
  })

  it('label has correct htmlFor attribute matching the input id', () => {
    render(<Radio id="r1" value="option1" label="Option A" />)
    const label = screen.getByText('Option A')
    expect(label).toHaveAttribute('for', 'r1')
  })

  it('radio is selected when checked=true', () => {
    render(<Radio id="r1" value="option1" checked onChange={() => {}} />)
    expect(screen.getByRole('radio')).toBeChecked()
  })

  it('radio is not selected by default', () => {
    render(<Radio id="r1" value="option1" />)
    expect(screen.getByRole('radio')).not.toBeChecked()
  })

  it('radio is disabled when disabled prop is passed', () => {
    render(<Radio id="r1" value="option1" disabled />)
    expect(screen.getByRole('radio')).toBeDisabled()
  })

  it('calls onChange when radio is clicked', async () => {
    const onChange = vi.fn()
    render(<Radio id="r1" value="a" label="Option A" onChange={onChange} />)
    await userEvent.click(screen.getByRole('radio'))
    expect(onChange).toHaveBeenCalled()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<Radio id="r1" value="a" label="Option A" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
