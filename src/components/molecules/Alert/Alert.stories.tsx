import type { Meta, StoryObj } from '@storybook/react'
import { Alert } from './Alert'
import { Button } from '../../atoms/Button/Button'
import { Icon } from '../../atoms/Icon/Icon'

const meta: Meta<typeof Alert> = {
  component: Alert,
  title: 'Molecules/Alert',
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof Alert>

export const Info: Story = {
  args: {
    variant: 'info',
    title: 'Novidade',
    children: 'O frete grátis agora vale acima de R$ 99.',
  },
}
export const Success: Story = {
  args: { variant: 'success', title: 'Pedido confirmado', children: 'Você receberá um e-mail.' },
}
export const Warning: Story = {
  args: { variant: 'warning', title: 'Atenção', children: 'Seu cartão expira este mês.' },
}
export const Danger: Story = {
  args: { variant: 'danger', title: 'Pagamento recusado', children: 'Tente outro cartão.' },
}
export const Neutral: Story = {
  args: { variant: 'neutral', children: 'A loja fecha para manutenção no domingo.' },
}

export const FullWidth: Story = {
  args: {
    variant: 'neutral',
    layout: 'full',
    icon: <Icon name="Eye" />,
    children: 'Você está vendo a loja como um cliente.',
    actions: (
      <Button as="a" href="#" variant="outline" size="sm">
        Voltar ao painel
      </Button>
    ),
  },
}

export const WithActions: Story = {
  args: {
    variant: 'warning',
    children: 'Confirme seu e-mail para poder finalizar pedidos.',
    actions: (
      <Button variant="outline" size="sm">
        Reenviar e-mail
      </Button>
    ),
  },
}

export const Dismissible: Story = {
  args: {
    variant: 'success',
    title: 'Endereço salvo',
    children: 'Ele será usado nas próximas compras.',
    onDismiss: () => {},
    dismissLabel: 'Fechar aviso',
  },
}

export const WithoutIcon: Story = {
  args: { variant: 'info', icon: null, children: 'Aviso sem ícone.' },
}

export const LongContentWithActions: Story = {
  render: () => (
    <div className="max-w-xs">
      <Alert
        variant="warning"
        title="E-mail não confirmado"
        onDismiss={() => {}}
        actions={
          <>
            <Button variant="outline" size="sm">
              Reenviar e-mail
            </Button>
            <Button variant="ghost" size="sm">
              Alterar e-mail
            </Button>
          </>
        }
      >
        Confirme seu e-mail para poder finalizar pedidos. O link enviado vale por 24 horas.
      </Alert>
    </div>
  ),
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Alert variant="info">Info</Alert>
      <Alert variant="success">Success</Alert>
      <Alert variant="warning">Warning</Alert>
      <Alert variant="danger">Danger</Alert>
      <Alert variant="neutral">Neutral</Alert>
    </div>
  ),
}
