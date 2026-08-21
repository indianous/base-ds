import { useState } from 'react'
import { cn } from '../../../utils/cn'

export interface CorrelationPoint {
  x: number
  y: number
  label?: string
  group?: string
}

export interface CorrelationProps {
  points: CorrelationPoint[]
  xLabel?: string
  yLabel?: string
  valueFormatter?: (value: number) => string
  className?: string
}

const seriesFillClasses = ['fill-chart-1', 'fill-chart-2', 'fill-chart-3']
const seriesSwatchClasses = ['bg-chart-1', 'bg-chart-2', 'bg-chart-3']
const OTHER_FILL_CLASS = 'fill-muted-foreground'
const OTHER_SWATCH_CLASS = 'bg-muted-foreground'
const MAX_CATEGORICAL_GROUPS = 3

const defaultFormatter = (value: number) => String(value)

const WIDTH = 480
const HEIGHT = 320
const PADDING = 16

function scale(value: number, min: number, max: number, size: number) {
  if (max === min) return size / 2
  return ((value - min) / (max - min)) * size
}

export function Correlation({
  points,
  xLabel,
  yLabel,
  valueFormatter = defaultFormatter,
  className,
}: CorrelationProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const groupOrder = Array.from(
    new Set(points.filter((p) => p.group !== undefined).map((p) => p.group as string)),
  )
  const visibleGroups = groupOrder.slice(0, MAX_CATEGORICAL_GROUPS)
  const hasFold = groupOrder.length > MAX_CATEGORICAL_GROUPS
  const hasLegend = groupOrder.length > 1

  const groupColorIndex = (group: string | undefined) => {
    if (group === undefined) return -1
    const index = visibleGroups.indexOf(group)
    return index
  }

  const xs = points.map((p) => p.x)
  const ys = points.map((p) => p.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)

  const plotX = (x: number) => PADDING + scale(x, minX, maxX, WIDTH - PADDING * 2)
  const plotY = (y: number) => HEIGHT - PADDING - scale(y, minY, maxY, HEIGHT - PADDING * 2)

  const active = activeIndex !== null ? points[activeIndex] : undefined

  return (
    <figure className={cn('w-full', className)}>
      {hasLegend && (
        <ul className="mb-3 flex flex-wrap gap-4">
          {visibleGroups.map((group, i) => (
            <li key={group} className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <span
                className={cn('h-2.5 w-2.5 shrink-0 rounded-full', seriesSwatchClasses[i % 3])}
              />
              {group}
            </li>
          ))}
          {hasFold && (
            <li className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', OTHER_SWATCH_CLASS)} />
              Other
            </li>
          )}
        </ul>
      )}

      <div className="relative">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="h-72 w-full"
          role="img"
          aria-label="Scatter plot"
        >
          {[0, 0.25, 0.5, 0.75, 1].map((fraction) => (
            <line
              key={`h-${fraction}`}
              x1={PADDING}
              x2={WIDTH - PADDING}
              y1={PADDING + fraction * (HEIGHT - PADDING * 2)}
              y2={PADDING + fraction * (HEIGHT - PADDING * 2)}
              className="stroke-border"
              strokeWidth={1}
            />
          ))}
          {[0, 0.25, 0.5, 0.75, 1].map((fraction) => (
            <line
              key={`v-${fraction}`}
              y1={PADDING}
              y2={HEIGHT - PADDING}
              x1={PADDING + fraction * (WIDTH - PADDING * 2)}
              x2={PADDING + fraction * (WIDTH - PADDING * 2)}
              className="stroke-border"
              strokeWidth={1}
            />
          ))}

          {points.map((point, index) => {
            const colorIndex = groupColorIndex(point.group)
            const isOther = point.group !== undefined && colorIndex === -1
            const fillClass =
              point.group === undefined
                ? seriesFillClasses[0]
                : isOther
                  ? OTHER_FILL_CLASS
                  : seriesFillClasses[colorIndex % 3]
            const cx = plotX(point.x)
            const cy = plotY(point.y)

            return (
              <g key={index}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={12}
                  fill="transparent"
                  tabIndex={0}
                  className="focus-visible:outline-none"
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                  onFocus={() => setActiveIndex(index)}
                  onBlur={() => setActiveIndex(null)}
                />
                <circle
                  cx={cx}
                  cy={cy}
                  r={5}
                  className={cn(fillClass, 'stroke-background pointer-events-none')}
                  strokeWidth={2}
                />
              </g>
            )
          })}
        </svg>

        {active && (
          <div
            role="tooltip"
            className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-md border border-border bg-background px-3 py-2 text-sm shadow-md"
            style={{ left: `${(plotX(active.x) / WIDTH) * 100}%` }}
          >
            {active.label && <div className="font-medium text-foreground">{active.label}</div>}
            <div className="text-muted-foreground">
              {xLabel ?? 'X'}:{' '}
              <span className="font-medium text-foreground">{valueFormatter(active.x)}</span>
              {' · '}
              {yLabel ?? 'Y'}:{' '}
              <span className="font-medium text-foreground">{valueFormatter(active.y)}</span>
            </div>
          </div>
        )}
      </div>

      <table className="sr-only">
        <caption>Scatter plot data</caption>
        <thead>
          <tr>
            <th>Label</th>
            <th>{xLabel ?? 'X'}</th>
            <th>{yLabel ?? 'Y'}</th>
            <th>Group</th>
          </tr>
        </thead>
        <tbody>
          {points.map((point, index) => (
            <tr key={index}>
              <th scope="row">{point.label ?? `Point ${index + 1}`}</th>
              <td>{valueFormatter(point.x)}</td>
              <td>{valueFormatter(point.y)}</td>
              <td>{point.group ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
