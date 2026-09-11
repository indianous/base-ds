import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
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
