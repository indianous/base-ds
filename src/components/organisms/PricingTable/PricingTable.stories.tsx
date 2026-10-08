import type { Meta, StoryObj } from '@storybook/react'
import { expect, userEvent, within } from 'storybook/test'
import { PricingTable } from './PricingTable'
import type { PricingPlan } from './PricingTable'
import { PricingCard } from './PricingCard'

const plans: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'For individuals getting started',
    price: { monthly: 19, yearly: 15 },
    priceNote: { yearly: 'Billed $180 yearly' },
    features: [
      { label: '1 project' },
      { label: '5 GB storage' },
      { label: 'Email support' },
      { label: 'Basic analytics' },
      { label: 'API access', included: false },
      { label: 'Single sign-on (SSO)', included: false },
    ],
    cta: { label: 'Start now', href: '#starter' },
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For growing teams',
    price: { monthly: 49, yearly: 39 },
    priceNote: { yearly: 'Billed $468 yearly' },
    highlighted: true,
    badge: 'Most popular',
    features: [
      { label: 'Unlimited projects' },
      { label: '100 GB storage' },
      { label: 'Priority support' },
      { label: 'Advanced analytics' },
      {
        label: 'API access',
        description: 'Read and write your data from your own systems through the REST API.',
      },
      { label: 'Single sign-on (SSO)', included: false },
    ],
    cta: { label: 'Subscribe', href: '#pro' },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For companies with custom needs',
    customPrice: 'Custom',
    features: [
      { label: 'Unlimited projects' },
      { label: 'Unlimited storage' },
      { label: 'Dedicated support' },
      { label: 'Advanced analytics' },
      { label: 'API access' },
      {
        label: 'Single sign-on (SSO)',
        description: 'Sign in with your company identity provider.',
      },
    ],
    cta: { label: 'Talk to sales', href: '#sales' },
  },
]

const meta: Meta<typeof PricingTable> = {
  component: PricingTable,
  title: 'Organisms/PricingTable',
  tags: ['autodocs'],
  args: { plans },
  parameters: { layout: 'padded' },
}
export default meta

type Story = StoryObj<typeof PricingTable>

export const Default: Story = {}

export const WithYearlyDiscount: Story = {
  args: { defaultPeriod: 'yearly', yearlyBadge: 'Save 20%', yearlySuffix: '/month' },
}

export const CustomPrice: Story = {
  args: { plans: [plans[1] as PricingPlan, plans[2] as PricingPlan] },
}

export const SinglePeriod: Story = { args: { periods: ['monthly'] } }

const purchases: PricingPlan[] = [
  {
    id: 'course',
    name: 'Course',
    description: 'The full course, yours forever',
    price: 297,
    priceNote: 'One-time payment',
    features: [{ label: '40 video lessons' }, { label: 'Exercises' }, { label: 'Certificate' }],
    cta: { label: 'Buy course', href: '#course' },
  },
  {
    id: 'bundle',
    name: 'Bundle',
    description: 'The course plus mentoring',
    price: 497.9,
    priceNote: 'Or 12 payments of $45.90',
    highlighted: true,
    badge: 'Best value',
    features: [
      { label: '40 video lessons' },
      { label: 'Exercises' },
      { label: 'Certificate' },
      { label: '4 mentoring sessions' },
    ],
    cta: { label: 'Buy bundle', href: '#bundle' },
  },
]

export const OneTimePurchase: Story = { args: { plans: purchases } }

export const MixedPlans: Story = {
  args: {
    plans: [
      {
        id: 'monthly',
        name: 'Monthly',
        description: 'Cancel any time',
        price: { monthly: 49, yearly: 39 },
        features: (plans[1] as PricingPlan).features,
        cta: { label: 'Subscribe', href: '#monthly' },
      },
      {
        ...(purchases[0] as PricingPlan),
        id: 'lifetime',
        name: 'Lifetime',
        highlighted: true,
        badge: 'Pay once',
      },
    ],
  },
}

export const CardAlone: Story = {
  render: () => (
    <div className="max-w-sm pt-4">
      <PricingCard plan={plans[1] as PricingPlan} />
    </div>
  ),
}

export const Interactive: Story = {
  args: { yearlyBadge: 'Save 20%' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const starter = canvas.getByRole('article', { name: 'Starter' })
    await expect(starter).toHaveTextContent('$19/month')
    await userEvent.click(canvas.getByRole('radio', { name: /Yearly/ }))
    await expect(starter).toHaveTextContent('$15/year')
    await expect(starter).toHaveTextContent('Billed $180 yearly')
  },
}

// Below md: cards stacked and feature lists collapsed behind "See all features".
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement }) => {
    const starter = within(within(canvasElement).getByRole('article', { name: 'Starter' }))
    const toggle = starter.getByRole('button', { name: 'See all features (6)' })
    await expect(starter.queryByText('API access')).not.toBeVisible()
    await userEvent.click(toggle)
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await expect(starter.getByText('API access')).toBeVisible()
  },
}

const plansPt: PricingPlan[] = [
  {
    id: 'basico',
    name: 'Básico',
    description: 'Para quem está começando',
    price: { monthly: 49, yearly: 39.9 },
    priceNote: { yearly: 'Cobrado R$ 478,80 por ano' },
    features: [
      { label: '1 projeto' },
      { label: '5 GB de armazenamento' },
      { label: 'Suporte por e-mail' },
      { label: 'Relatórios básicos' },
      { label: 'Acesso à API', included: false },
      { label: 'Login único (SSO)', included: false },
    ],
    cta: { label: 'Começar agora', href: '#basico' },
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Para equipes em crescimento',
    price: { monthly: 99, yearly: 79 },
    priceNote: { yearly: 'Cobrado R$ 948 por ano' },
    highlighted: true,
    badge: 'Mais vendido',
    features: [
      { label: 'Projetos ilimitados' },
      { label: '100 GB de armazenamento' },
      { label: 'Suporte prioritário' },
      { label: 'Relatórios avançados' },
      { label: 'Acesso à API', description: 'Leia e grave seus dados pela API REST.' },
      { label: 'Login único (SSO)', included: false },
    ],
    cta: { label: 'Assinar plano', href: '#pro' },
  },
  {
    id: 'vitalicio',
    name: 'Vitalício',
    description: 'Pague uma vez, use para sempre',
    price: 1997,
    priceNote: 'Pagamento único ou 12x de R$ 199,70',
    features: [{ label: 'Tudo do Pro' }, { label: 'Atualizações para sempre' }],
    cta: { label: 'Comprar', href: '#vitalicio' },
  },
]

export const CustomLabels: Story = {
  args: {
    plans: plansPt,
    locale: 'pt-BR',
    currency: 'BRL',
    yearlyBadge: 'Economize 20%',
    yearlySuffix: '/mês',
    label: 'Planos',
    billingLabel: 'Período de cobrança',
    monthlyLabel: 'Mensal',
    yearlyLabel: 'Anual',
    monthlySuffix: '/mês',
    includedLabel: 'Incluído',
    notIncludedLabel: 'Não incluído',
    featureHelpLabel: (feature) => `Saiba mais sobre ${feature}`,
    showAllFeaturesLabel: (total) => `Ver todos os recursos (${total})`,
    showFewerFeaturesLabel: 'Ver menos recursos',
  },
}
