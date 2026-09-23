import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { SearchField } from './SearchField'

describe('SearchField', () => {
  it('renders an input and a search button', () => {
    render(<SearchField onSearch={vi.fn()} placeholder="Search..." />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument()
  })

  it('calls onSearch with current input value when search button is clicked', async () => {
    const user = userEvent.setup()
    const onSearch = vi.fn()
    render(<SearchField onSearch={onSearch} placeholder="Search..." />)
    await user.type(screen.getByRole('textbox'), 'hello')
    await user.click(screen.getByRole('button', { name: /search/i }))
    expect(onSearch).toHaveBeenCalledWith('hello')
  })

  it('calls onSearch when Enter key is pressed in the input', async () => {
    const user = userEvent.setup()
    const onSearch = vi.fn()
    render(<SearchField onSearch={onSearch} placeholder="Search..." />)
    await user.type(screen.getByRole('textbox'), 'react')
    await user.keyboard('{Enter}')
    expect(onSearch).toHaveBeenCalledWith('react')
  })

  it('does not call onSearch when isLoading is true and button is clicked', async () => {
    const user = userEvent.setup()
    const onSearch = vi.fn()
    render(<SearchField onSearch={onSearch} isLoading defaultValue="react" />)
    await user.click(screen.getByRole('button', { name: /search/i }))
    expect(onSearch).not.toHaveBeenCalled()
  })

  it('shows loading state on the search button when isLoading=true', () => {
    render(<SearchField onSearch={vi.fn()} isLoading />)
    const button = screen.getByRole('button', { name: /search/i })
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(button).toBeDisabled()
  })

  it('renders with default value in input when defaultValue is provided', () => {
    render(<SearchField onSearch={vi.fn()} defaultValue="typescript" />)
    expect(screen.getByRole('textbox')).toHaveValue('typescript')
  })

  it('updates input value as user types', async () => {
    const user = userEvent.setup()
    render(<SearchField onSearch={vi.fn()} />)
    const input = screen.getByRole('textbox')
    await user.type(input, 'vitest')
    expect(input).toHaveValue('vitest')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<SearchField onSearch={vi.fn()} placeholder="Search..." />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('uses the provided id on the underlying input', () => {
    render(<SearchField onSearch={vi.fn()} id="products-search" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('id', 'products-search')
  })

  it('generates unique input ids when id is not provided, avoiding collisions between instances', () => {
    render(
      <>
        <SearchField onSearch={vi.fn()} />
        <SearchField onSearch={vi.fn()} />
      </>,
    )
    const inputs = screen.getAllByRole('textbox')
    expect(inputs).toHaveLength(2)
    const [first, second] = inputs as [HTMLElement, HTMLElement]
    expect(first.id).toBeTruthy()
    expect(second.id).toBeTruthy()
    expect(first.id).not.toBe(second.id)
  })

  it('uses the provided label as the accessible name of the input', () => {
    render(<SearchField onSearch={vi.fn()} label="Buscar produtos" />)
    expect(screen.getByRole('textbox', { name: 'Buscar produtos' })).toBeInTheDocument()
  })

  it('uses the provided buttonLabel as visible text and accessible name of the button', () => {
    render(<SearchField onSearch={vi.fn()} buttonLabel="Buscar" />)
    const button = screen.getByRole('button', { name: 'Buscar' })
    expect(button).toBeInTheDocument()
    expect(screen.getByText('Buscar')).toBeInTheDocument()
  })

  it('does not render buttonLabel as visible text when buttonIconOnly is true, but keeps it as the accessible name', () => {
    render(<SearchField onSearch={vi.fn()} buttonLabel="Buscar" buttonIconOnly />)
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeInTheDocument()
    expect(screen.queryByText('Buscar')).not.toBeInTheDocument()
  })

  it('has no accessibility violations with custom id, label, buttonLabel and buttonIconOnly', async () => {
    const { container } = render(
      <SearchField
        onSearch={vi.fn()}
        id="products-search"
        label="Buscar produtos"
        buttonLabel="Buscar"
        buttonIconOnly
      />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
