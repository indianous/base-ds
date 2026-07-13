import type { Meta, StoryObj } from '@storybook/react'
import { Table } from './Table'
import type { TableColumn } from './Table'

interface User extends Record<string, unknown> {
  name: string
  email: string
  role: string
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
