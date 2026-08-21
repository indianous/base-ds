import { useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent } from 'react'
import { cn } from '../../../utils/cn'

export interface LineChartSeriesData {
  name: string
  values: number[]
}

export interface LineChartProps {
  labels: string[]
  series: LineChartSeriesData[]
  valueFormatter?: (value: number) => string
  className?: string
}

const seriesColorClasses = ['stroke-chart-1', 'stroke-chart-2', 'stroke-chart-3', 'stroke-chart-4']
const seriesSwatchClasses = ['bg-chart-1', 'bg-chart-2', 'bg-chart-3', 'bg-chart-4']

const defaultFormatter = (value: number) => String(value)

const WIDTH = 600
const HEIGHT = 240
const PADDING = 12

function pointX(index: number, count: number) {
  if (count <= 1) return WIDTH / 2
  return PADDING + (index / (count - 1)) * (WIDTH - PADDING * 2)
}

function pointY(value: number, min: number, max: number) {
  if (max === min) return HEIGHT / 2
  return HEIGHT - PADDING - ((value - min) / (max - min)) * (HEIGHT - PADDING * 2)
}

export function LineChart({
  labels,
  series,
  valueFormatter = defaultFormatter,
  className,
}: LineChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const hasLegend = series.length > 1

  const allValues = series.flatMap((s) => s.values)
  const min = Math.min(0, ...allValues)
  const max = Math.max(1, ...allValues)

  const setIndexFromClientX = (clientX: number, svg: SVGSVGElement) => {
    const rect = svg.getBoundingClientRect()
    const relativeX = ((clientX - rect.left) / rect.width) * WIDTH
    let closest = 0
    let closestDistance = Infinity
    labels.forEach((_, index) => {
      const distance = Math.abs(pointX(index, labels.length) - relativeX)
      if (distance < closestDistance) {
        closestDistance = distance
        closest = index
      }
    })
    setActiveIndex(closest)
  }

  const handleMouseMove = (e: ReactMouseEvent<SVGSVGElement>) => {
    setIndexFromClientX(e.clientX, e.currentTarget)
  }

  const handleKeyDown = (e: ReactKeyboardEvent<SVGSVGElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(labels.length - 1, (i ?? -1) + 1))
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(0, (i ?? labels.length) - 1))
    } else if (e.key === 'Escape') {
      setActiveIndex(null)
    }
  }

  return (
    <figure className={cn('w-full', className)}>
      {hasLegend && (
        <ul className="mb-3 flex flex-wrap gap-4">
          {series.map((s, i) => (
            <li key={s.name} className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <span className={cn('h-0.5 w-4 shrink-0', seriesSwatchClasses[i % 4])} />
              {s.name}
            </li>
          ))}
        </ul>
      )}

      <div className="relative">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="h-60 w-full"
          tabIndex={0}
          role="img"
          aria-label="Line chart"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setActiveIndex(null)}
          onFocus={() => setActiveIndex((i) => i ?? 0)}
          onBlur={() => setActiveIndex(null)}
          onKeyDown={handleKeyDown}
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

          {activeIndex !== null && (
            <line
              x1={pointX(activeIndex, labels.length)}
              x2={pointX(activeIndex, labels.length)}
              y1={PADDING}
              y2={HEIGHT - PADDING}
              className="stroke-border"
              strokeWidth={1}
            />
          )}

          {series.map((s, seriesIndex) => {
            const path = s.values
              .map((value, index) => {
                const command = index === 0 ? 'M' : 'L'
                return `${command}${pointX(index, labels.length)},${pointY(value, min, max)}`
              })
              .join(' ')

            return (
              <g key={s.name}>
                <path
                  d={path}
                  fill="none"
                  className={seriesColorClasses[seriesIndex % 4]}
                  strokeWidth={2}
                  vectorEffect="non-scaling-stroke"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {activeIndex !== null && (
                  <circle
                    cx={pointX(activeIndex, labels.length)}
                    cy={pointY(s.values[activeIndex] ?? 0, min, max)}
                    r={4}
                    className={cn(
                      seriesColorClasses[seriesIndex % 4],
                      'fill-current stroke-background',
                    )}
                    strokeWidth={2}
                  />
                )}
              </g>
            )
          })}
        </svg>

        {activeIndex !== null && (
          <div
            role="tooltip"
            className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-md border border-border bg-background px-3 py-2 text-sm shadow-md"
            style={{ left: `${(pointX(activeIndex, labels.length) / WIDTH) * 100}%` }}
          >
            <div className="mb-1 font-medium text-foreground">{labels[activeIndex]}</div>
            {series.map((s, i) => (
              <div key={s.name} className="flex items-center gap-1.5 text-muted-foreground">
                <span className={cn('h-0.5 w-3 shrink-0', seriesSwatchClasses[i % 4])} />
                <span className="font-medium text-foreground">
                  {valueFormatter(s.values[activeIndex] ?? 0)}
                </span>
                {hasLegend && <span>{s.name}</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="sr-only">
        <table>
          <caption>Line chart data</caption>
          <thead>
            <tr>
              <th>Label</th>
              {series.map((s) => (
                <th key={s.name}>{s.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {labels.map((label, index) => (
              <tr key={label}>
                <th scope="row">{label}</th>
                {series.map((s) => (
                  <td key={s.name}>{valueFormatter(s.values[index] ?? 0)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  )
}
