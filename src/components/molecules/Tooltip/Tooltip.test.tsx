import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
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
    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toHaveStyle({ top: '36px', left: '50px', transform: 'translate(-50%, 0)' })
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
    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toHaveStyle({
      top: '194px',
      left: '50px',
      transform: 'translate(-50%, -100%)',
    })
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
    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toHaveStyle({
      top: '110px',
      left: '194px',
      transform: 'translate(-100%, -50%)',
    })
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
    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toHaveStyle({ top: '110px', left: '106px', transform: 'translate(0, -50%)' })
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
    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toHaveStyle({ top: '110px', left: '111px', transform: 'translate(0, -50%)' })
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
    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toHaveStyle({
      top: '110px',
      left: '-6px',
      transform: 'translate(-100%, -50%)',
    })
    Object.defineProperty(window, 'innerWidth', { value: originalInnerWidth, configurable: true })
  })

  it('renders the bubble as a portal to document.body, outside an overflow-hidden ancestor', async () => {
    const { container } = render(
      <div style={{ overflow: 'hidden', height: 20 }} data-testid="clipping-ancestor">
        <Tooltip label="Excluir">
          <button>Delete</button>
        </Tooltip>
      </div>,
    )
    await userEvent.hover(screen.getByRole('button'))
    const tooltip = screen.getByRole('tooltip')
    expect(container.contains(tooltip)).toBe(false)
    expect(tooltip.parentElement).toBe(document.body)
    expect(tooltip).toHaveStyle({ position: 'fixed' })
  })

  it('recomputes the position on window scroll while visible', async () => {
    const rects = [
      {
        top: 100,
        bottom: 120,
        left: 0,
        right: 100,
        width: 100,
        height: 20,
        x: 0,
        y: 100,
        toJSON: () => {},
      },
      {
        top: 40,
        bottom: 60,
        left: 0,
        right: 100,
        width: 100,
        height: 20,
        x: 0,
        y: 40,
        toJSON: () => {},
      },
    ]
    let call = 0
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      () => rects[Math.min(call++, rects.length - 1)] as DOMRect,
    )
    render(
      <Tooltip label="Excluir">
        <button>Delete</button>
      </Tooltip>,
    )
    await userEvent.hover(screen.getByRole('button'))
    expect(screen.getByRole('tooltip')).toHaveStyle({ top: '94px' })

    window.dispatchEvent(new Event('scroll'))
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toHaveStyle({ top: '34px' })
    })
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

  describe('extra props forwarding', () => {
    it('forwards an onClick injected on Tooltip itself to the child', async () => {
      const onClick = vi.fn()
      render(
        <Tooltip label="Menu" onClick={onClick}>
          <button>Trigger</button>
        </Tooltip>,
      )
      await userEvent.click(screen.getByRole('button'))
      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('calls both the injected onClick and the child own onClick', async () => {
      const injectedOnClick = vi.fn()
      const childOnClick = vi.fn()
      render(
        <Tooltip label="Menu" onClick={injectedOnClick}>
          <button onClick={childOnClick}>Trigger</button>
        </Tooltip>,
      )
      await userEvent.click(screen.getByRole('button'))
      expect(injectedOnClick).toHaveBeenCalledTimes(1)
      expect(childOnClick).toHaveBeenCalledTimes(1)
    })

    it('forwards arbitrary aria/data attributes injected on Tooltip to the child', () => {
      render(
        <Tooltip label="Menu" aria-haspopup="menu" aria-expanded={true} data-state="open">
          <button>Trigger</button>
        </Tooltip>,
      )
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-haspopup', 'menu')
      expect(button).toHaveAttribute('aria-expanded', 'true')
      expect(button).toHaveAttribute('data-state', 'open')
    })

    it('still shows the tooltip and toggles the injected handler when composed like a DropdownMenu trigger', async () => {
      const onClick = vi.fn()
      render(
        <Tooltip label="Abrir menu" onClick={onClick} aria-haspopup="menu" aria-expanded={false}>
          <button aria-label="User menu">Avatar</button>
        </Tooltip>,
      )
      const button = screen.getByRole('button', { name: 'User menu' })
      await userEvent.click(button)
      expect(onClick).toHaveBeenCalledTimes(1)
      await userEvent.hover(button)
      expect(screen.getByRole('tooltip')).toHaveTextContent('Abrir menu')
    })
  })
})
