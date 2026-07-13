import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { PasswordInput } from './PasswordInput'

describe('PasswordInput', () => {
  it('renders a password input (type="password" by default)', () => {
    const { container } = render(<PasswordInput id="pwd" />)
    expect(container.querySelector('input[type="password"]')).toBeInTheDocument()
  })

  it('renders a toggle button', () => {
    render(<PasswordInput id="pwd" />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('toggle button has aria-label "Show password" initially', () => {
    render(<PasswordInput id="pwd" />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Show password')
  })

  it('input becomes type="text" when toggle button is clicked', async () => {
    const user = userEvent.setup()
    const { container } = render(<PasswordInput id="pwd" />)
    await user.click(screen.getByRole('button'))
    expect(container.querySelector('input[type="text"]')).toBeInTheDocument()
  })

  it('toggle button aria-label changes to "Hide password" after click', async () => {
    const user = userEvent.setup()
    render(<PasswordInput id="pwd" />)
    await user.click(screen.getByRole('button'))
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Hide password')
  })

  it('input returns to type="password" when toggle button is clicked again', async () => {
    const user = userEvent.setup()
    const { container } = render(<PasswordInput id="pwd" />)
    await user.click(screen.getByRole('button'))
    await user.click(screen.getByRole('button'))
    expect(container.querySelector('input[type="password"]')).toBeInTheDocument()
  })

  it('toggle button label cycles back to "Show password"', async () => {
    const user = userEvent.setup()
    render(<PasswordInput id="pwd" />)
    await user.click(screen.getByRole('button'))
    await user.click(screen.getByRole('button'))
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Show password')
  })

  it('forwards placeholder to input', () => {
    render(<PasswordInput id="pwd" placeholder="Enter your password" />)
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument()
  })

  it('forwards disabled to input', () => {
    const { container } = render(<PasswordInput id="pwd" disabled />)
    expect(container.querySelector('input')).toBeDisabled()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <PasswordInput id="pwd" aria-label="Password" />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
