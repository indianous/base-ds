import { cn } from '../../../utils/cn'
import { Tooltip } from '../../molecules/Tooltip/Tooltip'

export interface BarChartDatum {
  label: string
  values: number[]
}

export interface BarChartProps {
  data: BarChartDatum[]
  seriesNames?: string[] | undefined
  orientation?: 'horizontal' | 'vertical'
  valueFormatter?: (value: number) => string
  className?: string
}

const seriesColorClasses = ['bg-chart-1', 'bg-chart-2', 'bg-chart-3', 'bg-chart-4']

const defaultFormatter = (value: number) => String(value)

function Legend({
  seriesCount,
  seriesNames,
}: {
  seriesCount: number
  seriesNames?: string[] | undefined
}) {
  return (
    <ul className="mb-3 flex flex-wrap gap-4">
      {Array.from({ length: seriesCount }, (_, i) => (
        <li key={i} className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <span className={cn('h-2.5 w-2.5 shrink-0 rounded-sm', seriesColorClasses[i])} />
          {seriesNames?.[i] ?? `Series ${i + 1}`}
        </li>
      ))}
    </ul>
  )
}

function DataTable({
  data,
  seriesCount,
  seriesNames,
  valueFormatter,
}: {
  data: BarChartDatum[]
  seriesCount: number
  seriesNames?: string[] | undefined
  valueFormatter: (value: number) => string
}) {
  return (
    <table className="sr-only">
      <caption>Bar chart data</caption>
      <thead>
        <tr>
          <th>Label</th>
          {Array.from({ length: seriesCount }, (_, i) => (
            <th key={i}>{seriesNames?.[i] ?? `Series ${i + 1}`}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((datum) => (
          <tr key={datum.label}>
            <th scope="row">{datum.label}</th>
            {datum.values.map((value, i) => (
              <td key={i}>{valueFormatter(value)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function BarChart({
  data,
  seriesNames,
  orientation = 'horizontal',
  valueFormatter = defaultFormatter,
  className,
}: BarChartProps) {
  const seriesCount = seriesNames?.length ?? data[0]?.values.length ?? 1
  const maxValue = Math.max(1, ...data.flatMap((datum) => datum.values))
  const hasLegend = seriesCount > 1

  const tableProps = { data, seriesCount, seriesNames, valueFormatter }

  if (orientation === 'vertical') {
    return (
      <figure className={cn('w-full', className)}>
        {hasLegend && <Legend seriesCount={seriesCount} seriesNames={seriesNames} />}

        <div
          data-testid="bar-chart-body"
          className="flex h-56 items-end justify-around gap-4 border-b border-border"
        >
          {data.map((datum) => (
            <div key={datum.label} className="flex h-full flex-1 flex-col items-center">
              <div className="flex h-full items-end gap-1">
                {datum.values.map((value, seriesIndex) => {
                  const percent = (value / maxValue) * 100
                  const colorClass = hasLegend ? seriesColorClasses[seriesIndex % 4] : 'bg-chart-1'
                  const seriesLabel = seriesNames?.[seriesIndex]
                  const tooltipLabel = seriesLabel
                    ? `${datum.label} — ${seriesLabel}: ${valueFormatter(value)}`
                    : `${datum.label}: ${valueFormatter(value)}`

                  return (
                    <Tooltip key={seriesIndex} label={tooltipLabel}>
                      <button
                        type="button"
                        className="flex h-full w-8 flex-col-reverse items-center gap-1 bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <div
                          className={cn('w-full max-h-full rounded-t-sm', colorClass)}
                          style={{ height: `${percent}%` }}
                        />
                        <span className="text-xs text-foreground">{valueFormatter(value)}</span>
                      </button>
                    </Tooltip>
                  )
                })}
              </div>
              <span className="mt-2 text-sm text-foreground">{datum.label}</span>
            </div>
          ))}
        </div>

        <DataTable {...tableProps} />
      </figure>
    )
  }

  return (
    <figure className={cn('w-full', className)}>
      {hasLegend && <Legend seriesCount={seriesCount} seriesNames={seriesNames} />}

      <div data-testid="bar-chart-body" className="flex flex-col gap-3">
        {data.map((datum) => (
          <div key={datum.label} className="flex flex-col gap-1">
            <span className="text-sm text-foreground">{datum.label}</span>
            <div className="flex flex-col gap-0.5">
              {datum.values.map((value, seriesIndex) => {
                const percent = (value / maxValue) * 100
                const colorClass = hasLegend ? seriesColorClasses[seriesIndex % 4] : 'bg-chart-1'
                const seriesLabel = seriesNames?.[seriesIndex]
                const tooltipLabel = seriesLabel
                  ? `${datum.label} — ${seriesLabel}: ${valueFormatter(value)}`
                  : `${datum.label}: ${valueFormatter(value)}`

                return (
                  <Tooltip key={seriesIndex} label={tooltipLabel}>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 border-l border-border bg-transparent py-0.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <div className="h-4 flex-1">
                        <div
                          className={cn('h-full max-w-full rounded-r-sm', colorClass)}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="w-16 shrink-0 text-right text-sm text-foreground">
                        {valueFormatter(value)}
                      </span>
                    </button>
                  </Tooltip>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <DataTable {...tableProps} />
    </figure>
  )
}
