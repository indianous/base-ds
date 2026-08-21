import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { BarChart } from './BarChart'
import type { BarChartDatum } from './BarChart'

const singleSeriesData: BarChartDatum[] = [
  { label: 'Organic', values: [420] },
  { label: 'Paid Search', values: [180] },
  { label: 'Social', values: [90] },
]

const multiSeriesData: BarChartDatum[] = [
  { label: 'Organic', values: [420, 380] },
  { label: 'Paid Search', values: [180, 150] },
]

describe('BarChart', () => {
  it('renders one bar row per datum', () => {
    render(<BarChart data={singleSeriesData} />)
    const body = within(screen.getByTestId('bar-chart-body'))
    expect(body.getByText('Organic')).toBeInTheDocument()
    expect(body.getByText('Paid Search')).toBeInTheDocument()
    expect(body.getByText('Social')).toBeInTheDocument()
  })

  it('renders formatted values next to each bar', () => {
    render(<BarChart data={singleSeriesData} />)
    const body = within(screen.getByTestId('bar-chart-body'))
    expect(body.getByText('420')).toBeInTheDocument()
    expect(body.getByText('180')).toBeInTheDocument()
  })

  it('does not render a legend for a single series', () => {
    render(<BarChart data={singleSeriesData} />)
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('renders a legend with series names for multiple series', () => {
    render(<BarChart data={multiSeriesData} seriesNames={['This month', 'Last month']} />)
    const legend = within(screen.getByRole('list'))
    expect(legend.getByText('This month')).toBeInTheDocument()
    expect(legend.getByText('Last month')).toBeInTheDocument()
  })

  it('applies a custom valueFormatter', () => {
    render(<BarChart data={singleSeriesData} valueFormatter={(v) => `R$ ${v.toFixed(2)}`} />)
    const body = within(screen.getByTestId('bar-chart-body'))
    expect(body.getByText('R$ 420.00')).toBeInTheDocument()
  })

  it('shows a tooltip with the value on hover', async () => {
    render(<BarChart data={singleSeriesData} />)
    const body = within(screen.getByTestId('bar-chart-body'))
    const bar = body.getByText('420').closest('button') as HTMLElement
    await userEvent.hover(bar)
    expect(screen.getByRole('tooltip')).toHaveTextContent('Organic: 420')
  })

  it('renders an accessible sr-only table with the same data', () => {
    render(<BarChart data={singleSeriesData} />)
    const table = screen.getByRole('table')
    expect(table).toHaveClass('sr-only')
    expect(within(table).getByText('Organic')).toBeInTheDocument()
    expect(within(table).getByText('420')).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<BarChart data={singleSeriesData} />)
    expect(await axe(container)).toHaveNoViolations()
  })

  describe('orientation="vertical"', () => {
    it('renders one column per datum with its label and value', () => {
      render(<BarChart data={singleSeriesData} orientation="vertical" />)
      const body = within(screen.getByTestId('bar-chart-body'))
      expect(body.getByText('Organic')).toBeInTheDocument()
      expect(body.getByText('420')).toBeInTheDocument()
    })

    it('shows a tooltip with the value on hover', async () => {
      render(<BarChart data={singleSeriesData} orientation="vertical" />)
      const body = within(screen.getByTestId('bar-chart-body'))
      const bar = body.getByText('420').closest('button') as HTMLElement
      await userEvent.hover(bar)
      expect(screen.getByRole('tooltip')).toHaveTextContent('Organic: 420')
    })

    it('has no accessibility violations', async () => {
      const { container } = render(<BarChart data={singleSeriesData} orientation="vertical" />)
      expect(await axe(container)).toHaveNoViolations()
    })
  })
})
