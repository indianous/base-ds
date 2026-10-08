import { describe, it, expect, vi } from 'vitest'
import { useState } from 'react'
import type { AnchorHTMLAttributes } from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { PricingTable } from './PricingTable'
import type { BillingPeriod, PricingPlan, PricingTableProps } from './PricingTable'
import { PricingCard } from './PricingCard'

const features = (count: number) =>
  Array.from({ length: count }, (_, index) => ({ label: `Feature ${index + 1}` }))

const plans: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'For individuals',
    price: { monthly: 49, yearly: 470 },
    priceNote: { yearly: 'Billed yearly' },
    features: [
      { label: 'One project' },
      { label: 'Reports', included: false },
      { label: 'API access', description: 'Call the REST API from your systems' },
    ],
    cta: { label: 'Start now', href: '/signup?plan=starter' },
  },
  {
    id: 'pro',
    name: 'Pro',
    price: { monthly: 99.9, yearly: 959 },
    features: [{ label: 'Unlimited projects' }],
    highlighted: true,
    badge: 'Most popular',
    cta: { label: 'Subscribe', onClick: () => {} },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    customPrice: 'Talk to us',
    features: [{ label: 'SSO' }],
    cta: { label: 'Contact sales', href: '/contact' },
  },
]

const renderTable = (props: Partial<PricingTableProps> = {}) =>
  render(<PricingTable plans={plans} {...props} />)

const card = (name: string) => screen.getByRole('article', { name })

describe('PricingTable', () => {
  it('renders a section named by label with an article per plan', () => {
    renderTable()
    const section = screen.getByRole('region', { name: 'Pricing plans' })
    expect(section.tagName).toBe('SECTION')
    expect(within(section).getAllByRole('article')).toHaveLength(3)
    expect(within(card('Pro')).getByRole('heading', { level: 3, name: 'Pro' })).toBeInTheDocument()
  })

  it('shows the monthly prices by default and the yearly ones after toggling', async () => {
    const onPeriodChange = vi.fn()
    renderTable({ onPeriodChange })
    expect(card('Starter')).toHaveTextContent('$49/month')
    expect(card('Pro')).toHaveTextContent('$99.90/month')
    await userEvent.click(screen.getByRole('radio', { name: 'Yearly' }))
    expect(onPeriodChange).toHaveBeenCalledWith('yearly')
    expect(card('Starter')).toHaveTextContent('$470/year')
    expect(card('Starter')).toHaveTextContent('Billed yearly')
    expect(screen.getByRole('radio', { name: 'Yearly' })).toBeChecked()
  })

  it('follows a controlled period', async () => {
    function Controlled() {
      const [period, setPeriod] = useState<BillingPeriod>('yearly')
      return <PricingTable plans={plans} period={period} onPeriodChange={setPeriod} />
    }
    render(<Controlled />)
    expect(card('Starter')).toHaveTextContent('$470/year')
    await userEvent.click(screen.getByRole('radio', { name: 'Monthly' }))
    expect(card('Starter')).toHaveTextContent('$49/month')
  })

  it('groups the toggle under billingLabel and puts the yearly badge in its label', () => {
    renderTable({ yearlyBadge: 'Save 20%' })
    const group = screen.getByRole('group', { name: 'Billing period' })
    expect(within(group).getByRole('radio', { name: 'Yearly Save 20%' })).toBeInTheDocument()
  })

  it('formats with the locale and currency, without cents for whole values', () => {
    renderTable({ locale: 'pt-BR', currency: 'BRL' })
    expect(card('Starter')).toHaveTextContent('R$ 49/month')
    expect(card('Pro')).toHaveTextContent('R$ 99,90/month')
  })

  it('shows customPrice when there is no price', () => {
    renderTable()
    expect(card('Enterprise')).toHaveTextContent('Talk to us')
    expect(card('Enterprise')).not.toHaveTextContent('/month')
  })

  it('shows customPrice when the period has no price', async () => {
    const plan: PricingPlan = {
      id: 'beta',
      name: 'Beta',
      price: { monthly: 10, yearly: null },
      customPrice: 'Not available',
      features: [],
      cta: { label: 'Join' },
    }
    renderTable({ plans: [plan] })
    await userEvent.click(screen.getByRole('radio', { name: 'Yearly' }))
    expect(card('Beta')).toHaveTextContent('Not available')
  })

  it('has no toggle with a single period', () => {
    renderTable({ periods: ['yearly'] })
    expect(screen.queryByRole('radio')).toBeNull()
    expect(card('Starter')).toHaveTextContent('$470/year')
  })

  describe('one-time purchases', () => {
    const lifetime: PricingPlan = {
      id: 'lifetime',
      name: 'Lifetime',
      price: 497,
      priceNote: 'One-time payment',
      features: [],
      cta: { label: 'Buy' },
    }

    it('shows a number price without a period, the same in both periods', async () => {
      renderTable({ plans: [plans[0] as PricingPlan, lifetime] })
      expect(card('Lifetime')).toHaveTextContent('$497One-time payment')
      expect(card('Lifetime')).not.toHaveTextContent('/month')
      await userEvent.click(screen.getByRole('radio', { name: 'Yearly' }))
      expect(card('Lifetime')).toHaveTextContent('$497One-time payment')
      expect(card('Lifetime')).not.toHaveTextContent('/year')
    })

    it('has no toggle when no plan is priced per period', () => {
      renderTable({ plans: [lifetime, { ...lifetime, id: 'pack', name: 'Pack', price: 97 }] })
      expect(screen.queryByRole('radio')).toBeNull()
      expect(card('Pack')).toHaveTextContent('$97')
    })
  })

  it('highlights a plan with its badge, primary border and solid CTA', () => {
    renderTable()
    expect(card('Pro')).toHaveTextContent('Most popular')
    expect(card('Pro').className).toContain('border-primary')
    expect(within(card('Pro')).getByRole('button', { name: 'Subscribe' }).className).toContain(
      'bg-primary',
    )
    const other = within(card('Starter')).getByRole('link', { name: 'Start now' })
    expect(other.className).not.toContain('bg-primary')
    expect(other.className).toContain('border-border')
  })

  it('renders a CTA with href as a link and one without as a button', async () => {
    const onClick = vi.fn()
    const plan: PricingPlan = { ...(plans[1] as PricingPlan), cta: { label: 'Subscribe', onClick } }
    renderTable({ plans: [plans[0] as PricingPlan, plan] })
    expect(screen.getByRole('link', { name: 'Start now' })).toHaveAttribute(
      'href',
      '/signup?plan=starter',
    )
    await userEvent.click(screen.getByRole('button', { name: 'Subscribe' }))
    expect(onClick).toHaveBeenCalled()
  })

  it('renders links with linkComponent', () => {
    function TestLink({ children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
      return (
        <a data-custom-link {...props}>
          {children}
        </a>
      )
    }
    renderTable({ linkComponent: TestLink })
    const link = screen.getByRole('link', { name: 'Start now' })
    expect(link).toHaveAttribute('data-custom-link')
    expect(link).toHaveAttribute('href', '/signup?plan=starter')
  })

  it('tells whether each feature is included', () => {
    renderTable()
    const items = within(card('Starter')).getAllByRole('listitem')
    expect(items[0]).toHaveTextContent('Included: One project')
    expect(items[1]).toHaveTextContent('Not included: Reports')
  })

  it('explains a feature in a tooltip from its help button', async () => {
    renderTable()
    const help = screen.getByRole('button', { name: 'More about API access' })
    await userEvent.hover(help)
    expect(screen.getByRole('tooltip')).toHaveTextContent('Call the REST API from your systems')
    expect(help).toHaveAttribute('aria-describedby', screen.getByRole('tooltip').id)
  })

  describe('feature list on small screens', () => {
    const long: PricingPlan = { ...(plans[0] as PricingPlan), features: features(10) }

    it('collapses the features past the limit behind a button', async () => {
      renderTable({ plans: [long] })
      const items = within(card('Starter')).getAllByRole('listitem')
      expect(items.slice(0, 4).every((item) => !item.className.includes('hidden'))).toBe(true)
      expect(items.slice(4).every((item) => item.className.includes('hidden md:flex'))).toBe(true)

      const toggle = screen.getByRole('button', { name: 'See all features (10)' })
      const list = within(card('Starter')).getByRole('list')
      expect(toggle.className).toContain('md:hidden')
      expect(toggle).toHaveAttribute('aria-expanded', 'false')
      expect(toggle).toHaveAttribute('aria-controls', list.id)

      await userEvent.click(toggle)
      expect(toggle).toHaveAttribute('aria-expanded', 'true')
      expect(toggle).toHaveTextContent('See fewer features')
      expect(toggle).toHaveFocus()
      const opened = within(card('Starter')).getAllByRole('listitem')
      expect(opened.some((item) => item.className.includes('hidden'))).toBe(false)

      await userEvent.click(toggle)
      expect(toggle).toHaveAttribute('aria-expanded', 'false')
    })

    it('has no button with features up to the limit', () => {
      renderTable({ plans: [{ ...long, features: features(4) }] })
      expect(screen.queryByRole('button', { name: /See all/ })).toBeNull()
    })

    it('can be turned off', () => {
      renderTable({ plans: [long], collapsedFeatures: false })
      expect(screen.queryByRole('button', { name: /See all/ })).toBeNull()
      const items = within(card('Starter')).getAllByRole('listitem')
      expect(items.some((item) => item.className.includes('hidden'))).toBe(false)
    })

    it('takes another limit', () => {
      renderTable({ plans: [long], collapsedFeatures: 2 })
      const items = within(card('Starter')).getAllByRole('listitem')
      expect(items.filter((item) => item.className.includes('hidden'))).toHaveLength(8)
    })
  })

  it('passes other attributes to the section', () => {
    renderTable({ id: 'pricing', className: 'mt-8' })
    const section = screen.getByRole('region', { name: 'Pricing plans' })
    expect(section).toHaveAttribute('id', 'pricing')
    expect(section.className).toContain('mt-8')
  })

  it('uses headingLevel for the plan names', () => {
    renderTable({ headingLevel: 2 })
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(3)
  })

  describe('custom texts', () => {
    it('accepts a custom label', () => {
      renderTable({ label: 'Planos' })
      expect(screen.getByRole('region', { name: 'Planos' })).toBeInTheDocument()
    })

    it('accepts a custom billingLabel', () => {
      renderTable({ billingLabel: 'Período de cobrança' })
      expect(screen.getByRole('group', { name: 'Período de cobrança' })).toBeInTheDocument()
    })

    it('accepts a custom monthlyLabel', () => {
      renderTable({ monthlyLabel: 'Mensal' })
      expect(screen.getByRole('radio', { name: 'Mensal' })).toBeInTheDocument()
    })

    it('accepts a custom yearlyLabel', () => {
      renderTable({ yearlyLabel: 'Anual' })
      expect(screen.getByRole('radio', { name: 'Anual' })).toBeInTheDocument()
    })

    it('accepts a custom monthlySuffix', () => {
      renderTable({ monthlySuffix: '/mês' })
      expect(card('Starter')).toHaveTextContent('$49/mês')
    })

    it('accepts a custom yearlySuffix', () => {
      renderTable({ defaultPeriod: 'yearly', yearlySuffix: '/ano' })
      expect(card('Starter')).toHaveTextContent('$470/ano')
    })

    it('accepts a custom includedLabel', () => {
      renderTable({ includedLabel: 'Incluído' })
      expect(within(card('Starter')).getAllByRole('listitem')[0]).toHaveTextContent(
        'Incluído: One project',
      )
    })

    it('accepts a custom notIncludedLabel', () => {
      renderTable({ notIncludedLabel: 'Não incluído' })
      expect(within(card('Starter')).getAllByRole('listitem')[1]).toHaveTextContent(
        'Não incluído: Reports',
      )
    })

    it('accepts a custom featureHelpLabel', () => {
      renderTable({ featureHelpLabel: (feature) => `Saiba mais sobre ${feature}` })
      expect(screen.getByRole('button', { name: 'Saiba mais sobre API access' })).toBeVisible()
    })

    it('accepts a custom showAllFeaturesLabel', () => {
      renderTable({
        plans: [{ ...(plans[0] as PricingPlan), features: features(6) }],
        showAllFeaturesLabel: (total) => `Ver todos os recursos (${total})`,
      })
      expect(screen.getByRole('button', { name: 'Ver todos os recursos (6)' })).toBeVisible()
    })

    it('accepts a custom showFewerFeaturesLabel', async () => {
      renderTable({
        plans: [{ ...(plans[0] as PricingPlan), features: features(6) }],
        showFewerFeaturesLabel: 'Ver menos recursos',
      })
      await userEvent.click(screen.getByRole('button', { name: /See all/ }))
      expect(screen.getByRole('button', { name: 'Ver menos recursos' })).toBeVisible()
    })
  })

  it('has no accessibility violations', async () => {
    const { container } = renderTable({
      yearlyBadge: 'Save 20%',
      plans: [
        ...plans,
        { ...(plans[0] as PricingPlan), id: 'long', name: 'Long', features: features(8) },
      ],
    })
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('PricingCard', () => {
  it('renders a plan on its own in the given period', () => {
    render(<PricingCard plan={plans[0] as PricingPlan} period="yearly" />)
    expect(card('Starter')).toHaveTextContent('$470/year')
    expect(card('Starter')).toHaveTextContent('For individuals')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<PricingCard plan={plans[1] as PricingPlan} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
