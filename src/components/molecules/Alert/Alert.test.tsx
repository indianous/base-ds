import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { Alert } from './Alert'
import type { AlertVariant } from './Alert'
import { Button } from '../../atoms/Button/Button'
import { Icon } from '../../atoms/Icon/Icon'

describe('Alert', () => {
  it('renders the title and the description', () => {
    render(<Alert title="Heads up">Confirm your email</Alert>)
    expect(screen.getByText('Heads up')).toBeInTheDocument()
    expect(screen.getByText('Confirm your email')).toBeInTheDocument()
  })

  it.each<[AlertVariant, string[]]>([
    ['info', ['bg-info-muted', 'text-info-muted-fg', 'border-info-border']],
    ['success', ['bg-success-muted', 'text-success-muted-fg', 'border-success-border']],
    ['warning', ['bg-warning-muted', 'text-warning-muted-fg', 'border-warning-border']],
    ['danger', ['bg-destructive-muted', 'text-destructive-muted-fg', 'border-destructive-border']],
    ['neutral', ['bg-muted', 'text-foreground', 'border-border']],
  ])('applies the %s variant classes', (variant, classes) => {
    render(
      <Alert variant={variant} data-testid="alert">
        Message
      </Alert>,
    )
    expect(screen.getByTestId('alert')).toHaveClass(...classes)
  })

  it.each<[AlertVariant, string]>([
    ['info', 'status'],
    ['success', 'status'],
    ['neutral', 'status'],
    ['warning', 'alert'],
    ['danger', 'alert'],
  ])('uses the %s variant default role (%s)', (variant, role) => {
    render(<Alert variant={variant}>Message</Alert>)
    expect(screen.getByRole(role)).toHaveTextContent('Message')
  })

  it('lets a role prop override the default role', () => {
    render(
      <Alert variant="danger" role="region" aria-label="Staff notice">
        Message
      </Alert>,
    )
    expect(screen.getByRole('region', { name: 'Staff notice' })).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('uses the inline layout by default', () => {
    render(<Alert>Message</Alert>)
    expect(screen.getByRole('status')).toHaveClass('rounded-lg', 'border')
  })

  it('renders a full-width band with layout="full"', () => {
    render(<Alert layout="full">Message</Alert>)
    const alert = screen.getByRole('status')
    expect(alert).toHaveClass('w-full', 'border-b')
    expect(alert).not.toHaveClass('rounded-lg')
  })

  it('shows the variant default icon, hidden from assistive technology', () => {
    render(<Alert>Message</Alert>)
    const icon = screen.getByRole('status').querySelector('svg')
    expect(icon).toHaveClass('lucide-info')
    expect(icon).toHaveAttribute('aria-hidden', 'true')
  })

  it('renders a custom icon', () => {
    render(<Alert icon={<Icon name="Eye" />}>Message</Alert>)
    const icons = screen.getByRole('status').querySelectorAll('svg')
    expect(icons).toHaveLength(1)
    expect(icons[0]).toHaveClass('lucide-eye')
  })

  it('renders no icon when icon is null', () => {
    render(<Alert icon={null}>Message</Alert>)
    expect(screen.getByRole('status').querySelector('svg')).toBeNull()
  })

  it('renders actions, including link buttons', () => {
    render(
      <Alert
        actions={
          <Button as="a" href="/admin" size="sm">
            Back to dashboard
          </Button>
        }
      >
        Message
      </Alert>,
    )
    expect(screen.getByRole('link', { name: 'Back to dashboard' })).toHaveAttribute(
      'href',
      '/admin',
    )
  })

  it('has no dismiss button without onDismiss', () => {
    render(<Alert>Message</Alert>)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('calls onDismiss when the dismiss button is clicked', async () => {
    const user = userEvent.setup()
    const onDismiss = vi.fn()
    render(<Alert onDismiss={onDismiss}>Message</Alert>)
    await user.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('uses dismissLabel as the dismiss button accessible name', () => {
    render(
      <Alert onDismiss={() => {}} dismissLabel="Fechar aviso">
        Message
      </Alert>,
    )
    expect(screen.getByRole('button', { name: 'Fechar aviso' })).toBeInTheDocument()
  })

  it('merges className and forwards HTML attributes', () => {
    render(
      <Alert id="email-alert" data-testid="alert" className="custom-class">
        Message
      </Alert>,
    )
    const alert = screen.getByTestId('alert')
    expect(alert).toHaveClass('custom-class', 'rounded-lg')
    expect(alert).toHaveAttribute('id', 'email-alert')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Alert
        variant="warning"
        title="Email not confirmed"
        actions={<Button size="sm">Resend email</Button>}
        onDismiss={() => {}}
      >
        Confirm your email to place orders.
      </Alert>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
