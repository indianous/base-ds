import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { expect, fn, userEvent, within } from 'storybook/test'
import { Stepper } from './Stepper'

const steps = [
  { id: 'cart', label: 'Cart' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'payment', label: 'Payment' },
]

const meta: Meta<typeof Stepper> = {
  component: Stepper,
  title: 'Molecules/Stepper',
  tags: ['autodocs'],
  args: { steps, current: 'delivery' },
}
export default meta

type Story = StoryObj<typeof Stepper>

export const Default: Story = {}

export const FirstStep: Story = { args: { current: 'cart' } }

export const LastStep: Story = { args: { current: 'payment' } }

export const Clickable: Story = {
  args: { current: 'payment', onStepClick: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: /Cart/ }))
    await expect(args.onStepClick).toHaveBeenCalledWith('cart')
    await expect(canvas.queryByRole('button', { name: /Payment/ })).toBeNull()
  },
}

// Below the `sm` breakpoint: "Step 2 of 3 — Delivery" with a progress bar.
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}

// The checkout of the issue, going back to a completed step.
function Checkout() {
  const [current, setCurrent] = useState('pagamento')
  return (
    <Stepper
      label="Etapas do pedido"
      completedStepLabel="concluída"
      currentStepLabel="atual"
      upcomingStepLabel="não iniciada"
      progressMessage={(step, total, label) => `Etapa ${step} de ${total} — ${label}`}
      steps={[
        { id: 'carrinho', label: 'Carrinho' },
        { id: 'entrega', label: 'Entrega' },
        { id: 'pagamento', label: 'Pagamento' },
      ]}
      current={current}
      onStepClick={setCurrent}
    />
  )
}

export const CustomLabels: Story = { render: () => <Checkout /> }
