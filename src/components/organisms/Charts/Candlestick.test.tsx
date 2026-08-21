import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { Candlestick } from './Candlestick'
import type { CandlestickDatum } from './Candlestick'

const data: CandlestickDatum[] = [
  { label: 'Mon', open: 100, high: 110, low: 95, close: 105 },
  { label: 'Tue', open: 105, high: 108, low: 98, close: 99 },
  { label: 'Wed', open: 99, high: 115, low: 97, close: 112 },
]

describe('Candlestick', () => {
  it('renders an svg with an accessible label', () => {
    render(<Candlestick data={data} />)
    expect(screen.getByRole('img', { name: 'Candlestick chart' })).toBeInTheDocument()
  })

  it('does not show a tooltip initially', () => {
    render(<Candlestick data={data} />)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('shows a tooltip with OHLC values on focus', async () => {
    render(<Candlestick data={data} />)
    await userEvent.tab()
    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toHaveTextContent('Mon')
    expect(tooltip).toHaveTextContent('100')
    expect(tooltip).toHaveTextContent('110')
    expect(tooltip).toHaveTextContent('95')
    expect(tooltip).toHaveTextContent('105')
  })

  it('moves the tooltip to the next candle on Tab', async () => {
    render(<Candlestick data={data} />)
    await userEvent.tab()
    await userEvent.tab()
    expect(screen.getByRole('tooltip')).toHaveTextContent('Tue')
  })

  it('applies a custom valueFormatter', async () => {
    render(<Candlestick data={data} valueFormatter={(v) => `$${v}`} />)
    await userEvent.tab()
    expect(screen.getByRole('tooltip')).toHaveTextContent('$100')
  })

  it('renders an accessible sr-only table with open/high/low/close', () => {
    render(<Candlestick data={data} />)
    const table = screen.getByRole('table')
    expect(table.parentElement).toHaveClass('sr-only')
    const row = within(table).getByText('Wed').closest('tr') as HTMLElement
    expect(within(row).getByText('112')).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<Candlestick data={data} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
