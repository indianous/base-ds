import { useState } from 'react'
import { cn } from '../../../utils/cn'

export interface PieChartDatum {
  label: string
  value: number
}

export interface PieChartProps {
  data: PieChartDatum[]
  valueFormatter?: (value: number) => string
  className?: string
}

const seriesFillClasses = ['fill-chart-1', 'fill-chart-2', 'fill-chart-3', 'fill-chart-4']
const seriesSwatchClasses = ['bg-chart-1', 'bg-chart-2', 'bg-chart-3', 'bg-chart-4']
const OTHER_FILL_CLASS = 'fill-muted'
const OTHER_SWATCH_CLASS = 'bg-muted'
const MAX_CATEGORICAL_SLICES = 4

const defaultFormatter = (value: number) => String(value)

const SIZE = 220
const CENTER = SIZE / 2
const RADIUS = 96

function polarToCartesian(angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180
  return {
    x: CENTER + RADIUS * Math.cos(angleInRadians),
    y: CENTER + RADIUS * Math.sin(angleInRadians),
  }
}

function slicePath(startAngle: number, endAngle: number) {
  const start = polarToCartesian(endAngle)
  const end = polarToCartesian(startAngle)
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0
  const isFullCircle = endAngle - startAngle >= 359.999

  if (isFullCircle) {
    const mid = polarToCartesian(startAngle + 180)
    return `M ${CENTER},${CENTER - RADIUS} A ${RADIUS},${RADIUS} 0 1,1 ${mid.x},${mid.y} A ${RADIUS},${RADIUS} 0 1,1 ${CENTER},${CENTER - RADIUS} Z`
  }

  return `M ${CENTER},${CENTER} L ${start.x},${start.y} A ${RADIUS},${RADIUS} 0 ${largeArcFlag},0 ${end.x},${end.y} Z`
}

interface Slice {
  label: string
  value: number
  isOther: boolean
  colorIndex: number
}

function buildSlices(data: PieChartDatum[]): Slice[] {
  const sorted = [...data].sort((a, b) => b.value - a.value)

  if (sorted.length <= MAX_CATEGORICAL_SLICES) {
    return sorted.map((datum, index) => ({
      label: datum.label,
      value: datum.value,
      isOther: false,
      colorIndex: index,
    }))
  }

  const visible = sorted.slice(0, MAX_CATEGORICAL_SLICES)
  const rest = sorted.slice(MAX_CATEGORICAL_SLICES)
  const otherValue = rest.reduce((sum, datum) => sum + datum.value, 0)

  return [
    ...visible.map((datum, index) => ({
      label: datum.label,
      value: datum.value,
      isOther: false,
      colorIndex: index,
    })),
    { label: 'Other', value: otherValue, isOther: true, colorIndex: -1 },
  ]
}

export function PieChart({ data, valueFormatter = defaultFormatter, className }: PieChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const slices = buildSlices(data)
  const total = Math.max(
    1,
    slices.reduce((sum, slice) => sum + slice.value, 0),
  )

  const angledSlices = slices.reduce<
    Array<Slice & { percent: number; startAngle: number; endAngle: number }>
  >((acc, slice) => {
    const previous = acc.at(-1)
    const startAngle = previous?.endAngle ?? 0
    const endAngle = startAngle + (slice.value / total) * 360
    const percent = (slice.value / total) * 100
    return [...acc, { ...slice, percent, startAngle, endAngle }]
  }, [])

  const active = activeIndex !== null ? angledSlices[activeIndex] : undefined

  return (
    <figure className={cn('w-full', className)}>
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="relative shrink-0">
          <svg
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            className="h-56 w-56"
            role="img"
            aria-label="Pie chart"
          >
            {angledSlices.map((slice, index) => (
              <path
                key={slice.label}
                d={slicePath(slice.startAngle, slice.endAngle)}
                tabIndex={0}
                className={cn(
                  slice.isOther ? OTHER_FILL_CLASS : seriesFillClasses[slice.colorIndex % 4],
                  'stroke-background focus-visible:outline-none focus-visible:brightness-90',
                )}
                strokeWidth={2}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                onFocus={() => setActiveIndex(index)}
                onBlur={() => setActiveIndex(null)}
              />
            ))}
          </svg>

          {active && (
            <div
              role="tooltip"
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-md border border-border bg-background px-3 py-2 text-center text-sm shadow-md"
            >
              <div className="font-medium text-foreground">{active.label}</div>
              <div className="text-muted-foreground">
                {valueFormatter(active.value)} ({active.percent.toFixed(0)}%)
              </div>
            </div>
          )}
        </div>

        <ul className="flex flex-col gap-2">
          {angledSlices.map((slice) => (
            <li key={slice.label} className="flex items-center gap-2 text-sm text-muted-foreground">
              <span
                className={cn(
                  'h-2.5 w-2.5 shrink-0 rounded-sm',
                  slice.isOther ? OTHER_SWATCH_CLASS : seriesSwatchClasses[slice.colorIndex % 4],
                )}
              />
              <span className="text-foreground">{slice.label}</span>
              <span>
                {valueFormatter(slice.value)} ({slice.percent.toFixed(0)}%)
              </span>
            </li>
          ))}
        </ul>
      </div>

      <table className="sr-only">
        <caption>Pie chart data</caption>
        <thead>
          <tr>
            <th>Label</th>
            <th>Value</th>
            <th>Percent</th>
          </tr>
        </thead>
        <tbody>
          {angledSlices.map((slice) => (
            <tr key={slice.label}>
              <th scope="row">{slice.label}</th>
              <td>{valueFormatter(slice.value)}</td>
              <td>{slice.percent.toFixed(0)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
