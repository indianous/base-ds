import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { ConversationList } from './ConversationList'
import type { ConversationListItem } from './ConversationList'

const conversations: ConversationListItem[] = [
  {
    id: '1',
    leadName: 'Maria Silva',
    channel: 'whatsapp',
    lastMessagePreview: 'Can we talk tomorrow?',
    timestamp: '09:30',
    unreadCount: 2,
  },
  {
    id: '2',
    leadName: 'João Costa',
    channel: 'telegram',
    lastMessagePreview: 'Thanks for the info',
    timestamp: '08:15',
  },
]

describe('ConversationList', () => {
  it('renders one row per conversation with leadName, preview and timestamp', () => {
    render(<ConversationList conversations={conversations} onSelectConversation={() => {}} />)
    expect(screen.getByText('Maria Silva')).toBeInTheDocument()
    expect(screen.getByText('Can we talk tomorrow?')).toBeInTheDocument()
    expect(screen.getByText('09:30')).toBeInTheDocument()
    expect(screen.getByText('João Costa')).toBeInTheDocument()
    expect(screen.getByText('Thanks for the info')).toBeInTheDocument()
    expect(screen.getByText('08:15')).toBeInTheDocument()
  })

  it('shows the unread indicator when unreadCount is greater than 0', () => {
    render(<ConversationList conversations={conversations} onSelectConversation={() => {}} />)
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('hides the unread indicator when unreadCount is 0 or undefined', () => {
    const items: ConversationListItem[] = [
      { ...conversations[1], unreadCount: 0 },
      conversations[1],
    ]
    render(<ConversationList conversations={items} onSelectConversation={() => {}} />)
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('calls onSelectConversation with the id when a row is clicked', async () => {
    const user = userEvent.setup()
    const onSelectConversation = vi.fn()
    render(
      <ConversationList
        conversations={conversations}
        onSelectConversation={onSelectConversation}
      />,
    )
    await user.click(screen.getByRole('button', { name: /Maria Silva/ }))
    expect(onSelectConversation).toHaveBeenCalledWith('1')
  })

  it('marks the active conversation with aria-current and active styling', () => {
    render(
      <ConversationList
        conversations={conversations}
        activeConversationId="2"
        onSelectConversation={() => {}}
      />,
    )
    const activeRow = screen.getByRole('button', { name: /João Costa/ })
    const inactiveRow = screen.getByRole('button', { name: /Maria Silva/ })
    expect(activeRow).toHaveAttribute('aria-current', 'true')
    expect(inactiveRow).not.toHaveAttribute('aria-current')
    expect(activeRow.className).not.toBe(inactiveRow.className)
  })

  it('triggers selection via keyboard activation (Enter)', async () => {
    const user = userEvent.setup()
    const onSelectConversation = vi.fn()
    render(
      <ConversationList
        conversations={conversations}
        onSelectConversation={onSelectConversation}
      />,
    )
    await user.tab()
    expect(screen.getByRole('button', { name: /Maria Silva/ })).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(onSelectConversation).toHaveBeenCalledWith('1')
  })

  it('uses renderChannelIcon when provided', () => {
    const renderChannelIcon = vi.fn((channel: string) => <span data-testid={`icon-${channel}`} />)
    render(
      <ConversationList
        conversations={conversations}
        onSelectConversation={() => {}}
        renderChannelIcon={renderChannelIcon}
      />,
    )
    expect(screen.getByTestId('icon-whatsapp')).toBeInTheDocument()
    expect(screen.getByTestId('icon-telegram')).toBeInTheDocument()
  })

  it('falls back to a generic icon and channel label when renderChannelIcon is not provided', () => {
    render(<ConversationList conversations={conversations} onSelectConversation={() => {}} />)
    expect(screen.getByText('whatsapp')).toBeInTheDocument()
    expect(screen.getByText('telegram')).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <ConversationList
        conversations={conversations}
        activeConversationId="1"
        onSelectConversation={() => {}}
      />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
