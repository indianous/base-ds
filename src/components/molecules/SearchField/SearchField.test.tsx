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
    const { container } = render(
      <SearchField onSearch={vi.fn()} placeholder="Search..." />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
