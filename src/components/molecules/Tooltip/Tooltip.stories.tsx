import type { Meta, StoryObj } from '@storybook/react'
import { Tooltip } from './Tooltip'
import { Button } from '../../atoms/Button/Button'
import { Icon } from '../../atoms/Icon/Icon'

const meta: Meta<typeof Tooltip> = {
  component: Tooltip,
  title: 'Molecules/Tooltip',
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof Tooltip>

export const Top: Story = {
  render: () => (
    <div className="p-16">
      <Tooltip label="Excluir" position="top">
        <Button iconOnly variant="ghost" aria-label="Delete">
          <Icon name="Trash" size="sm" />
        </Button>
      </Tooltip>
    </div>
  ),
}

export const Bottom: Story = {
  render: () => (
    <div className="p-16">
      <Tooltip label="Buscar" position="bottom">
        <Button iconOnly variant="outline" aria-label="Search">
          <Icon name="Search" size="sm" />
        </Button>
      </Tooltip>
    </div>
  ),
}

export const Left: Story = {
  render: () => (
    <div className="p-16">
      <Tooltip label="Voltar" position="left">
        <Button iconOnly variant="ghost" aria-label="Back">
          <Icon name="ArrowLeft" size="sm" />
        </Button>
      </Tooltip>
    </div>
  ),
}

export const Right: Story = {
  render: () => (
    <div className="p-16">
      <Tooltip label="Avançar" position="right">
        <Button iconOnly variant="ghost" aria-label="Next">
          <Icon name="ArrowRight" size="sm" />
        </Button>
      </Tooltip>
    </div>
  ),
}

export const ViewportFallback: Story = {
  render: () => (
    <div className="pt-2">
      <Tooltip label="Sem espaço acima, inverte para baixo" position="top">
        <Button iconOnly variant="ghost" aria-label="Delete">
          <Icon name="Trash" size="sm" />
        </Button>
      </Tooltip>
    </div>
  ),
}
