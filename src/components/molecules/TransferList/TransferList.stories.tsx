import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { TransferList } from './TransferList'
import type { TransferListProps } from './TransferList'

const meta: Meta<typeof TransferList> = {
  component: TransferList,
  title: 'Molecules/TransferList',
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof TransferList>

const permissionOptions = [
  { value: 'orders.read', label: 'Ver pedidos' },
  { value: 'orders.write', label: 'Editar pedidos' },
  { value: 'products.read', label: 'Ver produtos' },
  { value: 'products.write', label: 'Editar produtos' },
  { value: 'employees.manage', label: 'Gerenciar funcionários' },
]

function ControlledTransferList(args: TransferListProps) {
  const [value, setValue] = useState<string[]>(args.value)
  return <TransferList {...args} value={value} onChange={setValue} />
}

export const AssignPermissions: Story = {
  render: (args) => <ControlledTransferList {...args} />,
  args: {
    options: permissionOptions,
    value: ['orders.read', 'products.read'],
    onChange: () => {},
    availableLabel: 'Disponível',
    selectedLabel: 'Selecionado',
  },
}

export const Empty: Story = {
  render: (args) => <ControlledTransferList {...args} />,
  args: {
    options: permissionOptions,
    value: [],
    onChange: () => {},
  },
}

export const FullyLocalized: Story = {
  render: (args) => <ControlledTransferList {...args} />,
  args: {
    options: permissionOptions,
    value: ['orders.read'],
    onChange: () => {},
    availableLabel: 'Disponível',
    selectedLabel: 'Atribuído',
    moveLabel: 'Atribuir',
    moveAllLabel: 'Atribuir todas',
    moveBackLabel: 'Remover',
    moveAllBackLabel: 'Remover todas',
  },
}

export const Disabled: Story = {
  args: {
    options: permissionOptions,
    value: ['orders.read'],
    onChange: () => {},
    disabled: true,
  },
}
