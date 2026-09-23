import type { Meta, StoryObj } from '@storybook/react'
import { Table } from './Table'
import type { TableColumn } from './Table'
import { Checkbox } from '../../atoms/Checkbox/Checkbox'

interface User extends Record<string, unknown> {
  name: string
  email: string
  role: string
}

interface Order extends Record<string, unknown> {
  id: string
  customer: string
  total: string
  items: { product: string; quantity: number; unitPrice: string; subtotal: string }[]
}

const meta: Meta<typeof Table<User>> = {
  component: Table,
  title: 'Organisms/Table',
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Table<User>>

const columns: TableColumn<User>[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'email', header: 'Email' },
  { key: 'role', header: 'Role', sortable: true },
]

const data: User[] = [
  { name: 'Ada Lovelace', email: 'ada@example.com', role: 'Admin' },
  { name: 'Alan Turing', email: 'alan@example.com', role: 'Editor' },
  { name: 'Grace Hopper', email: 'grace@example.com', role: 'Admin' },
]

export const Default: Story = {
  args: { columns, data, caption: 'List of users' },
}

export const Empty: Story = {
  args: { columns, data: [], caption: 'List of users' },
}

export const WithCustomRender: Story = {
  args: {
    columns: [
      ...columns,
      {
        key: 'actions',
        header: 'Actions',
        render: () => <button className="text-sm text-primary">Edit</button>,
      },
    ],
    data,
    caption: 'List of users',
  },
}

export const WithSelectAllHeader: Story = {
  args: {
    columns: [
      {
        key: 'select',
        header: <Checkbox id="select-all" label="Select all" aria-label="Select all rows" />,
        render: (_row, rowIndex) => (
          <Checkbox id={`select-${rowIndex}`} aria-label={`Select row ${rowIndex + 1}`} />
        ),
      },
      ...columns,
    ],
    data,
    caption: 'List of users',
  },
}

const orderColumns: TableColumn<Order>[] = [
  { key: 'id', header: 'Order' },
  { key: 'customer', header: 'Customer' },
  { key: 'total', header: 'Total' },
]

const orders: Order[] = [
  {
    id: '#1001',
    customer: 'Ada Lovelace',
    total: '$120.00',
    items: [
      { product: 'Notebook', quantity: 2, unitPrice: '$20.00', subtotal: '$40.00' },
      { product: 'Pen set', quantity: 4, unitPrice: '$20.00', subtotal: '$80.00' },
    ],
  },
  {
    id: '#1002',
    customer: 'Alan Turing',
    total: '$45.00',
    items: [{ product: 'Desk lamp', quantity: 1, unitPrice: '$45.00', subtotal: '$45.00' }],
  },
]

export const ExpandableRows: Story = {
  args: {
    columns: orderColumns as unknown as TableColumn<User>[],
    data: orders as unknown as User[],
    caption: 'Orders',
    renderExpandedRow: (row: User) => {
      const order = row as unknown as Order
      return (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground">
              <th className="py-1 pr-4">Product</th>
              <th className="py-1 pr-4">Qty</th>
              <th className="py-1 pr-4">Unit price</th>
              <th className="py-1">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.product}>
                <td className="py-1 pr-4">{item.product}</td>
                <td className="py-1 pr-4">{item.quantity}</td>
                <td className="py-1 pr-4">{item.unitPrice}</td>
                <td className="py-1">{item.subtotal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )
    },
  } as unknown as NonNullable<Story['args']>,
}
