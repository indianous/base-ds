import { useId, useState } from 'react'
import type { HTMLAttributes } from 'react'
import { Badge } from '../../atoms/Badge/Badge'
import { cn } from '../../../utils/cn'
import { PricingCard } from './PricingCard'
import type { BillingPeriod, PricingCardOptions, PricingPlan } from './PricingCard'

export type { BillingPeriod, PricingCardOptions, PricingFeature, PricingPlan } from './PricingCard'

export interface PricingTableProps
  extends PricingCardOptions, Omit<HTMLAttributes<HTMLElement>, 'children'> {
  plans: PricingPlan[]
  /** Controlled period. */
  period?: BillingPeriod
  defaultPeriod?: BillingPeriod
  onPeriodChange?: (period: BillingPeriod) => void
  /** Periods offered in the toggle. With only one, or no plan priced per period, there's no toggle. */
  periods?: BillingPeriod[]
  /** Badge next to the yearly option ("Save 20%"). */
  yearlyBadge?: string
  /** `aria-label` of the section. */
  label?: string
  /** Name of the billing period toggle group. */
  billingLabel?: string
  /** Text of the monthly option of the toggle. */
  monthlyLabel?: string
  /** Text of the yearly option of the toggle. */
  yearlyLabel?: string
}

// One column on phones, two from md and one per plan from lg.
const columnClasses: Record<number, string> = {
  1: 'mx-auto max-w-md',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-2 lg:grid-cols-3',
  4: 'md:grid-cols-2 lg:grid-cols-4',
}

/**
 * Pricing plans side by side, with a monthly/yearly toggle when some plan is priced per period.
 * Plans priced with a plain number are one-time purchases.
 */
export function PricingTable({
  plans,
  period,
  defaultPeriod,
  onPeriodChange,
  periods = ['monthly', 'yearly'],
  yearlyBadge,
  label = 'Pricing plans',
  billingLabel = 'Billing period',
  monthlyLabel = 'Monthly',
  yearlyLabel = 'Yearly',
  currency,
  locale,
  linkComponent,
  headingLevel,
  monthlySuffix,
  yearlySuffix,
  includedLabel,
  notIncludedLabel,
  featureHelpLabel,
  collapsedFeatures,
  showAllFeaturesLabel,
  showFewerFeaturesLabel,
  className,
  ...props
}: PricingTableProps) {
  const name = useId()
  const [uncontrolled, setUncontrolled] = useState<BillingPeriod>(
    defaultPeriod ?? periods[0] ?? 'monthly',
  )
  const current = periods.length === 1 ? (periods[0] as BillingPeriod) : (period ?? uncontrolled)
  const showToggle = periods.length > 1 && plans.some((plan) => typeof plan.price === 'object')
  const periodLabels: Record<BillingPeriod, string> = {
    monthly: monthlyLabel,
    yearly: yearlyLabel,
  }

  function select(next: BillingPeriod) {
    if (period === undefined) setUncontrolled(next)
    onPeriodChange?.(next)
  }

  // Only the props given, so the card keeps its own defaults for the rest.
  const cardOptions = Object.fromEntries(
    Object.entries({
      currency,
      locale,
      linkComponent,
      headingLevel,
      monthlySuffix,
      yearlySuffix,
      includedLabel,
      notIncludedLabel,
      featureHelpLabel,
      collapsedFeatures,
      showAllFeaturesLabel,
      showFewerFeaturesLabel,
    }).filter(([, value]) => value !== undefined),
  ) as PricingCardOptions

  return (
    <section aria-label={label} className={cn('w-full space-y-10', className)} {...props}>
      {showToggle && (
        <div className="flex justify-center">
          <fieldset className="flex w-full rounded-full border border-border bg-muted p-1 sm:w-auto">
            <legend className="sr-only">{billingLabel}</legend>
            {periods.map((option) => (
              <label key={option} className="flex-1 sm:flex-none">
                <input
                  type="radio"
                  name={name}
                  value={option}
                  checked={current === option}
                  onChange={() => select(option)}
                  className="peer sr-only"
                />
                <span className="flex cursor-pointer items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors peer-checked:bg-background peer-checked:text-foreground peer-checked:shadow-sm peer-focus-visible:ring-2 peer-focus-visible:ring-ring">
                  {periodLabels[option]}
                  {option === 'yearly' && yearlyBadge && (
                    <>
                      {' '}
                      <Badge variant="success" size="sm">
                        {yearlyBadge}
                      </Badge>
                    </>
                  )}
                </span>
              </label>
            ))}
          </fieldset>
        </div>
      )}
      <div
        className={cn(
          'grid items-stretch gap-x-6 gap-y-8',
          columnClasses[Math.min(plans.length, 4)],
        )}
      >
        {plans.map((plan) => (
          <PricingCard key={plan.id} plan={plan} period={current} {...cardOptions} />
        ))}
      </div>
    </section>
  )
}
