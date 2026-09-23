import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { ConversationThread } from './ConversationThread'
import type { ConversationMessage } from './ConversationThread'

const baseMessages: ConversationMessage[] = [
  { id: '1', direction: 'INBOUND', content: 'Hello there', timestamp: '10:00' },
  {
    id: '2',
    direction: 'OUTBOUND',
    content: 'Hi! How can I help?',
    timestamp: '10:01',
    status: 'SENT',
  },
]

describe('ConversationThread', () => {
  it('renders messages in the order received', () => {
    render(<ConversationThread messages={baseMessages} onSend={() => {}} />)
    const rendered = screen.getAllByText(/Hello there|Hi! How can I help\?/)
    expect(rendered[0]).toHaveTextContent('Hello there')
    expect(rendered[1]).toHaveTextContent('Hi! How can I help?')
  })

  it('marks inbound and outbound messages with different data-direction attributes', () => {
    render(<ConversationThread messages={baseMessages} onSend={() => {}} />)
    expect(screen.getByText('Hello there').closest('[data-direction]')).toHaveAttribute(
      'data-direction',
      'INBOUND',
    )
    expect(screen.getByText('Hi! How can I help?').closest('[data-direction]')).toHaveAttribute(
      'data-direction',
      'OUTBOUND',
    )
  })

  it.each<[NonNullable<ConversationMessage['status']>, string]>([
    ['PENDING', 'lucide-clock'],
    ['SENT', 'lucide-check'],
    ['DELIVERED', 'lucide-check-check'],
    ['READ', 'lucide-check-check'],
    ['FAILED', 'lucide-circle-alert'],
  ])('renders the %s status icon for outbound messages', (status, iconClass) => {
    const messages: ConversationMessage[] = [
      { id: '1', direction: 'OUTBOUND', content: 'Message', timestamp: '10:00', status },
    ]
    const { container } = render(<ConversationThread messages={messages} onSend={() => {}} />)
    expect(container.querySelector(`.${iconClass}`)).toBeInTheDocument()
  })

  it('renders a different color for READ than for DELIVERED status', () => {
    const messages: ConversationMessage[] = [
      {
        id: '1',
        direction: 'OUTBOUND',
        content: 'Delivered',
        timestamp: '10:00',
        status: 'DELIVERED',
      },
      { id: '2', direction: 'OUTBOUND', content: 'Read', timestamp: '10:01', status: 'READ' },
    ]
    const { container } = render(<ConversationThread messages={messages} onSend={() => {}} />)
    const icons = container.querySelectorAll('.lucide-check-check')
    expect(icons).toHaveLength(2)
    expect(icons[0]!.className).not.toBe(icons[1]!.className)
  })

  it('does not render a status icon for inbound messages', () => {
    const messages: ConversationMessage[] = [
      { id: '1', direction: 'INBOUND', content: 'Hello', timestamp: '10:00', status: 'READ' },
    ]
    const { container } = render(<ConversationThread messages={messages} onSend={() => {}} />)
    expect(container.querySelector('.lucide-check-check')).not.toBeInTheDocument()
  })

  it.each<[NonNullable<ConversationMessage['mediaType']>, string]>([
    ['image', 'Image'],
    ['audio', 'Audio'],
    ['document', 'Document'],
  ])('renders a %s media indicator when mediaUrl is present', (mediaType, label) => {
    const messages: ConversationMessage[] = [
      {
        id: '1',
        direction: 'INBOUND',
        content: 'Check this out',
        timestamp: '10:00',
        mediaUrl: 'https://example.com/file',
        mediaType,
      },
    ]
    render(<ConversationThread messages={messages} onSend={() => {}} />)
    expect(screen.getByText(label)).toBeInTheDocument()
  })

  it('does not render a media indicator when mediaUrl is absent', () => {
    render(<ConversationThread messages={baseMessages} onSend={() => {}} />)
    expect(screen.queryByText('Image')).not.toBeInTheDocument()
    expect(screen.queryByText('Audio')).not.toBeInTheDocument()
    expect(screen.queryByText('Document')).not.toBeInTheDocument()
  })

  it('formats a Date timestamp', () => {
    const messages: ConversationMessage[] = [
      {
        id: '1',
        direction: 'INBOUND',
        content: 'Hello',
        timestamp: new Date('2026-01-01T10:05:00Z'),
      },
    ]
    render(<ConversationThread messages={messages} onSend={() => {}} />)
    expect(screen.getByText('Hello').closest('[data-direction]')?.textContent).toMatch(
      /\d{1,2}:\d{2}/,
    )
  })

  it('renders a string timestamp verbatim', () => {
    render(<ConversationThread messages={baseMessages} onSend={() => {}} />)
    expect(screen.getByText('10:00')).toBeInTheDocument()
  })

  it('calls onSend with the typed content and clears the composer', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    render(<ConversationThread messages={[]} onSend={onSend} />)
    const input = screen.getByRole('textbox')
    await user.type(input, 'New message')
    await user.click(screen.getByRole('button', { name: 'Send message' }))
    expect(onSend).toHaveBeenCalledWith('New message')
    expect(input).toHaveValue('')
  })

  it('sends the message when Enter is pressed in the composer', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    render(<ConversationThread messages={[]} onSend={onSend} />)
    const input = screen.getByRole('textbox')
    await user.type(input, 'Sent via Enter{Enter}')
    expect(onSend).toHaveBeenCalledWith('Sent via Enter')
  })

  it('disables the send button when the composer is empty or whitespace-only', async () => {
    const user = userEvent.setup()
    render(<ConversationThread messages={[]} onSend={() => {}} />)
    const sendButton = screen.getByRole('button', { name: 'Send message' })
    expect(sendButton).toBeDisabled()
    await user.type(screen.getByRole('textbox'), '   ')
    expect(sendButton).toBeDisabled()
  })

  it('disables the input and send button when composerDisabled is true', () => {
    render(<ConversationThread messages={[]} onSend={() => {}} composerDisabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Send message' })).toBeDisabled()
  })

  it('auto-scrolls to the bottom when a new message arrives and the user was near the bottom', () => {
    const { container, rerender } = render(
      <ConversationThread messages={baseMessages} onSend={() => {}} />,
    )
    const log = container.querySelector('[role="log"]') as HTMLDivElement
    Object.defineProperty(log, 'scrollHeight', { value: 500, configurable: true })
    Object.defineProperty(log, 'clientHeight', { value: 200, configurable: true })
    Object.defineProperty(log, 'scrollTop', { value: 300, writable: true, configurable: true })
    log.dispatchEvent(new Event('scroll'))

    const nextMessages: ConversationMessage[] = [
      ...baseMessages,
      { id: '3', direction: 'INBOUND', content: 'New one', timestamp: '10:02' },
    ]
    Object.defineProperty(log, 'scrollHeight', { value: 700, configurable: true })
    rerender(<ConversationThread messages={nextMessages} onSend={() => {}} />)

    expect(log.scrollTop).toBe(700)
  })

  it('does not force scroll to the bottom when the user had scrolled up', () => {
    const { container, rerender } = render(
      <ConversationThread messages={baseMessages} onSend={() => {}} />,
    )
    const log = container.querySelector('[role="log"]') as HTMLDivElement
    Object.defineProperty(log, 'scrollHeight', { value: 500, configurable: true })
    Object.defineProperty(log, 'clientHeight', { value: 200, configurable: true })
    Object.defineProperty(log, 'scrollTop', { value: 0, writable: true, configurable: true })
    log.dispatchEvent(new Event('scroll'))

    const nextMessages: ConversationMessage[] = [
      ...baseMessages,
      { id: '3', direction: 'INBOUND', content: 'New one', timestamp: '10:02' },
    ]
    Object.defineProperty(log, 'scrollHeight', { value: 700, configurable: true })
    rerender(<ConversationThread messages={nextMessages} onSend={() => {}} />)

    expect(log.scrollTop).toBe(0)
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<ConversationThread messages={baseMessages} onSend={() => {}} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('keeps the message history keyboard-scrollable', () => {
    render(<ConversationThread messages={baseMessages} onSend={() => {}} />)
    expect(screen.getByRole('log', { name: 'Conversation messages' })).toHaveAttribute(
      'tabindex',
      '0',
    )
  })

  it('renders the media indicator at full opacity so it keeps text contrast', () => {
    const messages: ConversationMessage[] = [
      {
        id: '1',
        direction: 'OUTBOUND',
        content: 'Photo',
        timestamp: '10:00',
        mediaUrl: 'https://example.com/photo.png',
        mediaType: 'image',
      },
    ]
    render(<ConversationThread messages={messages} onSend={() => {}} />)
    expect(screen.getByText('Image').parentElement).not.toHaveClass('opacity-80')
  })
})
