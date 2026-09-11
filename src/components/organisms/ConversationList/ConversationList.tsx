import type { ReactNode } from 'react'
import { cn } from '../../../utils/cn'
import { Icon } from '../../atoms/Icon/Icon'

interface ConversationListItem {
  id: string
  leadName: string
  channel: string
  lastMessagePreview: string
  timestamp: string | Date
  unreadCount?: number
}

interface ConversationListProps {
  conversations: ConversationListItem[]
  activeConversationId?: string
  onSelectConversation: (id: string) => void
  renderChannelIcon?: (channel: string) => ReactNode
  className?: string
}

function formatTimestamp(timestamp: string | Date): string {
  if (typeof timestamp === 'string') return timestamp
  return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(
    timestamp,
  )
}

export function ConversationList({
  conversations,
  activeConversationId,
  onSelectConversation,
  renderChannelIcon,
  className,
}: ConversationListProps) {
  return (
    // eslint-disable-next-line jsx-a11y/no-redundant-roles -- Tailwind Preflight strips the implicit list role from ul; role="list" restores it for Safari/VoiceOver.
    <ul role="list" className={cn('flex flex-col', className)}>
      {conversations.map((conversation) => {
        const isActive = conversation.id === activeConversationId
        return (
          <li key={conversation.id}>
            <button
              type="button"
              onClick={() => onSelectConversation(conversation.id)}
              aria-current={isActive ? 'true' : undefined}
              className={cn(
                'flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left transition-colors',
                isActive ? 'bg-muted' : 'hover:bg-muted',
              )}
            >
              <span className="flex-shrink-0 text-muted-foreground">
                {renderChannelIcon !== undefined ? (
                  renderChannelIcon(conversation.channel)
                ) : (
                  <Icon name="MessageSquare" size="md" aria-label={conversation.channel} />
                )}
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-sm font-semibold text-foreground">
                    {conversation.leadName}
                  </span>
                  <span className="flex-shrink-0 text-xs text-muted-foreground">
                    {formatTimestamp(conversation.timestamp)}
                  </span>
                </span>
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm text-muted-foreground">
                    {conversation.lastMessagePreview}
                  </span>
                  {renderChannelIcon === undefined && (
                    <span className="flex-shrink-0 text-xs text-muted-foreground">
                      {conversation.channel}
                    </span>
                  )}
                </span>
              </span>

              {conversation.unreadCount !== undefined && conversation.unreadCount > 0 && (
                <span className="flex-shrink-0 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                  {conversation.unreadCount}
                </span>
              )}
            </button>
          </li>
        )
      })}
    </ul>
  )
}

export type { ConversationListProps, ConversationListItem }
