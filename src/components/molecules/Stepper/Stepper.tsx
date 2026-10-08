import type { HTMLAttributes } from 'react'
import { CheckIcon } from 'lucide-react'
import { IconBase } from '../../atoms/Icon/IconBase'
import { cn } from '../../../utils/cn'

export interface StepperStep {
  id: string
  label: string
}

export interface StepperProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  steps: StepperStep[]
  /** `id` of the current step. When no step has it, every step is not started. */
  current: string
  /** Called with a completed step's `id` when it's clicked. Without it, no step is a button. */
  onStepClick?: (id: string) => void
  /** `aria-label` of the list of steps. */
  label?: string
  /** Visually hidden state of a completed step. */
  completedStepLabel?: string
  /** Visually hidden state of the current step. */
  currentStepLabel?: string
  /** Visually hidden state of a step not reached yet. */
  upcomingStepLabel?: string
  /** Visible text of the compact view (small screens), from the current step's position. */
  progressMessage?: (step: number, total: number, label: string) => string
}

type StepState = 'completed' | 'current' | 'upcoming'

const circleClasses: Record<StepState, string> = {
  completed: 'border-primary bg-primary text-primary-foreground',
  current: 'border-primary bg-background text-primary',
  upcoming: 'border-border bg-background text-muted-foreground',
}

const labelClasses: Record<StepState, string> = {
  completed: 'text-foreground',
  current: 'font-semibold text-foreground',
  upcoming: 'text-muted-foreground',
}

/**
 * Where the person is in a flow of steps (issue #65): a list of steps from the `sm` breakpoint up,
 * and "Step 2 of 3 — Delivery" with a progress bar below it. Completed steps can be buttons.
 */
export function Stepper({
  steps,
  current,
  onStepClick,
  label = 'Steps',
  completedStepLabel = 'completed',
  currentStepLabel = 'current',
  upcomingStepLabel = 'not started',
  progressMessage = (step, total, stepLabel) => `Step ${step} of ${total} — ${stepLabel}`,
  className,
  ...props
}: StepperProps) {
  const currentIndex = steps.findIndex((step) => step.id === current)
  const stateLabels: Record<StepState, string> = {
    completed: completedStepLabel,
    current: currentStepLabel,
    upcoming: upcomingStepLabel,
  }
  const stateOf = (index: number): StepState =>
    currentIndex === -1 || index > currentIndex
      ? 'upcoming'
      : index === currentIndex
        ? 'current'
        : 'completed'

  return (
    <div className={cn('w-full', className)} {...props}>
      <ol aria-label={label} className="hidden w-full items-start sm:flex">
        {steps.map((step, index) => {
          const state = stateOf(index)
          const clickable = state === 'completed' && onStepClick !== undefined
          const content = (
            <>
              <span
                aria-hidden="true"
                className={cn(
                  'relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium',
                  circleClasses[state],
                )}
              >
                {state === 'completed' ? <IconBase icon={CheckIcon} size="sm" /> : index + 1}
              </span>
              <span
                className={cn('text-sm', labelClasses[state], clickable && 'group-hover:underline')}
              >
                {step.label}
                <span className="sr-only">, {stateLabels[state]}</span>
              </span>
            </>
          )
          return (
            <li
              key={step.id}
              aria-current={state === 'current' ? 'step' : undefined}
              className="relative flex flex-1 flex-col items-center text-center"
            >
              {index > 0 && (
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute -left-1/2 right-1/2 top-4 h-0.5 -translate-y-1/2',
                    state === 'upcoming' ? 'bg-border' : 'bg-primary',
                  )}
                />
              )}
              {clickable ? (
                <button
                  type="button"
                  onClick={() => onStepClick?.(step.id)}
                  className="group flex flex-col items-center gap-2 rounded-md px-2 focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {content}
                </button>
              ) : (
                <span className="flex flex-col items-center gap-2 px-2">{content}</span>
              )}
            </li>
          )
        })}
      </ol>
      <div className="space-y-2 sm:hidden">
        <p className="text-sm font-medium text-foreground">
          {progressMessage(currentIndex + 1, steps.length, steps[currentIndex]?.label ?? '')}
        </p>
        <div aria-hidden="true" className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
