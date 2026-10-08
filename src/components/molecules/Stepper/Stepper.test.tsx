import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { Stepper } from './Stepper'
import type { StepperProps } from './Stepper'

const steps = [
  { id: 'cart', label: 'Cart' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'payment', label: 'Payment' },
]

const renderStepper = (props: Partial<StepperProps> = {}) =>
  render(<Stepper steps={steps} current="delivery" {...props} />)

const items = () => within(screen.getByRole('list', { name: 'Steps' })).getAllByRole('listitem')

describe('Stepper', () => {
  it('renders an ordered list named by label, one item per step', () => {
    renderStepper()
    const list = screen.getByRole('list', { name: 'Steps' })
    expect(list.tagName).toBe('OL')
    expect(items().map((item) => item.textContent)).toEqual([
      expect.stringContaining('Cart'),
      expect.stringContaining('Delivery'),
      expect.stringContaining('Payment'),
    ])
  })

  it('marks only the current step with aria-current="step"', () => {
    renderStepper()
    const [cart, delivery, payment] = items()
    expect(cart).not.toHaveAttribute('aria-current')
    expect(delivery).toHaveAttribute('aria-current', 'step')
    expect(payment).not.toHaveAttribute('aria-current')
  })

  it('tells the state of each step to screen readers and checks the completed ones', () => {
    renderStepper()
    const [cart, delivery, payment] = items()
    expect(cart).toHaveTextContent('Cart, completed')
    expect(delivery).toHaveTextContent('Delivery, current')
    expect(payment).toHaveTextContent('Payment, not started')
    expect(cart?.querySelector('svg')).not.toBeNull()
    expect(cart).not.toHaveTextContent('1')
    expect(payment).toHaveTextContent('3')
  })

  it('has no buttons without onStepClick', () => {
    renderStepper()
    expect(screen.queryAllByRole('button')).toHaveLength(0)
  })

  it('makes only the completed steps buttons that call onStepClick', async () => {
    const onStepClick = vi.fn()
    renderStepper({ current: 'payment', onStepClick })
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(2)
    await userEvent.click(screen.getByRole('button', { name: /Delivery/ }))
    expect(onStepClick).toHaveBeenCalledWith('delivery')
    expect(within(items()[2] as HTMLElement).queryByRole('button')).toBeNull()
  })

  it('shows the compact progress text and bar', () => {
    renderStepper()
    expect(screen.getByText('Step 2 of 3 — Delivery')).toBeInTheDocument()
    const bar = screen.getByText('Step 2 of 3 — Delivery').nextElementSibling?.firstElementChild
    expect(bar).toHaveStyle({ width: `${(2 / 3) * 100}%` })
  })

  it('switches between the list and the compact view by screen width', () => {
    renderStepper()
    expect(screen.getByRole('list', { name: 'Steps' }).className).toMatch(/(^| )hidden( |$)/)
    expect(screen.getByRole('list', { name: 'Steps' }).className).toContain('sm:flex')
    expect(screen.getByText('Step 2 of 3 — Delivery').parentElement?.className).toContain(
      'sm:hidden',
    )
  })

  it('treats every step as not started when current matches none', () => {
    renderStepper({ current: 'unknown', onStepClick: () => {} })
    for (const item of items()) {
      expect(item).not.toHaveAttribute('aria-current')
      expect(item).toHaveTextContent('not started')
    }
    expect(screen.queryAllByRole('button')).toHaveLength(0)
  })

  it('passes other attributes to the outer element', () => {
    const { container } = renderStepper({ className: 'mb-4', id: 'checkout-steps' })
    expect(container.firstElementChild).toHaveAttribute('id', 'checkout-steps')
    expect(container.firstElementChild?.className).toContain('mb-4')
  })

  it('accepts a custom label', () => {
    renderStepper({ label: 'Etapas do pedido' })
    expect(screen.getByRole('list', { name: 'Etapas do pedido' })).toBeInTheDocument()
  })

  it('accepts a custom completedStepLabel', () => {
    renderStepper({ completedStepLabel: 'concluída' })
    expect(items()[0]).toHaveTextContent('Cart, concluída')
  })

  it('accepts a custom currentStepLabel', () => {
    renderStepper({ currentStepLabel: 'atual' })
    expect(items()[1]).toHaveTextContent('Delivery, atual')
  })

  it('accepts a custom upcomingStepLabel', () => {
    renderStepper({ upcomingStepLabel: 'a fazer' })
    expect(items()[2]).toHaveTextContent('Payment, a fazer')
  })

  it('accepts a custom progressMessage', () => {
    renderStepper({
      progressMessage: (step, total, label) => `Etapa ${step} de ${total} — ${label}`,
    })
    expect(screen.getByText('Etapa 2 de 3 — Delivery')).toBeInTheDocument()
  })

  it.each([undefined, () => {}])('has no accessibility violations (onStepClick %s)', async (fn) => {
    const { container } = renderStepper({ current: 'payment', ...(fn && { onStepClick: fn }) })
    expect(await axe(container)).toHaveNoViolations()
  })
})
