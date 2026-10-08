import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'
import { CardCvcInput, CardExpiryInput, CardNumberInput } from './CardInput'
import type { CardBrand } from './CardInput'
import { FormField } from '../FormField/FormField'

const meta: Meta<typeof CardNumberInput> = {
  component: CardNumberInput,
  title: 'Molecules/CardInput',
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof CardNumberInput>

export const CardNumber: Story = {
  args: { id: 'card-number', 'aria-label': 'Card number', defaultValue: '4111111111111111' },
}

export const Amex: Story = {
  args: { id: 'card-amex', 'aria-label': 'Card number', defaultValue: '378282246310005' },
}

export const Expiry: Story = {
  render: () => <CardExpiryInput id="card-expiry" aria-label="Expiry date" />,
}

export const Cvc: Story = {
  render: () => <CardCvcInput id="card-cvc" aria-label="Security code" />,
}

// The brand detected in the number sets the security code's length (4 digits for Amex).
function CardForm({ pt = false }: { pt?: boolean }) {
  const [brand, setBrand] = useState<CardBrand>()
  return (
    <form className="max-w-sm space-y-4">
      <FormField label={pt ? 'Número do cartão' : 'Card number'} id="form-card-number">
        <CardNumberInput
          id="form-card-number"
          onBrandChange={setBrand}
          {...(pt && { brandLabel: (detected: CardBrand) => `Bandeira do cartão: ${detected}` })}
        />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label={pt ? 'Validade' : 'Expiry date'} id="form-card-expiry">
          <CardExpiryInput id="form-card-expiry" {...(pt && { placeholder: 'MM/AA' })} />
        </FormField>
        <FormField label={pt ? 'Código de segurança' : 'Security code'} id="form-card-cvc">
          <CardCvcInput id="form-card-cvc" brand={brand} />
        </FormField>
      </div>
    </form>
  )
}

export const CardFormStory: Story = {
  name: 'Card form',
  render: () => <CardForm />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(canvas.getByRole('textbox', { name: 'Card number' }), '378282246310005')
    await expect(canvas.getByRole('status')).toHaveTextContent('Card brand: American Express')
    const cvc = canvas.getByRole('textbox', { name: 'Security code' })
    await userEvent.type(cvc, '12345')
    await expect(cvc).toHaveValue('1234')
    const expiry = canvas.getByRole('textbox', { name: 'Expiry date' })
    await userEvent.click(expiry)
    await userEvent.paste('12/2030')
    await expect(expiry).toHaveValue('12/30')
  },
}

export const CustomLabels: Story = {
  render: () => <CardForm pt />,
}
