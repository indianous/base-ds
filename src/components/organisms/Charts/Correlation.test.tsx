import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { Correlation } from './Correlation'
import type { CorrelationPoint } from './Correlation'

const ungroupedPoints: CorrelationPoint[] = [
  { x: 10, y: 20, label: 'A' },
  { x: 15, y: 35, label: 'B' },
  { x: 22, y: 28, label: 'C' },
]

const groupedPoints: CorrelationPoint[] = [
  { x: 10, y: 20, label: 'A', group: 'Free' },
  { x: 15, y: 35, label: 'B', group: 'Pro' },
  { x: 22, y: 28, label: 'C', group: 'Enterprise' },
  { x: 30, y: 40, label: 'D', group: 'Trial' },
  { x: 12, y: 18, label: 'E', group: 'Beta' },
]

describe('Correlation', () => {
  it('renders an svg with an accessible label', () => {
    render(<Correlation points={ungroupedPoints} />)
    expect(screen.getByRole('img', { name: 'Scatter plot' })).toBeInTheDocument()
  })

  it('does not render a legend when points are ungrouped', () => {
    render(<Correlation points={ungroupedPoints} />)
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('renders a legend capped at 3 groups plus an Other bucket', () => {
    render(<Correlation points={groupedPoints} />)
    const legend = within(screen.getByRole('list'))
    const items = legend.getAllByRole('listitem')
    expect(items).toHaveLength(4)
    expect(legend.getByText('Other')).toBeInTheDocument()
  })

  it('does not show a tooltip initially', () => {
    render(<Correlation points={ungroupedPoints} />)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('shows a tooltip with label, x and y on focus', async () => {
    render(<Correlation points={ungroupedPoints} xLabel="Age" yLabel="Spend" />)
    await userEvent.tab()
    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toHaveTextContent('A')
    expect(tooltip).toHaveTextContent('Age')
    expect(tooltip).toHaveTextContent('10')
    expect(tooltip).toHaveTextContent('Spend')
    expect(tooltip).toHaveTextContent('20')
  })

  it('renders an accessible sr-only table with x, y, label and group', () => {
    render(<Correlation points={ungroupedPoints} />)
    const table = screen.getByRole('table')
    expect(table.parentElement).toHaveClass('sr-only')
    const row = within(table).getByText('B').closest('tr') as HTMLElement
    expect(within(row).getByText('15')).toBeInTheDocument()
    expect(within(row).getByText('35')).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<Correlation points={groupedPoints} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
