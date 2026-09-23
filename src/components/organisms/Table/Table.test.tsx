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

  it('renders a non-string ReactNode as the column header', () => {
    const columnsWithNodeHeader: TableColumn<User>[] = [
      { key: 'name', header: <span data-testid="select-all">Select all</span> },
      { key: 'email', header: 'Email' },
    ]
    render(<Table columns={columnsWithNodeHeader} data={data} />)
    expect(screen.getByTestId('select-all')).toBeInTheDocument()
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
    const { container } = render(<Table columns={columns} data={data} caption="Users table" />)
    expect(await axe(container)).toHaveNoViolations()
  })

  describe('renderExpandedRow', () => {
    const renderExpandedRow = (row: User) => <div>Details for {row.name}</div>

    it('does not render a toggle column when renderExpandedRow is not provided', () => {
      render(<Table columns={columns} data={data} />)
      expect(screen.queryByRole('button', { name: /Expand row/i })).not.toBeInTheDocument()
    })

    it('renders a toggle button per row when renderExpandedRow is provided', () => {
      render(<Table columns={columns} data={data} renderExpandedRow={renderExpandedRow} />)
      expect(screen.getAllByRole('button', { name: /Expand row/i })).toHaveLength(2)
    })

    it('does not render the detail row until expanded', () => {
      render(<Table columns={columns} data={data} renderExpandedRow={renderExpandedRow} />)
      expect(screen.queryByText('Details for Alice')).not.toBeInTheDocument()
    })

    it('shows the detail row after clicking the toggle, and hides it again on second click', async () => {
      const user = userEvent.setup()
      render(<Table columns={columns} data={data} renderExpandedRow={renderExpandedRow} />)
      const toggle = screen.getAllByRole('button', { name: /Expand row/i })[0]!
      await user.click(toggle)
      expect(screen.getByText('Details for Alice')).toBeInTheDocument()

      const collapseToggle = screen.getByRole('button', { name: /Collapse row/i })
      await user.click(collapseToggle)
      expect(screen.queryByText('Details for Alice')).not.toBeInTheDocument()
    })

    it('toggles aria-expanded on the button', async () => {
      const user = userEvent.setup()
      render(<Table columns={columns} data={data} renderExpandedRow={renderExpandedRow} />)
      const toggle = screen.getAllByRole('button', { name: /Expand row/i })[0]!
      expect(toggle).toHaveAttribute('aria-expanded', 'false')
      await user.click(toggle)
      expect(toggle).toHaveAttribute('aria-expanded', 'true')
    })

    it('associates the toggle with the detail row via aria-controls', async () => {
      const user = userEvent.setup()
      render(<Table columns={columns} data={data} renderExpandedRow={renderExpandedRow} />)
      const toggle = screen.getAllByRole('button', { name: /Expand row/i })[0]!
      await user.click(toggle)
      const controlsId = toggle.getAttribute('aria-controls')
      expect(controlsId).toBeTruthy()
      const detailRow = document.getElementById(controlsId as string)
      expect(detailRow).toContainElement(screen.getByText('Details for Alice'))
    })

    it('sets colSpan on the detail cell to account for the extra toggle column', async () => {
      const user = userEvent.setup()
      render(<Table columns={columns} data={data} renderExpandedRow={renderExpandedRow} />)
      const toggle = screen.getAllByRole('button', { name: /Expand row/i })[0]!
      await user.click(toggle)
      const detailCell = screen.getByText('Details for Alice').closest('td')
      expect(detailCell).toHaveAttribute('colspan', String(columns.length + 1))
    })

    it('uses the extended colSpan for the empty state row too', () => {
      render(<Table columns={columns} data={[]} renderExpandedRow={renderExpandedRow} />)
      const emptyCell = screen.getByText('No data').closest('td')
      expect(emptyCell).toHaveAttribute('colspan', String(columns.length + 1))
    })

    it('has no accessibility violations with a row expanded', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <Table columns={columns} data={data} renderExpandedRow={renderExpandedRow} />,
      )
      await user.click(screen.getAllByRole('button', { name: /Expand row/i })[0]!)
      expect(await axe(container)).toHaveNoViolations()
    })
  })
})
