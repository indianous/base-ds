import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { Switch } from './Switch'

describe('Switch', () => {
  it('renders an element with role="switch"', () => {
    render(<Switch id="s" onChange={() => {}} />)
    expect(screen.getByRole('switch')).toBeInTheDocument()
  })

  it('has aria-checked="false" when unchecked (default)', () => {
    render(<Switch id="s" onChange={() => {}} />)
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false')
  })

  it('has aria-checked="true" when checked=true', () => {
    render(<Switch id="s" checked={true} onChange={() => {}} />)
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true')
  })

  it('renders label text when label prop is provided', () => {
    render(<Switch id="s" label="Dark mode" onChange={() => {}} />)
    expect(screen.getByText('Dark mode')).toBeInTheDocument()
  })

  it('calls onChange with true when clicking an unchecked switch', async () => {
    const onChange = vi.fn()
    render(<Switch id="s" onChange={onChange} />)
    await userEvent.click(screen.getByRole('switch'))
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('calls onChange with false when clicking a checked switch', async () => {
    const onChange = vi.fn()
    render(<Switch id="s" checked={true} onChange={onChange} />)
    await userEvent.click(screen.getByRole('switch'))
    expect(onChange).toHaveBeenCalledWith(false)
  })

  it('does not call onChange when disabled', async () => {
    const onChange = vi.fn()
    render(<Switch id="s" disabled onChange={onChange} />)
    await userEvent.click(screen.getByRole('switch'))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('button has disabled attribute when disabled=true', () => {
    render(<Switch id="s" disabled onChange={() => {}} />)
    expect(screen.getByRole('switch')).toBeDisabled()
  })

  it('applies bg-primary class when checked', () => {
    render(<Switch id="s" checked={true} onChange={() => {}} />)
    expect(screen.getByRole('switch')).toHaveClass('bg-primary')
  })

  it('applies bg-muted class when unchecked', () => {
    render(<Switch id="s" onChange={() => {}} />)
    expect(screen.getByRole('switch')).toHaveClass('bg-muted')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<Switch id="s" label="Dark mode" onChange={() => {}} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
