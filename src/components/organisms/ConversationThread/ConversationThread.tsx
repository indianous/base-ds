import { useLayoutEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { cn } from '../../../utils/cn'
import { Icon } from '../../atoms/Icon/Icon'
import type { IconName } from '../../atoms/Icon/Icon'
import { Input } from '../../atoms/Input/Input'
import { Button } from '../../atoms/Button/Button'

type MessageDirection = 'INBOUND' | 'OUTBOUND'
type MessageStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED'
type MessageMediaType = 'image' | 'audio' | 'document'

interface ConversationMessage {
  id: string
  direction: MessageDirection
  content: string
  timestamp: string | Date
  status?: MessageStatus
  mediaUrl?: string
  mediaType?: MessageMediaType
}

interface ConversationThreadProps {
  messages: ConversationMessage[]
  onSend: (content: string) => void
  composerPlaceholder?: string
  composerDisabled?: boolean
  className?: string
}

const SCROLL_BOTTOM_THRESHOLD = 40

const statusIconMap: Record<MessageStatus, IconName> = {
  PENDING: 'Clock',
  SENT: 'Check',
  DELIVERED: 'CheckCheck',
  READ: 'CheckCheck',
  FAILED: 'AlertCircle',
}

const statusColorMap: Record<MessageStatus, string> = {
  PENDING: 'text-muted-foreground',
  SENT: 'text-muted-foreground',
  DELIVERED: 'text-muted-foreground',
  READ: 'text-primary',
  FAILED: 'text-destructive',
}

const mediaIconMap: Record<MessageMediaType, IconName> = {
  image: 'Image',
  audio: 'Music',
  document: 'FileText',
}

const mediaLabelMap: Record<MessageMediaType, string> = {
  image: 'Image',
  audio: 'Audio',
  document: 'Document',
}

function formatTimestamp(timestamp: string | Date): string {
  if (typeof timestamp === 'string') return timestamp
  return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(
    timestamp,
  )
}

export function ConversationThread({
  messages,
  onSend,
  composerPlaceholder = 'Type a message',
  composerDisabled = false,
  className,
}: ConversationThreadProps) {
  const [draft, setDraft] = useState('')
  const listRef = useRef<HTMLDivElement>(null)
  const wasNearBottomRef = useRef(true)
  const previousLengthRef = useRef(messages.length)

  useLayoutEffect(() => {
    const el = listRef.current
    if (el && messages.length > previousLengthRef.current && wasNearBottomRef.current) {
      el.scrollTop = el.scrollHeight
    }
    previousLengthRef.current = messages.length
  }, [messages.length])

  const handleScroll = () => {
    const el = listRef.current
    if (!el) return
    wasNearBottomRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < SCROLL_BOTTOM_THRESHOLD
  }

  const trimmed = draft.trim()

  const handleSend = () => {
    if (trimmed.length === 0 || composerDisabled) return
    onSend(trimmed)
    setDraft('')
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleSend()
    }
  }

  return (
    <div className={cn('flex flex-col h-full min-h-0', className)}>
      <div
        ref={listRef}
        onScroll={handleScroll}
        role="log"
        aria-label="Conversation messages"
        className="flex flex-1 min-h-0 flex-col gap-2 overflow-y-auto p-4"
      >
        {messages.map((message) => {
          const isOutbound = message.direction === 'OUTBOUND'
          return (
            <div
              key={message.id}
              data-direction={message.direction}
              className={cn('flex flex-col', isOutbound ? 'items-end' : 'items-start')}
            >
              <div
                className={cn(
                  'max-w-[75%] rounded-lg px-3 py-2 text-sm',
                  isOutbound ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground',
                )}
              >
                <p>{message.content}</p>
                {message.mediaUrl !== undefined && message.mediaType !== undefined && (
                  <div className="mt-1 flex items-center gap-1 text-xs opacity-80">
                    <Icon name={mediaIconMap[message.mediaType]} size="sm" />
                    <span>{mediaLabelMap[message.mediaType]}</span>
                  </div>
                )}
              </div>
              <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <span>{formatTimestamp(message.timestamp)}</span>
                {isOutbound && message.status !== undefined && (
                  <Icon
                    name={statusIconMap[message.status]}
                    size="sm"
                    className={statusColorMap[message.status]}
                  />
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-2 border-t border-border p-3">
        <Input
          id="conversation-thread-composer"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={composerPlaceholder}
          disabled={composerDisabled}
          aria-label={composerPlaceholder}
          className="flex-1"
        />
        <Button
          onClick={handleSend}
          disabled={composerDisabled || trimmed.length === 0}
          aria-label="Send message"
          iconOnly
        >
          <Icon name="Send" size="sm" />
        </Button>
      </div>
    </div>
  )
}

export type {
  ConversationThreadProps,
  ConversationMessage,
  MessageDirection,
  MessageStatus,
  MessageMediaType,
}
