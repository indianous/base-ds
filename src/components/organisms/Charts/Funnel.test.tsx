import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { Funnel } from './Funnel'
import type { FunnelStep } from './Funnel'

const steps: FunnelStep[] = [
  { label: 'Visitors', value: 1000 },
  { label: 'Added to cart', value: 400 },
  { label: 'Checkout started', value: 250 },
  { label: 'Purchased', value: 120 },
]

describe('Funnel', () => {
  it('renders one row per step with its label and value', () => {
    render(<Funnel steps={steps} />)
    const body = within(screen.getByTestId('funnel-body'))
    expect(body.getByText(/Visitors/)).toBeInTheDocument()
    expect(body.getByText(/Purchased/)).toBeInTheDocument()
  })

  it('shows the percentage of the first step for each step', () => {
    render(<Funnel steps={steps} />)
    const body = within(screen.getByTestId('funnel-body'))
    expect(body.getByText(/100%/)).toBeInTheDocument()
    expect(body.getByText(/40%/)).toBeInTheDocument()
  })

  it('shows the drop-off versus the previous step, except for the first step', () => {
    render(<Funnel steps={steps} />)
    const body = within(screen.getByTestId('funnel-body'))
    expect(body.queryAllByText(/vs anterior/).length).toBeGreaterThan(0)
    const firstRow = body.getByText(/Visitors/).closest('button')
    expect(firstRow).not.toHaveTextContent('vs anterior')
  })

  it('applies a custom valueFormatter', () => {
    render(<Funnel steps={steps} valueFormatter={(v) => `${v} users`} />)
    const body = within(screen.getByTestId('funnel-body'))
    expect(body.getByText(/1000 users/)).toBeInTheDocument()
  })

  it('shows a tooltip with the value on hover', async () => {
    render(<Funnel steps={steps} />)
    const body = within(screen.getByTestId('funnel-body'))
    const row = body.getByText(/Visitors/).closest('button') as HTMLElement
    await userEvent.hover(row)
    expect(screen.getByRole('tooltip')).toHaveTextContent('Visitors: 1000')
  })

  it('renders an accessible sr-only table with the same data', () => {
    render(<Funnel steps={steps} />)
    const table = screen.getByRole('table')
    expect(table.parentElement).toHaveClass('sr-only')
    expect(within(table).getByText('Checkout started')).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<Funnel steps={steps} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
