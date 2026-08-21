import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { Tabs } from './Tabs'
import type { TabItem } from './Tabs'

const tabs: TabItem[] = [
  { id: 'login', label: 'Entrar', content: 'Login form' },
  { id: 'signup', label: 'Criar Conta', content: 'Signup form' },
  { id: 'sso', label: 'SSO', content: 'SSO form', disabled: true },
]

describe('Tabs', () => {
  it('renders a tablist with a tab per item', () => {
    render(<Tabs tabs={tabs} />)
    expect(screen.getByRole('tablist')).toBeInTheDocument()
    expect(screen.getAllByRole('tab')).toHaveLength(3)
  })

  it('activates the first non-disabled tab by default', () => {
    render(<Tabs tabs={tabs} />)
    expect(screen.getByRole('tab', { name: 'Entrar' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Login form')
  })

  it('respects defaultTab', () => {
    render(<Tabs tabs={tabs} defaultTab="signup" />)
    expect(screen.getByRole('tab', { name: 'Criar Conta' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Signup form')
  })

  it('switches tabs on click', async () => {
    render(<Tabs tabs={tabs} />)
    await userEvent.click(screen.getByRole('tab', { name: 'Criar Conta' }))
    expect(screen.getByRole('tab', { name: 'Criar Conta' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Signup form')
  })

  it('calls onChange with the selected tab id', async () => {
    const onChange = vi.fn()
    render(<Tabs tabs={tabs} onChange={onChange} />)
    await userEvent.click(screen.getByRole('tab', { name: 'Criar Conta' }))
    expect(onChange).toHaveBeenCalledWith('signup')
  })

  it('disabled tab cannot be activated by click', async () => {
    render(<Tabs tabs={tabs} />)
    await userEvent.click(screen.getByRole('tab', { name: 'SSO' }))
    expect(screen.getByRole('tab', { name: 'SSO' })).toHaveAttribute('aria-selected', 'false')
  })

  it('moves focus and activates the next tab on ArrowRight, skipping disabled tabs', async () => {
    render(<Tabs tabs={tabs} />)
    const user = userEvent.setup()
    screen.getByRole('tab', { name: 'Entrar' }).focus()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'Criar Conta' })).toHaveFocus()
    expect(screen.getByRole('tab', { name: 'Criar Conta' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'Entrar' })).toHaveFocus()
  })

  it('moves focus to the previous tab on ArrowLeft with wraparound', async () => {
    render(<Tabs tabs={tabs} />)
    const user = userEvent.setup()
    screen.getByRole('tab', { name: 'Entrar' }).focus()
    await user.keyboard('{ArrowLeft}')
    expect(screen.getByRole('tab', { name: 'Criar Conta' })).toHaveFocus()
  })

  it('Home moves focus to the first tab', async () => {
    render(<Tabs tabs={tabs} defaultTab="signup" />)
    const user = userEvent.setup()
    screen.getByRole('tab', { name: 'Criar Conta' }).focus()
    await user.keyboard('{Home}')
    expect(screen.getByRole('tab', { name: 'Entrar' })).toHaveFocus()
  })

  it('End moves focus to the last non-disabled tab', async () => {
    render(<Tabs tabs={tabs} />)
    const user = userEvent.setup()
    screen.getByRole('tab', { name: 'Entrar' }).focus()
    await user.keyboard('{End}')
    expect(screen.getByRole('tab', { name: 'Criar Conta' })).toHaveFocus()
  })

  it('only the active tab is reachable via tab order (roving tabindex)', () => {
    render(<Tabs tabs={tabs} />)
    expect(screen.getByRole('tab', { name: 'Entrar' })).toHaveAttribute('tabIndex', '0')
    expect(screen.getByRole('tab', { name: 'Criar Conta' })).toHaveAttribute('tabIndex', '-1')
  })

  it('active tabpanel references its tab via aria-labelledby', () => {
    render(<Tabs tabs={tabs} />)
    const tab = screen.getByRole('tab', { name: 'Entrar' })
    const panel = screen.getByRole('tabpanel')
    expect(panel).toHaveAttribute('aria-labelledby', tab.id)
    expect(tab).toHaveAttribute('aria-controls', panel.id)
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<Tabs tabs={tabs} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
