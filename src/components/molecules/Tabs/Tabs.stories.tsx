import type { Meta, StoryObj } from '@storybook/react'
import { Tabs } from './Tabs'

const meta: Meta<typeof Tabs> = {
  component: Tabs,
  title: 'Molecules/Tabs',
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof Tabs>

export const Default: Story = {
  args: {
    tabs: [
      { id: 'login', label: 'Entrar', content: 'Formulário de login aqui.' },
      { id: 'signup', label: 'Criar Conta', content: 'Formulário de cadastro aqui.' },
    ],
  },
}

export const WithDisabledTab: Story = {
  args: {
    tabs: [
      { id: 'details', label: 'Detalhes', content: 'Detalhes do pedido.' },
      { id: 'shipping', label: 'Envio', content: 'Informações de envio.' },
      { id: 'invoice', label: 'Nota Fiscal', content: 'Indisponível.', disabled: true },
    ],
  },
}
