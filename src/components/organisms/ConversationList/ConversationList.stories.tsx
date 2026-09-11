import type { Meta, StoryObj } from '@storybook/react'
import { ConversationList } from './ConversationList'
import type { ConversationListItem } from './ConversationList'

const meta: Meta<typeof ConversationList> = {
  component: ConversationList,
  title: 'Organisms/ConversationList',
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ConversationList>

const conversations: ConversationListItem[] = [
  {
    id: '1',
    leadName: 'Maria Silva',
    channel: 'whatsapp',
    lastMessagePreview: 'Can we talk tomorrow morning?',
    timestamp: '09:30',
    unreadCount: 2,
  },
  {
    id: '2',
    leadName: 'João Costa',
    channel: 'telegram',
    lastMessagePreview: 'Thanks for the info!',
    timestamp: '08:15',
  },
  {
    id: '3',
    leadName: 'Ana Pereira',
    channel: 'whatsapp',
    lastMessagePreview: 'I would like to schedule a visit.',
    timestamp: 'Yesterday',
    unreadCount: 5,
  },
]

export const Default: Story = {
  args: {
    conversations,
    activeConversationId: '2',
    onSelectConversation: (id: string) => console.log('select', id),
  },
}
