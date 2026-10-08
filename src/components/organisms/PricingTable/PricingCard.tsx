import { useId, useState } from 'react'
import type { HTMLAttributes } from 'react'
import { CheckIcon, InfoIcon, XIcon } from 'lucide-react'
import { Badge } from '../../atoms/Badge/Badge'
import { Button } from '../../atoms/Button/Button'
import { IconBase } from '../../atoms/Icon/IconBase'
import { Tooltip } from '../../molecules/Tooltip/Tooltip'
import { cn } from '../../../utils/cn'
import type { LinkComponent } from '../../../utils/linkComponent'

export type BillingPeriod = 'monthly' | 'yearly'

export interface PricingFeature {
  label: string
  /** Default true. A feature not included shows muted, with an X icon. */
  included?: boolean
  /** Explanation shown in a tooltip next to the feature. */
  description?: string
}

export interface PricingPlan {
  id: string
  name: string
  /** Who the plan is for. */
  description?: string
  /**
   * A number: one-time price, shown without a period suffix. Per period: a subscription, shown
   * with the selected period's suffix. `null` or missing: the plan shows `customPrice`.
   */
  price?: number | Partial<Record<BillingPeriod, number | null>>
  /** Text in place of the price, for plans without one ("Talk to us"). */
  customPrice?: string
  /** Small text under the price: one text ("One-time payment") or one per period. */
  priceNote?: string | Partial<Record<BillingPeriod, string>>
  features: PricingFeature[]
  /** Highlights the plan: primary border, solid CTA, lifted on large screens. */
  highlighted?: boolean
  /** Badge text on top of the card ("Most popular"). */
  badge?: string
  /** With `href`, a link (through `linkComponent`); without it, a button calling `onClick`. */
  cta: { label: string; href?: string; onClick?: () => void }
}

/** Props a `PricingCard` takes and a `PricingTable` passes on to its cards. */
export interface PricingCardOptions {
  /** Currency of the prices (`Intl.NumberFormat`). */
  currency?: string
  /** Locale of the prices (`Intl.NumberFormat`). Fixed by default, so server and client agree. */
  locale?: string
  /** Component rendered in place of `<a>` for CTAs with `href` (e.g. Next.js `Link`). */
  linkComponent?: LinkComponent
  /** Heading level of the plan names. */
  headingLevel?: 2 | 3 | 4
  /** Suffix of a monthly price. */
  monthlySuffix?: string
  /** Suffix of a yearly price. */
  yearlySuffix?: string
  /** Visually hidden text before an included feature. */
  includedLabel?: string
  /** Visually hidden text before a feature not included. */
  notIncludedLabel?: string
  /** `aria-label` of the help button of a feature with `description`. */
  featureHelpLabel?: (feature: string) => string
  /** Features shown on small screens before the "see all" button; `false` shows all of them. */
  collapsedFeatures?: number | false
  /** Text of the button that expands the feature list on small screens. */
  showAllFeaturesLabel?: (total: number) => string
  /** Text of the same button once the list is expanded. */
  showFewerFeaturesLabel?: string
}

export interface PricingCardProps
  extends PricingCardOptions, Omit<HTMLAttributes<HTMLElement>, 'children'> {
  plan: PricingPlan
  /** Period whose price is shown (one-time prices don't change with it). */
  period?: BillingPeriod
}

const headingTags = { 2: 'h2', 3: 'h3', 4: 'h4' } as const

// The number big, the currency and the cents smaller, so the price reads as the number.
function Price({ value, currency, locale }: { value: number; currency: string; locale: string }) {
  const whole = Number.isInteger(value)
  const parts = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    ...(whole && { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
  }).formatToParts(value)
  return parts.map((part, index) => (
    <span
      key={index}
      className={
        part.type === 'integer' || part.type === 'group'
          ? 'text-4xl font-bold tracking-tight'
          : 'text-xl font-semibold'
      }
    >
      {part.value}
    </span>
  ))
}

/** One plan of a pricing table: name, price, CTA and features. Also usable on its own. */
export function PricingCard({
  plan,
  period = 'monthly',
  currency = 'USD',
  locale = 'en-US',
  linkComponent: LinkElement = 'a',
  headingLevel = 3,
  monthlySuffix = '/month',
  yearlySuffix = '/year',
  includedLabel = 'Included',
  notIncludedLabel = 'Not included',
  featureHelpLabel = (feature) => `More about ${feature}`,
  collapsedFeatures = 4,
  showAllFeaturesLabel = (total) => `See all features (${total})`,
  showFewerFeaturesLabel = 'See fewer features',
  className,
  ...props
}: PricingCardProps) {
  const nameId = useId()
  const listId = useId()
  const [expanded, setExpanded] = useState(false)
  const Heading = headingTags[headingLevel]

  const oneTime = typeof plan.price === 'number'
  const value = typeof plan.price === 'number' ? plan.price : plan.price?.[period]
  const suffix = period === 'monthly' ? monthlySuffix : yearlySuffix
  const note = typeof plan.priceNote === 'string' ? plan.priceNote : plan.priceNote?.[period]
  const collapsible = collapsedFeatures !== false && plan.features.length > collapsedFeatures
  const ctaVariant = plan.highlighted ? 'primary' : 'outline'

  return (
    <article
      aria-labelledby={nameId}
      className={cn(
        'relative flex flex-col gap-6 rounded-lg bg-background p-6 text-foreground',
        plan.highlighted
          ? 'border-2 border-primary shadow-lg lg:-translate-y-2'
          : 'border border-border shadow-sm',
        className,
      )}
      {...props}
    >
      {plan.badge && (
        <Badge variant="primary" size="sm" className="absolute -top-3 left-1/2 -translate-x-1/2">
          {plan.badge}
        </Badge>
      )}
      <div className="space-y-2">
        <Heading id={nameId} className="text-xl font-semibold">
          {plan.name}
        </Heading>
        {plan.description && <p className="text-sm text-muted-foreground">{plan.description}</p>}
      </div>

      <div className="space-y-1">
        <p className="flex flex-wrap items-baseline">
          {value === undefined || value === null ? (
            <span className="text-3xl font-bold tracking-tight">{plan.customPrice}</span>
          ) : (
            <>
              <Price value={value} currency={currency} locale={locale} />
              {!oneTime && <span className="ml-1 text-sm text-muted-foreground">{suffix}</span>}
            </>
          )}
        </p>
        {note && <p className="text-sm text-muted-foreground">{note}</p>}
      </div>

      {plan.cta.href !== undefined ? (
        <Button asChild variant={ctaVariant} className="w-full">
          <LinkElement href={plan.cta.href}>{plan.cta.label}</LinkElement>
        </Button>
      ) : (
        <Button variant={ctaVariant} className="w-full" onClick={plan.cta.onClick}>
          {plan.cta.label}
        </Button>
      )}

      {plan.features.length > 0 && (
        <div className="space-y-3">
          <ul id={listId} className="space-y-3">
            {plan.features.map((feature, index) => {
              const included = feature.included !== false
              const collapsed = collapsible && !expanded && index >= collapsedFeatures
              return (
                <li
                  key={feature.label}
                  className={cn(
                    'flex items-start gap-2 text-sm',
                    !included && 'text-muted-foreground',
                    collapsed && 'hidden md:flex',
                  )}
                >
                  <IconBase
                    icon={included ? CheckIcon : XIcon}
                    size="sm"
                    className={cn(
                      'mt-0.5 shrink-0',
                      included ? 'text-success' : 'text-muted-foreground',
                    )}
                  />
                  <span>
                    <span className="sr-only">{included ? includedLabel : notIncludedLabel}: </span>
                    {feature.label}
                  </span>
                  {feature.description && (
                    <Tooltip label={feature.description}>
                      <button
                        type="button"
                        aria-label={featureHelpLabel(feature.label)}
                        className="mt-0.5 shrink-0 rounded-full text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <IconBase icon={InfoIcon} size="sm" />
                      </button>
                    </Tooltip>
                  )}
                </li>
              )
            })}
          </ul>
          {collapsible && (
            <button
              type="button"
              aria-expanded={expanded}
              aria-controls={listId}
              onClick={() => setExpanded((open) => !open)}
              className="rounded-sm text-sm font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring md:hidden"
            >
              {expanded ? showFewerFeaturesLabel : showAllFeaturesLabel(plan.features.length)}
            </button>
          )}
        </div>
      )}
    </article>
  )
}
