import { useState } from 'react'
import { cn } from '../../../utils/cn'

export interface CandlestickDatum {
  label: string
  open: number
  high: number
  low: number
  close: number
}

export interface CandlestickProps {
  data: CandlestickDatum[]
  valueFormatter?: (value: number) => string
  className?: string
}

const defaultFormatter = (value: number) => String(value)

const WIDTH = 600
const HEIGHT = 240
const PADDING = 12

function scaleY(value: number, min: number, max: number) {
  if (max === min) return HEIGHT / 2
  return HEIGHT - PADDING - ((value - min) / (max - min)) * (HEIGHT - PADDING * 2)
}

export function Candlestick({
  data,
  valueFormatter = defaultFormatter,
  className,
}: CandlestickProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const min = Math.min(...data.map((d) => d.low))
  const max = Math.max(...data.map((d) => d.high))

  const slotWidth = (WIDTH - PADDING * 2) / Math.max(1, data.length)
  const bodyWidth = Math.min(24, slotWidth * 0.6)

  const active = activeIndex !== null ? data[activeIndex] : undefined
  const activeX = activeIndex !== null ? PADDING + slotWidth * (activeIndex + 0.5) : 0

  return (
    <figure className={cn('w-full', className)}>
      <div className="relative">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="h-60 w-full"
          role="img"
          aria-label="Candlestick chart"
        >
          {[0, 0.25, 0.5, 0.75, 1].map((fraction) => (
            <line
              key={fraction}
              x1={PADDING}
              x2={WIDTH - PADDING}
              y1={PADDING + fraction * (HEIGHT - PADDING * 2)}
              y2={PADDING + fraction * (HEIGHT - PADDING * 2)}
              className="stroke-border"
              strokeWidth={1}
            />
          ))}

          {data.map((datum, index) => {
            const x = PADDING + slotWidth * (index + 0.5)
            const isUp = datum.close >= datum.open
            const colorClass = isUp
              ? 'fill-success stroke-success'
              : 'fill-destructive stroke-destructive'
            const bodyTop = scaleY(Math.max(datum.open, datum.close), min, max)
            const bodyBottom = scaleY(Math.min(datum.open, datum.close), min, max)
            const bodyHeight = Math.max(1, bodyBottom - bodyTop)

            return (
              <g
                key={datum.label}
                tabIndex={0}
                className={cn(colorClass, 'focus-visible:outline-none focus-visible:brightness-90')}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                onFocus={() => setActiveIndex(index)}
                onBlur={() => setActiveIndex(null)}
              >
                <line
                  x1={x}
                  x2={x}
                  y1={scaleY(datum.high, min, max)}
                  y2={scaleY(datum.low, min, max)}
                  strokeWidth={2}
                  vectorEffect="non-scaling-stroke"
                />
                <rect
                  x={x - bodyWidth / 2}
                  y={bodyTop}
                  width={bodyWidth}
                  height={bodyHeight}
                  stroke="none"
                />
              </g>
            )
          })}
        </svg>

        {active && (
          <div
            role="tooltip"
            className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-md border border-border bg-background px-3 py-2 text-sm shadow-md"
            style={{ left: `${(activeX / WIDTH) * 100}%` }}
          >
            <div className="mb-1 font-medium text-foreground">{active.label}</div>
            <div className="text-muted-foreground">
              O <span className="font-medium text-foreground">{valueFormatter(active.open)}</span> H{' '}
              <span className="font-medium text-foreground">{valueFormatter(active.high)}</span> L{' '}
              <span className="font-medium text-foreground">{valueFormatter(active.low)}</span> C{' '}
              <span className="font-medium text-foreground">{valueFormatter(active.close)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="sr-only">
        <table>
          <caption>Candlestick chart data</caption>
          <thead>
            <tr>
              <th>Label</th>
              <th>Open</th>
              <th>High</th>
              <th>Low</th>
              <th>Close</th>
            </tr>
          </thead>
          <tbody>
            {data.map((datum) => (
              <tr key={datum.label}>
                <th scope="row">{datum.label}</th>
                <td>{valueFormatter(datum.open)}</td>
                <td>{valueFormatter(datum.high)}</td>
                <td>{valueFormatter(datum.low)}</td>
                <td>{valueFormatter(datum.close)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  )
}
