import { cn } from '../../../utils/cn'
import { Tooltip } from '../../molecules/Tooltip/Tooltip'

export interface FunnelStep {
  label: string
  value: number
}

export interface FunnelProps {
  steps: FunnelStep[]
  valueFormatter?: (value: number) => string
  className?: string
}

const sequentialColorClasses = [
  'bg-chart-sequential-250',
  'bg-chart-sequential-300',
  'bg-chart-sequential-350',
  'bg-chart-sequential-400',
  'bg-chart-sequential-450',
  'bg-chart-sequential-500',
  'bg-chart-sequential-550',
  'bg-chart-sequential-600',
  'bg-chart-sequential-650',
  'bg-chart-sequential-700',
]

const FALLBACK_COLOR_CLASS = 'bg-chart-sequential-500'

function sampleColors(count: number): string[] {
  if (count <= 1) {
    return [
      sequentialColorClasses[Math.floor(sequentialColorClasses.length / 2)] ?? FALLBACK_COLOR_CLASS,
    ]
  }
  return Array.from({ length: count }, (_, i) => {
    const index = Math.round((i * (sequentialColorClasses.length - 1)) / (count - 1))
    return sequentialColorClasses[index] ?? FALLBACK_COLOR_CLASS
  })
}

const defaultFormatter = (value: number) => String(value)

export function Funnel({ steps, valueFormatter = defaultFormatter, className }: FunnelProps) {
  const colors = sampleColors(steps.length)
  const firstValue = steps[0]?.value || 1

  return (
    <figure className={cn('w-full', className)}>
      <div data-testid="funnel-body" className="flex flex-col gap-2">
        {steps.map((step, index) => {
          const percentOfFirst = (step.value / firstValue) * 100
          const previous = steps[index - 1]
          const dropOff =
            previous && previous.value > 0
              ? ((step.value - previous.value) / previous.value) * 100
              : undefined

          const tooltipLabel =
            dropOff === undefined
              ? `${step.label}: ${valueFormatter(step.value)} (${percentOfFirst.toFixed(0)}%)`
              : `${step.label}: ${valueFormatter(step.value)} (${percentOfFirst.toFixed(0)}%, ${dropOff.toFixed(0)}% vs previous)`

          return (
            <Tooltip key={step.label} label={tooltipLabel}>
              <button
                type="button"
                className="flex w-full flex-col items-center gap-1 bg-transparent py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div
                  className={cn('mx-auto h-6 max-w-full rounded-sm', colors[index])}
                  style={{ width: `${percentOfFirst}%` }}
                />
                <span className="text-sm text-foreground">
                  {step.label} — {valueFormatter(step.value)} ({percentOfFirst.toFixed(0)}%)
                  {dropOff !== undefined && (
                    <span className="text-muted-foreground">
                      {' '}
                      · {dropOff.toFixed(0)}% vs anterior
                    </span>
                  )}
                </span>
              </button>
            </Tooltip>
          )
        })}
      </div>

      <div className="sr-only">
        <table>
          <caption>Funnel data</caption>
          <thead>
            <tr>
              <th>Step</th>
              <th>Value</th>
              <th>% of first step</th>
            </tr>
          </thead>
          <tbody>
            {steps.map((step) => (
              <tr key={step.label}>
                <th scope="row">{step.label}</th>
                <td>{valueFormatter(step.value)}</td>
                <td>{((step.value / firstValue) * 100).toFixed(0)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  )
}
