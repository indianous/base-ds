import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { PieChart } from './PieChart'
import type { PieChartDatum } from './PieChart'

const fewSlices: PieChartDatum[] = [
  { label: 'Desktop', value: 60 },
  { label: 'Mobile', value: 30 },
  { label: 'Tablet', value: 10 },
]

const manySlices: PieChartDatum[] = [
  { label: 'A', value: 40 },
  { label: 'B', value: 25 },
  { label: 'C', value: 15 },
  { label: 'D', value: 10 },
  { label: 'E', value: 6 },
  { label: 'F', value: 4 },
]

describe('PieChart', () => {
  it('renders an svg with an accessible label', () => {
    render(<PieChart data={fewSlices} />)
    expect(screen.getByRole('img', { name: 'Pie chart' })).toBeInTheDocument()
  })

  it('renders a legend item per slice with label and percent', () => {
    render(<PieChart data={fewSlices} />)
    const legend = within(screen.getByRole('list'))
    expect(legend.getByText('Desktop')).toBeInTheDocument()
    expect(legend.getByText(/60%/)).toBeInTheDocument()
  })

  it('folds slices beyond the 4th into a single "Other" slice', () => {
    render(<PieChart data={manySlices} />)
    const legend = within(screen.getByRole('list'))
    const items = legend.getAllByRole('listitem')
    expect(items).toHaveLength(5)
    const otherItem = legend.getByText('Other').closest('li') as HTMLElement
    // E (6) + F (4) folded = 10
    expect(otherItem).toHaveTextContent('10 (10%)')
  })

  it('does not fold when there are 4 or fewer slices', () => {
    render(<PieChart data={fewSlices} />)
    const legend = within(screen.getByRole('list'))
    expect(legend.getAllByRole('listitem')).toHaveLength(3)
    expect(legend.queryByText('Other')).not.toBeInTheDocument()
  })

  it('does not show a tooltip initially', () => {
    render(<PieChart data={fewSlices} />)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('shows a tooltip with label, value and percent on focus', async () => {
    render(<PieChart data={fewSlices} />)
    await userEvent.tab()
    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toHaveTextContent('Desktop')
    expect(tooltip).toHaveTextContent('60')
  })

  it('renders an accessible sr-only table with the same data', () => {
    render(<PieChart data={fewSlices} />)
    const table = screen.getByRole('table')
    expect(table).toHaveClass('sr-only')
    expect(within(table).getByText('Mobile')).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<PieChart data={fewSlices} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
