import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { Table } from './Table'
import type { TableColumn } from './Table'

type User = { id: number; name: string; email: string }

const columns: TableColumn<User>[] = [
  { key: 'name', header: 'Name' },
  { key: 'email', header: 'Email' },
]

const data: User[] = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' },
]

describe('Table', () => {
  it('renders a table element', () => {
    const { container } = render(<Table columns={columns} data={data} />)
    expect(container.querySelector('table')).toBeInTheDocument()
  })

  it('renders column headers', () => {
    render(<Table columns={columns} data={data} />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('renders a row for each data item', () => {
    render(<Table columns={columns} data={data} />)
    const rows = screen.getAllByRole('row')
    // 1 header row + 2 data rows
    expect(rows).toHaveLength(3)
  })

  it('renders cell values using the key', () => {
    render(<Table columns={columns} data={data} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('alice@example.com')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('bob@example.com')).toBeInTheDocument()
  })

  it('renders caption when provided', () => {
    render(<Table columns={columns} data={data} caption="Users table" />)
    expect(screen.getByText('Users table')).toBeInTheDocument()
  })

  it('uses render function when provided instead of raw key value', () => {
    const columnsWithRender: TableColumn<User>[] = [
      { key: 'name', header: 'Name', render: (row) => <strong>{row.name.toUpperCase()}</strong> },
      { key: 'email', header: 'Email' },
    ]
    render(<Table columns={columnsWithRender} data={data} />)
    expect(screen.getByText('ALICE')).toBeInTheDocument()
    expect(screen.getByText('BOB')).toBeInTheDocument()
  })

  it('renders sortable column header as a button', () => {
    const sortableColumns: TableColumn<User>[] = [
      { key: 'name', header: 'Name', sortable: true },
      { key: 'email', header: 'Email' },
    ]
    render(<Table columns={sortableColumns} data={data} />)
    expect(screen.getByRole('button', { name: /Name/i })).toBeInTheDocument()
  })

  it('calls onSort with key and asc on first click of sortable header', async () => {
    const user = userEvent.setup()
    const onSort = vi.fn()
    const sortableColumns: TableColumn<User>[] = [
      { key: 'name', header: 'Name', sortable: true },
      { key: 'email', header: 'Email' },
    ]
    render(<Table columns={sortableColumns} data={data} onSort={onSort} />)
    await user.click(screen.getByRole('button', { name: /Name/i }))
    expect(onSort).toHaveBeenCalledWith('name', 'asc')
  })

  it('calls onSort with desc on second click (toggle)', async () => {
    const user = userEvent.setup()
    const onSort = vi.fn()
    const sortableColumns: TableColumn<User>[] = [
      { key: 'name', header: 'Name', sortable: true },
      { key: 'email', header: 'Email' },
    ]
    render(<Table columns={sortableColumns} data={data} onSort={onSort} />)
    const btn = screen.getByRole('button', { name: /Name/i })
    await user.click(btn)
    await user.click(btn)
    expect(onSort).toHaveBeenNthCalledWith(1, 'name', 'asc')
    expect(onSort).toHaveBeenNthCalledWith(2, 'name', 'desc')
  })

  it('renders empty state when data is empty', () => {
    render(<Table columns={columns} data={[]} />)
    expect(screen.getByText('No data')).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Table columns={columns} data={data} caption="Users table" />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
