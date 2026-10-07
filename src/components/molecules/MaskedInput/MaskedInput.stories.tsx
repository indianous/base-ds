import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'
import { MaskedInput } from './MaskedInput'
import type { MaskedInputProps } from './MaskedInput'
import { FormField } from '../FormField/FormField'
import { Text } from '../../atoms/Typography/Text'

const meta: Meta<typeof MaskedInput> = {
  component: MaskedInput,
  title: 'Molecules/MaskedInput',
  tags: ['autodocs'],
  args: { 'aria-label': 'Field' },
}
export default meta

type Story = StoryObj<typeof MaskedInput>

export const Cpf: Story = { args: { id: 'cpf', mask: 'cpf', 'aria-label': 'CPF' } }

export const Cnpj: Story = {
  args: { id: 'cnpj', mask: 'cnpj', 'aria-label': 'CNPJ', defaultValue: '12ABC34501DE35' },
}

export const Cep: Story = { args: { id: 'cep', mask: 'cep', 'aria-label': 'CEP' } }

export const Phone: Story = {
  args: { id: 'phone', mask: 'phone', 'aria-label': 'Telefone', defaultValue: '11999998888' },
}

export const Date: Story = { args: { id: 'date', mask: 'date', 'aria-label': 'Data' } }

export const CustomPattern: Story = {
  args: { id: 'custom', mask: '00.000-0', 'aria-label': 'Código' },
}

// The raw value an app would keep in state, next to the formatted one in the field.
function RawValue(props: MaskedInputProps) {
  const [raw, setRaw] = useState('')
  return (
    <div className="space-y-2">
      <MaskedInput {...props} onValueChange={(value) => setRaw(value)} />
      <Text size="sm" color="muted">
        Valor cru: {raw || '—'}
      </Text>
    </div>
  )
}

export const WithRawValue: Story = {
  args: { id: 'raw-cpf', mask: 'cpf', 'aria-label': 'CPF' },
  render: (args) => <RawValue {...args} />,
}

export const InForm: Story = {
  render: () => (
    <form className="max-w-sm space-y-4">
      <FormField label="CPF" id="form-cpf" hint="Só os números ou já formatado">
        <MaskedInput id="form-cpf" mask="cpf" />
      </FormField>
      <FormField label="CNPJ" id="form-cnpj">
        <MaskedInput id="form-cnpj" mask="cnpj" />
      </FormField>
      <FormField label="CEP" id="form-cep">
        <MaskedInput id="form-cep" mask="cep" />
      </FormField>
      <FormField label="Telefone" id="form-phone">
        <MaskedInput id="form-phone" mask="phone" />
      </FormField>
      <FormField label="Data de nascimento" id="form-date" error="Informe uma data válida">
        <MaskedInput id="form-date" mask="date" defaultValue="3102" state="error" />
      </FormField>
    </form>
  ),
}

// The caret in a real browser: jsdom doesn't reproduce every detail of the text selection.
export const CaretWhileEditing: Story = {
  args: { id: 'caret-cep', mask: 'cep', 'aria-label': 'CEP', defaultValue: '1234567' },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('textbox', { name: 'CEP' }) as HTMLInputElement
    await expect(input).toHaveValue('12345-67')

    // Typing in the middle keeps the caret right after the typed digit.
    input.focus()
    input.setSelectionRange(2, 2)
    await userEvent.keyboard('9')
    await expect(input).toHaveValue('12934-567')
    await expect(input.selectionStart).toBe(3)

    // Backspace right after the "-" deletes the digit before it.
    input.setSelectionRange(6, 6)
    await userEvent.keyboard('{Backspace}')
    await expect(input).toHaveValue('12935-67')
    await expect(input.selectionStart).toBe(4)
  },
}
