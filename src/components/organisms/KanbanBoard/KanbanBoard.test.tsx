import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, render, screen, within, fireEvent } from '@testing-library/react'
import { axe } from 'jest-axe'
import { KanbanBoard, computeCardMove } from './KanbanBoard'
import type { KanbanColumn } from './KanbanBoard'

interface LeadCard {
  id: string
  name: string
}

function buildColumns(): KanbanColumn<LeadCard>[] {
  return [
    {
      id: 'new',
      title: 'Novo',
      cards: [
        { id: 'lead-1', name: 'Ana Souza' },
        { id: 'lead-2', name: 'Bruno Lima' },
      ],
    },
    {
      id: 'contacted',
      title: 'Contatado',
      cards: [],
    },
  ]
}

function renderCard(card: LeadCard) {
  return <span>{card.name}</span>
}

describe('KanbanBoard', () => {
  it('renders each column title and its card count', () => {
    render(<KanbanBoard columns={buildColumns()} renderCard={renderCard} onCardMove={() => {}} />)

    expect(screen.getByText('Novo')).toBeInTheDocument()
    expect(screen.getByText('Contatado')).toBeInTheDocument()

    const newColumn = screen.getByTestId('kanban-column-new')
    expect(within(newColumn).getByText('2')).toBeInTheDocument()

    const contactedColumn = screen.getByTestId('kanban-column-contacted')
    expect(within(contactedColumn).getByText('0')).toBeInTheDocument()
  })

  it('renders card content via renderCard inside the matching column', () => {
    render(<KanbanBoard columns={buildColumns()} renderCard={renderCard} onCardMove={() => {}} />)

    const newColumn = screen.getByTestId('kanban-column-new')
    expect(within(newColumn).getByText('Ana Souza')).toBeInTheDocument()
    expect(within(newColumn).getByText('Bruno Lima')).toBeInTheDocument()

    const contactedColumn = screen.getByTestId('kanban-column-contacted')
    expect(within(contactedColumn).queryByText('Ana Souza')).not.toBeInTheDocument()
  })

  it('renders an empty column without crashing', () => {
    render(<KanbanBoard columns={buildColumns()} renderCard={renderCard} onCardMove={() => {}} />)

    const contactedColumn = screen.getByTestId('kanban-column-contacted')
    expect(within(contactedColumn).getByText('0')).toBeInTheDocument()
    expect(within(contactedColumn).queryByRole('button')).not.toBeInTheDocument()
  })

  it('gives each drag handle an accessible, focusable button with the default label', () => {
    render(<KanbanBoard columns={buildColumns()} renderCard={renderCard} onCardMove={() => {}} />)

    const handle = screen.getByRole('button', { name: 'Card lead-1' })
    expect(handle).toBeInTheDocument()
    handle.focus()
    expect(handle).toHaveFocus()
  })

  it('uses getCardAriaLabel to customize the drag handle accessible name', () => {
    render(
      <KanbanBoard
        columns={buildColumns()}
        renderCard={renderCard}
        onCardMove={() => {}}
        getCardAriaLabel={(card) => `Move ${card.name}`}
      />,
    )

    expect(screen.getByRole('button', { name: 'Move Ana Souza' })).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <KanbanBoard columns={buildColumns()} renderCard={renderCard} onCardMove={vi.fn()} />,
    )

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  describe('keyboard drag interaction', () => {
    let rects: WeakMap<Element, DOMRect>
    let order: number

    beforeEach(() => {
      rects = new WeakMap()
      order = 0
      vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (
        this: Element,
      ) {
        if (!rects.has(this)) {
          const top = order * 60
          order += 1
          rects.set(this, {
            top,
            bottom: top + 50,
            left: 0,
            right: 250,
            width: 250,
            height: 50,
            x: 0,
            y: top,
            toJSON: () => ({}),
          } as DOMRect)
        }
        return rects.get(this)!
      })
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('does not throw when a drag handle receives keyboard activation', () => {
      render(<KanbanBoard columns={buildColumns()} renderCard={renderCard} onCardMove={() => {}} />)

      const handle = screen.getByRole('button', { name: 'Card lead-1' })
      handle.focus()

      expect(() => {
        fireEvent.keyDown(handle, { code: 'Space', key: ' ' })
        fireEvent.keyDown(handle, { code: 'ArrowDown', key: 'ArrowDown' })
        fireEvent.keyDown(handle, { code: 'Space', key: ' ' })
      }).not.toThrow()
    })
  })
})

describe('computeCardMove', () => {
  function threeCardColumn(): KanbanColumn<LeadCard>[] {
    return [
      {
        id: 'new',
        title: 'Novo',
        cards: [
          { id: 'lead-1', name: 'Ana' },
          { id: 'lead-2', name: 'Bruno' },
          { id: 'lead-3', name: 'Carla' },
        ],
      },
      { id: 'contacted', title: 'Contatado', cards: [] },
    ]
  }

  it('reorders a card within the same column', () => {
    const result = computeCardMove(threeCardColumn(), 'lead-1', 'new', 'new', 2)
    const newColumn = result.find((c) => c.id === 'new')!

    expect(newColumn.cards.map((c) => c.id)).toEqual(['lead-2', 'lead-3', 'lead-1'])
  })

  it('moves a card to another column at a given index', () => {
    const columns = threeCardColumn()
    columns[1]!.cards = [{ id: 'lead-4', name: 'Diego' }]

    const result = computeCardMove(columns, 'lead-2', 'new', 'contacted', 0)

    const sourceColumn = result.find((c) => c.id === 'new')!
    const targetColumn = result.find((c) => c.id === 'contacted')!

    expect(sourceColumn.cards.map((c) => c.id)).toEqual(['lead-1', 'lead-3'])
    expect(targetColumn.cards.map((c) => c.id)).toEqual(['lead-2', 'lead-4'])
  })

  it('moves a card into an empty column', () => {
    const result = computeCardMove(threeCardColumn(), 'lead-3', 'new', 'contacted', 0)
    const targetColumn = result.find((c) => c.id === 'contacted')!

    expect(targetColumn.cards.map((c) => c.id)).toEqual(['lead-3'])
  })
})

describe('KanbanBoard custom labels', () => {
  it('uses cardCountLabel with the number of cards for each column count', () => {
    render(
      <KanbanBoard
        columns={buildColumns()}
        renderCard={renderCard}
        onCardMove={() => {}}
        cardCountLabel={(count) => `${count} ${count === 1 ? 'cartão' : 'cartões'}`}
      />,
    )
    expect(screen.getByLabelText('2 cartões')).toBeInTheDocument()
    expect(screen.getByLabelText('0 cartões')).toBeInTheDocument()
  })
})

describe('KanbanBoard drag and drop texts', () => {
  const space = { code: 'Space', key: ' ' }
  const escape = { code: 'Escape', key: 'Escape' }
  const liveRegion = () => document.querySelector('[aria-live]')?.textContent ?? ''

  // The keyboard sensor activates on the next tick, so each key press gets its own act().
  async function press(target: Element | Document, key: typeof space) {
    await act(async () => {
      fireEvent.keyDown(target, key)
      await new Promise((resolve) => setTimeout(resolve, 20))
    })
  }

  function renderBoard(props: Partial<Parameters<typeof KanbanBoard<LeadCard>>[0]> = {}) {
    render(
      <KanbanBoard
        columns={buildColumns()}
        renderCard={renderCard}
        onCardMove={() => {}}
        getCardAriaLabel={(card) => `Mover ${card.name}`}
        {...props}
      />,
    )
    return screen.getByRole('button', { name: 'Mover Ana Souza' })
  }

  const ana = expect.objectContaining({ id: 'lead-1', name: 'Ana Souza' })

  it('uses dragInstructions for the keyboard instructions of each card', () => {
    const handle = renderBoard({ dragInstructions: 'Pressione espaço para pegar o card.' })
    expect(handle).toHaveAccessibleDescription('Pressione espaço para pegar o card.')
  })

  it('uses cardRoleDescription for the aria-roledescription of each card', () => {
    renderBoard({ cardRoleDescription: 'arrastável' })
    for (const handle of screen.getAllByRole('button')) {
      expect(handle).toHaveAttribute('aria-roledescription', 'arrastável')
    }
  })

  it('calls dragStartAnnouncement and dragOverAnnouncement with the card, column and position', async () => {
    const dragStartAnnouncement = vi.fn(() => 'pego')
    const dragOverAnnouncement = vi.fn(() => 'Ana Souza sobre Novo, posição 1.')
    const handle = renderBoard({ dragStartAnnouncement, dragOverAnnouncement })
    handle.focus()
    await press(handle, space)
    expect(dragStartAnnouncement).toHaveBeenCalledWith(ana, 'Novo')
    expect(dragOverAnnouncement).toHaveBeenCalledWith(ana, 'Novo', 1)
    expect(liveRegion()).toBe('Ana Souza sobre Novo, posição 1.')
  })

  it('uses dragEndAnnouncement with the card, column and position when the card is dropped', async () => {
    const dragEndAnnouncement = vi.fn(
      (card: LeadCard, column: string, position: number) =>
        `${card.name} solto em ${column}, posição ${position}.`,
    )
    const handle = renderBoard({ dragEndAnnouncement })
    handle.focus()
    await press(handle, space)
    await press(handle, space)
    expect(dragEndAnnouncement).toHaveBeenCalledWith(ana, 'Novo', 1)
    expect(liveRegion()).toBe('Ana Souza solto em Novo, posição 1.')
  })

  it('uses dragCancelAnnouncement with the column the card returns to', async () => {
    const handle = renderBoard({
      dragCancelAnnouncement: (card, column) =>
        `Movimento cancelado. ${card.name} voltou para ${column}.`,
    })
    handle.focus()
    await press(handle, space)
    await press(document, escape)
    expect(liveRegion()).toBe('Movimento cancelado. Ana Souza voltou para Novo.')
  })

  it('announces with the card label and column by default, not the card id', async () => {
    render(<KanbanBoard columns={buildColumns()} renderCard={renderCard} onCardMove={() => {}} />)
    const handle = screen.getByRole('button', { name: 'Card lead-1' })
    handle.focus()
    await press(handle, space)
    expect(liveRegion()).toBe('Card lead-1 is over Novo, position 1.')
    await press(handle, space)
    expect(liveRegion()).toBe('Card lead-1 was dropped in Novo, position 1.')
  })

  it('keeps the default keyboard instructions and role description', () => {
    render(<KanbanBoard columns={buildColumns()} renderCard={renderCard} onCardMove={() => {}} />)
    const handle = screen.getByRole('button', { name: 'Card lead-1' })
    expect(handle).toHaveAttribute('aria-roledescription', 'sortable')
    expect(handle).toHaveAccessibleDescription(/To pick up a draggable item, press the space bar/)
  })
})
