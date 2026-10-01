import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { KanbanBoard } from './KanbanBoard'
import type { KanbanColumn } from './KanbanBoard'
import { Avatar } from '../../atoms/Avatar/Avatar'
import { Badge } from '../../atoms/Badge/Badge'

interface LeadCard {
  id: string
  name: string
  type: 'Contato direto' | 'Busca local'
  channel: string
  score: number
}

function LeadCardContent({ card }: { card: LeadCard }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Avatar alt={card.name} fallback={card.name.charAt(0)} size="sm" />
        <span className="text-sm font-medium text-foreground">{card.name}</span>
      </div>
      <div className="flex flex-wrap items-center gap-1">
        <Badge size="sm">{card.type}</Badge>
        <Badge size="sm" variant="info">
          {card.channel}
        </Badge>
        <Badge size="sm" variant={card.score >= 70 ? 'success' : 'warning'}>
          Score {card.score}
        </Badge>
      </div>
    </div>
  )
}

const meta: Meta<typeof KanbanBoard> = {
  component: KanbanBoard,
  title: 'Organisms/KanbanBoard',
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof KanbanBoard<LeadCard>>

function baseColumns(): KanbanColumn<LeadCard>[] {
  return [
    {
      id: 'new',
      title: 'Novo',
      cards: [
        { id: 'lead-1', name: 'Ana Souza', type: 'Contato direto', channel: 'WhatsApp', score: 82 },
        { id: 'lead-2', name: 'Bruno Lima', type: 'Busca local', channel: 'Telegram', score: 45 },
      ],
    },
    {
      id: 'contacted',
      title: 'Contatado',
      cards: [
        {
          id: 'lead-3',
          name: 'Carla Nunes',
          type: 'Contato direto',
          channel: 'WhatsApp',
          score: 91,
        },
      ],
    },
    {
      id: 'proposal',
      title: 'Proposta enviada',
      cards: [],
    },
    {
      id: 'negotiation',
      title: 'Em negociação',
      cards: [
        { id: 'lead-4', name: 'Diego Alves', type: 'Busca local', channel: 'WhatsApp', score: 63 },
      ],
    },
    {
      id: 'closed',
      title: 'Fechado',
      cards: [],
    },
    {
      id: 'lost',
      title: 'Perdido',
      cards: [],
    },
  ]
}

export const Default: Story = {
  render: function DefaultStory() {
    const [columns, setColumns] = useState(baseColumns)

    return (
      <KanbanBoard
        columns={columns}
        renderCard={(card) => <LeadCardContent card={card} />}
        getCardAriaLabel={(card) => `Move lead ${card.name}`}
        onCardMove={(cardId, fromColumnId, toColumnId, newIndex) => {
          setColumns((prev) => {
            const from = prev.find((c) => c.id === fromColumnId)
            const card = from?.cards.find((c) => c.id === cardId)
            if (!from || !card) return prev

            return prev.map((column) => {
              if (column.id === fromColumnId && column.id === toColumnId) {
                const without = column.cards.filter((c) => c.id !== cardId)
                return {
                  ...column,
                  cards: [...without.slice(0, newIndex), card, ...without.slice(newIndex)],
                }
              }
              if (column.id === fromColumnId) {
                return { ...column, cards: column.cards.filter((c) => c.id !== cardId) }
              }
              if (column.id === toColumnId) {
                return {
                  ...column,
                  cards: [
                    ...column.cards.slice(0, newIndex),
                    card,
                    ...column.cards.slice(newIndex),
                  ],
                }
              }
              return column
            })
          })
        }}
      />
    )
  },
}

export const EmptyColumn: Story = {
  args: {
    columns: [
      { id: 'new', title: 'Novo', cards: [] },
      {
        id: 'contacted',
        title: 'Contatado',
        cards: [
          {
            id: 'lead-1',
            name: 'Ana Souza',
            type: 'Contato direto',
            channel: 'WhatsApp',
            score: 82,
          },
        ],
      },
    ],
    renderCard: (card) => <LeadCardContent card={card} />,
    onCardMove: () => {},
  },
}

export const ManyCardsHorizontalScroll: Story = {
  args: {
    columns: Array.from({ length: 6 }, (_, columnIndex) => ({
      id: `column-${columnIndex}`,
      title: `Coluna ${columnIndex + 1}`,
      cards: Array.from({ length: 8 }, (_, cardIndex) => ({
        id: `card-${columnIndex}-${cardIndex}`,
        name: `Lead ${columnIndex}-${cardIndex}`,
        type: cardIndex % 2 === 0 ? 'Contato direto' : 'Busca local',
        channel: cardIndex % 2 === 0 ? 'WhatsApp' : 'Telegram',
        score: 40 + cardIndex * 5,
      })),
    })),
    columnWidth: 'w-64',
    renderCard: (card) => <LeadCardContent card={card} />,
    onCardMove: () => {},
  },
}

export const CustomLabels: Story = {
  args: {
    ...EmptyColumn.args,
    getCardAriaLabel: (card) => `Mover lead ${card.name}`,
    cardCountLabel: (count) => `${count} ${count === 1 ? 'cartão' : 'cartões'}`,
    dragInstructions:
      'Para pegar um card, pressione espaço. Use as setas para mover e espaço de novo para soltar, ou Esc para cancelar.',
    cardRoleDescription: 'arrastável',
    dragStartAnnouncement: (card, column) => `${card.name} pego em ${column}.`,
    dragOverAnnouncement: (card, column, position) =>
      `${card.name} sobre ${column}, posição ${position}.`,
    dragEndAnnouncement: (card, column, position) =>
      `${card.name} solto em ${column}, posição ${position}.`,
    dragCancelAnnouncement: (card, column) =>
      `Movimento cancelado. ${card.name} voltou para ${column}.`,
  },
}

// Moving a card to another column by keyboard needs real layout (dnd-kit measures the columns),
// so this runs here, in Chromium, rather than in the jsdom unit tests.
export const KeyboardMoveAnnouncement: Story = {
  args: { ...CustomLabels.args, onCardMove: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const handle = canvas.getByRole('button', { name: 'Mover lead Ana Souza' })
    const announcement = () => document.querySelector('[aria-live]')?.textContent
    handle.focus()
    // Each key waits for its announcement: dnd-kit handles the next key only once it's ready.
    await userEvent.keyboard(' ')
    await waitFor(() => expect(announcement()).toBe('Ana Souza sobre Contatado, posição 1.'))
    // The first arrow can stop on the card's own column (its edge is to the card's left).
    for (let i = 0; i < 3 && announcement() !== 'Ana Souza sobre Novo, posição 1.'; i++) {
      await userEvent.keyboard('{ArrowLeft}')
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
    await expect(announcement()).toBe('Ana Souza sobre Novo, posição 1.')
    await userEvent.keyboard(' ')
    await waitFor(() => expect(announcement()).toBe('Ana Souza solto em Novo, posição 1.'))

    await expect(args.onCardMove).toHaveBeenCalledWith('lead-1', 'contacted', 'new', 0)
  },
}
