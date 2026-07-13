import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { Pagination } from './Pagination'

describe('Pagination', () => {
  it('renders a nav with aria-label="Pagination"', () => {
    render(<Pagination currentPage={1} totalPages={10} onPageChange={vi.fn()} />)
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument()
  })

  it('renders Previous and Next buttons', () => {
    render(<Pagination currentPage={3} totalPages={10} onPageChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next page' })).toBeInTheDocument()
  })

  it('renders page number buttons', () => {
    render(<Pagination currentPage={3} totalPages={10} onPageChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Page 1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Page 3' })).toBeInTheDocument()
  })

  it('Previous button is disabled on page 1', () => {
    render(<Pagination currentPage={1} totalPages={10} onPageChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled()
  })

  it('Next button is disabled on the last page', () => {
    render(<Pagination currentPage={10} totalPages={10} onPageChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled()
  })

  it('calls onPageChange with page - 1 when Previous is clicked', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    render(<Pagination currentPage={3} totalPages={10} onPageChange={onPageChange} />)
    await user.click(screen.getByRole('button', { name: 'Previous page' }))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('calls onPageChange with page + 1 when Next is clicked', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    render(<Pagination currentPage={3} totalPages={10} onPageChange={onPageChange} />)
    await user.click(screen.getByRole('button', { name: 'Next page' }))
    expect(onPageChange).toHaveBeenCalledWith(4)
  })

  it('calls onPageChange with the page number when a page button is clicked', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    // With currentPage=3 siblings=1: visible range is [1,2,3,4,'...',10]
    render(<Pagination currentPage={3} totalPages={10} onPageChange={onPageChange} />)
    await user.click(screen.getByRole('button', { name: 'Page 4' }))
    expect(onPageChange).toHaveBeenCalledWith(4)
  })

  it('current page button has aria-current="page"', () => {
    render(<Pagination currentPage={3} totalPages={10} onPageChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Page 3' })).toHaveAttribute('aria-current', 'page')
  })

  it('renders ellipsis when pages are far apart', () => {
    render(<Pagination currentPage={5} totalPages={10} onPageChange={vi.fn()} />)
    // With currentPage=5, siblings=1: range is [1, '...', 4, 5, 6, '...', 10]
    // MoreHorizontal icons are rendered for ellipsis
    const nav = screen.getByRole('navigation', { name: 'Pagination' })
    expect(nav.querySelectorAll('span').length).toBeGreaterThan(0)
  })

  it('renders First and Last buttons when showEdges=true', () => {
    render(<Pagination currentPage={3} totalPages={10} onPageChange={vi.fn()} showEdges={true} />)
    expect(screen.getByRole('button', { name: 'First page' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Last page' })).toBeInTheDocument()
  })

  it('does not render First and Last buttons when showEdges=false', () => {
    render(<Pagination currentPage={3} totalPages={10} onPageChange={vi.fn()} showEdges={false} />)
    expect(screen.queryByRole('button', { name: 'First page' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Last page' })).not.toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Pagination currentPage={3} totalPages={10} onPageChange={vi.fn()} />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
