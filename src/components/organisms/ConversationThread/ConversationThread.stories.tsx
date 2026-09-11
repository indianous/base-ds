import type { Meta, StoryObj } from '@storybook/react'
import { ConversationThread } from './ConversationThread'
import type { ConversationMessage } from './ConversationThread'

const meta: Meta<typeof ConversationThread> = {
  component: ConversationThread,
  title: 'Organisms/ConversationThread',
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ConversationThread>

const messages: ConversationMessage[] = [
  {
    id: '1',
    direction: 'INBOUND',
    content: 'Hi, I saw your ad about the apartment.',
    timestamp: '09:12',
  },
  {
    id: '2',
    direction: 'OUTBOUND',
    content: 'Hello! Yes, it is still available.',
    timestamp: '09:13',
    status: 'READ',
  },
  {
    id: '3',
    direction: 'INBOUND',
    content: 'Great, could you send me some photos?',
    timestamp: '09:14',
  },
  {
    id: '4',
    direction: 'OUTBOUND',
    content: 'Sure, here it is:',
    timestamp: '09:15',
    status: 'DELIVERED',
    mediaUrl: 'https://example.com/photo.jpg',
    mediaType: 'image',
  },
  {
    id: '5',
    direction: 'OUTBOUND',
    content: 'Let me know if you want to schedule a visit.',
    timestamp: '09:16',
    status: 'SENT',
  },
  { id: '6', direction: 'OUTBOUND', content: 'Still there?', timestamp: '09:20', status: 'FAILED' },
]

export const Default: Story = {
  args: {
    messages,
    onSend: (content: string) => console.log('send', content),
  },
  render: (args) => (
    <div style={{ height: 480 }}>
      <ConversationThread {...args} />
    </div>
  ),
}

export const Disabled: Story = {
  args: {
    messages,
    onSend: (content: string) => console.log('send', content),
    composerDisabled: true,
    composerPlaceholder: 'This conversation is closed',
  },
  render: (args) => (
    <div style={{ height: 480 }}>
      <ConversationThread {...args} />
    </div>
  ),
}
