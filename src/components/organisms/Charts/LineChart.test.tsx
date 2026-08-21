import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { LineChart } from './LineChart'
import type { LineChartSeriesData } from './LineChart'

const labels = ['Jan', 'Feb', 'Mar', 'Apr']

const singleSeries: LineChartSeriesData[] = [{ name: 'Revenue', values: [100, 150, 120, 200] }]

const multiSeries: LineChartSeriesData[] = [
  { name: 'This year', values: [100, 150, 120, 200] },
  { name: 'Last year', values: [80, 90, 100, 110] },
]

describe('LineChart', () => {
  it('renders an svg with an accessible label', () => {
    render(<LineChart labels={labels} series={singleSeries} />)
    expect(screen.getByRole('img', { name: 'Line chart' })).toBeInTheDocument()
  })

  it('does not render a legend for a single series', () => {
    render(<LineChart labels={labels} series={singleSeries} />)
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('renders a legend with series names for multiple series', () => {
    render(<LineChart labels={labels} series={multiSeries} />)
    const legend = within(screen.getByRole('list'))
    expect(legend.getByText('This year')).toBeInTheDocument()
    expect(legend.getByText('Last year')).toBeInTheDocument()
  })

  it('does not show a tooltip initially', () => {
    render(<LineChart labels={labels} series={singleSeries} />)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('shows a tooltip with the label and value on focus', async () => {
    render(<LineChart labels={labels} series={singleSeries} />)
    const svg = screen.getByRole('img', { name: 'Line chart' })
    await userEvent.tab()
    expect(svg).toHaveFocus()
    expect(screen.getByRole('tooltip')).toHaveTextContent('Jan')
    expect(screen.getByRole('tooltip')).toHaveTextContent('100')
  })

  it('moves the tooltip to the next point on ArrowRight', async () => {
    render(<LineChart labels={labels} series={singleSeries} />)
    await userEvent.tab()
    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getByRole('tooltip')).toHaveTextContent('Feb')
    expect(screen.getByRole('tooltip')).toHaveTextContent('150')
  })

  it('shows every series in the tooltip at once', async () => {
    render(<LineChart labels={labels} series={multiSeries} />)
    await userEvent.tab()
    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toHaveTextContent('100')
    expect(tooltip).toHaveTextContent('80')
  })

  it('hides the tooltip on Escape', async () => {
    render(<LineChart labels={labels} series={singleSeries} />)
    await userEvent.tab()
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('renders an accessible sr-only table with the same data', () => {
    render(<LineChart labels={labels} series={singleSeries} />)
    const table = screen.getByRole('table')
    expect(table).toHaveClass('sr-only')
    expect(within(table).getByText('Jan')).toBeInTheDocument()
    expect(within(table).getByText('200')).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<LineChart labels={labels} series={singleSeries} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
