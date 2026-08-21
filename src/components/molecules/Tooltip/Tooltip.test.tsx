import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { Tooltip } from './Tooltip'

describe('Tooltip', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('does not render the tooltip bubble initially', () => {
    render(
      <Tooltip label="Excluir">
        <button>Delete</button>
      </Tooltip>,
    )
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('shows the tooltip on mouse hover', async () => {
    render(
      <Tooltip label="Excluir">
        <button>Delete</button>
      </Tooltip>,
    )
    await userEvent.hover(screen.getByRole('button'))
    expect(screen.getByRole('tooltip')).toHaveTextContent('Excluir')
  })

  it('hides the tooltip on mouse unhover', async () => {
    render(
      <Tooltip label="Excluir">
        <button>Delete</button>
      </Tooltip>,
    )
    const trigger = screen.getByRole('button')
    await userEvent.hover(trigger)
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
    await userEvent.unhover(trigger)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('shows the tooltip on focus', async () => {
    render(
      <Tooltip label="Excluir">
        <button>Delete</button>
      </Tooltip>,
    )
    await userEvent.tab()
    expect(screen.getByRole('tooltip')).toHaveTextContent('Excluir')
  })

  it('hides the tooltip on blur', async () => {
    render(
      <>
        <Tooltip label="Excluir">
          <button>Delete</button>
        </Tooltip>
        <button>Other</button>
      </>,
    )
    await userEvent.tab()
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
    await userEvent.tab()
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('hides the tooltip on Escape', async () => {
    render(
      <Tooltip label="Excluir">
        <button>Delete</button>
      </Tooltip>,
    )
    await userEvent.hover(screen.getByRole('button'))
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('associates the trigger with the tooltip via aria-describedby', async () => {
    render(
      <Tooltip label="Excluir">
        <button>Delete</button>
      </Tooltip>,
    )
    const trigger = screen.getByRole('button')
    await userEvent.hover(trigger)
    const tooltip = screen.getByRole('tooltip')
    expect(trigger).toHaveAttribute('aria-describedby', tooltip.id)
  })

  it('does not set aria-describedby when hidden', () => {
    render(
      <Tooltip label="Excluir">
        <button>Delete</button>
      </Tooltip>,
    )
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-describedby')
  })

  it('flips from top to bottom when there is not enough space above the trigger', async () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      top: 10,
      bottom: 30,
      left: 0,
      right: 100,
      width: 100,
      height: 20,
      x: 0,
      y: 10,
      toJSON: () => {},
    })
    render(
      <Tooltip label="Excluir" position="top">
        <button>Delete</button>
      </Tooltip>,
    )
    await userEvent.hover(screen.getByRole('button'))
    expect(screen.getByRole('tooltip')).toHaveClass('top-full')
  })

  it('keeps the requested position when there is enough space', async () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      top: 200,
      bottom: 230,
      left: 0,
      right: 100,
      width: 100,
      height: 20,
      x: 0,
      y: 200,
      toJSON: () => {},
    })
    render(
      <Tooltip label="Excluir" position="top">
        <button>Delete</button>
      </Tooltip>,
    )
    await userEvent.hover(screen.getByRole('button'))
    expect(screen.getByRole('tooltip')).toHaveClass('bottom-full')
  })

  it('renders on the left when position="left"', async () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      bottom: 120,
      left: 200,
      right: 300,
      width: 100,
      height: 20,
      x: 200,
      y: 100,
      toJSON: () => {},
    })
    render(
      <Tooltip label="Voltar" position="left">
        <button>Back</button>
      </Tooltip>,
    )
    await userEvent.hover(screen.getByRole('button'))
    expect(screen.getByRole('tooltip')).toHaveClass('right-full')
  })

  it('renders on the right when position="right"', async () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      bottom: 120,
      left: 0,
      right: 100,
      width: 100,
      height: 20,
      x: 0,
      y: 100,
      toJSON: () => {},
    })
    render(
      <Tooltip label="Avançar" position="right">
        <button>Next</button>
      </Tooltip>,
    )
    await userEvent.hover(screen.getByRole('button'))
    expect(screen.getByRole('tooltip')).toHaveClass('left-full')
  })

  it('flips from left to right when there is not enough space to the left', async () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      bottom: 120,
      left: 5,
      right: 105,
      width: 100,
      height: 20,
      x: 5,
      y: 100,
      toJSON: () => {},
    })
    render(
      <Tooltip label="Voltar" position="left">
        <button>Back</button>
      </Tooltip>,
    )
    await userEvent.hover(screen.getByRole('button'))
    expect(screen.getByRole('tooltip')).toHaveClass('left-full')
  })

  it('flips from right to left when there is not enough space to the right', async () => {
    const originalInnerWidth = window.innerWidth
    Object.defineProperty(window, 'innerWidth', { value: 120, configurable: true })
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      bottom: 120,
      left: 0,
      right: 100,
      width: 100,
      height: 20,
      x: 0,
      y: 100,
      toJSON: () => {},
    })
    render(
      <Tooltip label="Avançar" position="right">
        <button>Next</button>
      </Tooltip>,
    )
    await userEvent.hover(screen.getByRole('button'))
    expect(screen.getByRole('tooltip')).toHaveClass('right-full')
    Object.defineProperty(window, 'innerWidth', { value: originalInnerWidth, configurable: true })
  })

  it('has no accessibility violations while visible', async () => {
    const { container } = render(
      <Tooltip label="Excluir">
        <button>Delete</button>
      </Tooltip>,
    )
    await userEvent.hover(screen.getByRole('button'))
    expect(await axe(container)).toHaveNoViolations()
  })
})
