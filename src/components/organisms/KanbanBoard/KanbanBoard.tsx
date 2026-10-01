import type { ReactNode } from 'react'
import { useMemo, useRef, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { Announcements, DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { cn } from '../../../utils/cn'

export interface KanbanColumn<TCard extends { id: string }> {
  id: string
  title: string
  cards: TCard[]
}

export interface KanbanBoardProps<TCard extends { id: string }> {
  columns: KanbanColumn<TCard>[]
  renderCard: (card: TCard) => ReactNode
  onCardMove: (cardId: string, fromColumnId: string, toColumnId: string, newIndex: number) => void
  getCardAriaLabel?: (card: TCard) => string
  columnWidth?: string
  className?: string
  /** `aria-label` of each column's card count, from the number of cards. */
  cardCountLabel?: (count: number) => string
  /** Keyboard instructions read for each card's drag handle. */
  dragInstructions?: string
  /** `aria-roledescription` of each card's drag handle. */
  cardRoleDescription?: string
  /** Announcement when a card is picked up, from the card and its column title. */
  dragStartAnnouncement?: (card: TCard, column: string) => string
  /** Announcement while a card is over a column, from the card, column title and position (from 1). */
  dragOverAnnouncement?: (card: TCard, column: string, position: number) => string
  /** Announcement when a card is dropped, from the card, column title and position (from 1). */
  dragEndAnnouncement?: (card: TCard, column: string, position: number) => string
  /** Announcement when a drag is cancelled, from the card and the column it stays in. */
  dragCancelAnnouncement?: (card: TCard, column: string) => string
}

const defaultDragInstructions =
  'To pick up a draggable item, press the space bar. While dragging, use the arrow keys to move the item. Press space again to drop the item in its new position, or press escape to cancel.'

// Where the active card lands when dropped over `overId` (a card or a column): the column and
// the index among the column's other cards. While dragging, the card may already sit in the target
// column, so it doesn't count itself (dropping into a column that was empty gives index 0).
function resolveDropTarget<TCard extends { id: string }>(
  columns: KanbanColumn<TCard>[],
  activeId: string,
  overId: string,
): { column: KanbanColumn<TCard>; index: number } | undefined {
  const columnId = findContainerId(columns, overId) ?? overId
  const column = columns.find((c) => c.id === columnId)
  if (!column) return undefined
  const others = column.cards.filter((card) => card.id !== activeId).length
  const overIndex = column.cards.findIndex((card) => card.id === overId)
  return { column, index: overIndex >= 0 ? Math.min(overIndex, others) : others }
}

export function computeCardMove<TCard extends { id: string }>(
  columns: KanbanColumn<TCard>[],
  cardId: string,
  fromColumnId: string,
  toColumnId: string,
  newIndex: number,
): KanbanColumn<TCard>[] {
  const fromColumn = columns.find((column) => column.id === fromColumnId)
  const card = fromColumn?.cards.find((c) => c.id === cardId)
  if (!fromColumn || !card) return columns

  return columns.map((column) => {
    if (column.id === fromColumnId && column.id === toColumnId) {
      const withoutCard = column.cards.filter((c) => c.id !== cardId)
      const clampedIndex = Math.min(newIndex, withoutCard.length)
      return {
        ...column,
        cards: [...withoutCard.slice(0, clampedIndex), card, ...withoutCard.slice(clampedIndex)],
      }
    }

    if (column.id === fromColumnId) {
      return { ...column, cards: column.cards.filter((c) => c.id !== cardId) }
    }

    if (column.id === toColumnId) {
      const clampedIndex = Math.min(newIndex, column.cards.length)
      return {
        ...column,
        cards: [...column.cards.slice(0, clampedIndex), card, ...column.cards.slice(clampedIndex)],
      }
    }

    return column
  })
}

function findContainerId<TCard extends { id: string }>(
  columns: KanbanColumn<TCard>[],
  id: string,
): string | undefined {
  if (columns.some((column) => column.id === id)) return id
  return columns.find((column) => column.cards.some((card) => card.id === id))?.id
}

interface KanbanCardViewProps<TCard extends { id: string }> {
  card: TCard
  renderCard: (card: TCard) => ReactNode
  ariaLabel: string
  roleDescription: string
}

function KanbanCardView<TCard extends { id: string }>({
  card,
  renderCard,
  ariaLabel,
  roleDescription,
}: KanbanCardViewProps<TCard>) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    attributes: { roleDescription },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-start gap-2 rounded-md bg-background p-2 shadow-sm',
        isDragging && 'opacity-50',
      )}
    >
      <button
        type="button"
        aria-label={ariaLabel}
        className="mt-0.5 flex-shrink-0 cursor-grab text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring rounded"
        {...attributes}
        {...listeners}
      >
        <GripVertical aria-hidden="true" size={16} />
      </button>
      <div className="min-w-0 flex-1">{renderCard(card)}</div>
    </div>
  )
}

interface KanbanColumnViewProps<TCard extends { id: string }> {
  column: KanbanColumn<TCard>
  renderCard: (card: TCard) => ReactNode
  getCardAriaLabel: (card: TCard) => string
  columnWidth: string
  cardCountLabel: (count: number) => string
  cardRoleDescription: string
}

function KanbanColumnView<TCard extends { id: string }>({
  column,
  renderCard,
  getCardAriaLabel,
  columnWidth,
  cardCountLabel,
  cardRoleDescription,
}: KanbanColumnViewProps<TCard>) {
  const { setNodeRef } = useDroppable({ id: column.id })

  return (
    <div
      ref={setNodeRef}
      data-testid={`kanban-column-${column.id}`}
      className={cn('flex flex-shrink-0 flex-col rounded-lg bg-muted p-2', columnWidth)}
    >
      <div className="flex items-center justify-between px-2 py-1">
        <span className="text-sm font-semibold text-foreground">{column.title}</span>
        <span
          aria-label={cardCountLabel(column.cards.length)}
          className="rounded-full bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground"
        >
          {column.cards.length}
        </span>
      </div>

      <SortableContext
        items={column.cards.map((card) => card.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex min-h-8 flex-col gap-2 p-1">
          {column.cards.map((card) => (
            <KanbanCardView
              key={card.id}
              card={card}
              renderCard={renderCard}
              ariaLabel={getCardAriaLabel(card)}
              roleDescription={cardRoleDescription}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}

export function KanbanBoard<TCard extends { id: string }>({
  columns,
  renderCard,
  onCardMove,
  getCardAriaLabel = (card) => `Card ${card.id}`,
  columnWidth = 'w-72',
  className,
  cardCountLabel = (count) => `${count} cards`,
  dragInstructions = defaultDragInstructions,
  cardRoleDescription = 'sortable',
  dragStartAnnouncement = (card, column) => `Picked up ${getCardAriaLabel(card)} in ${column}.`,
  dragOverAnnouncement = (card, column, position) =>
    `${getCardAriaLabel(card)} is over ${column}, position ${position}.`,
  dragEndAnnouncement = (card, column, position) =>
    `${getCardAriaLabel(card)} was dropped in ${column}, position ${position}.`,
  dragCancelAnnouncement = (card, column) =>
    `Dragging was cancelled. ${getCardAriaLabel(card)} returned to ${column}.`,
}: KanbanBoardProps<TCard>) {
  const [items, setItems] = useState(columns)
  const [syncedColumns, setSyncedColumns] = useState(columns)
  const [activeCard, setActiveCard] = useState<TCard | null>(null)
  const dragOrigin = useRef<{ cardId: string; fromColumnId: string } | null>(null)

  if (columns !== syncedColumns) {
    setSyncedColumns(columns)
    setItems(columns)
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragStart(event: DragStartEvent) {
    const cardId = String(event.active.id)
    const fromColumnId = findContainerId(items, cardId)
    if (!fromColumnId) return

    dragOrigin.current = { cardId, fromColumnId }
    const column = items.find((c) => c.id === fromColumnId)
    setActiveCard(column?.cards.find((card) => card.id === cardId) ?? null)
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return

    const activeId = String(active.id)
    const overId = String(over.id)
    const activeContainer = findContainerId(items, activeId)
    const overContainer = findContainerId(items, overId)
    if (!activeContainer || !overContainer || activeContainer === overContainer) return

    setItems((prev) => {
      const overColumn = prev.find((c) => c.id === overContainer)
      if (!overColumn) return prev
      const overIndex = overColumn.cards.findIndex((card) => card.id === overId)
      const newIndex = overIndex >= 0 ? overIndex : overColumn.cards.length
      return computeCardMove(prev, activeId, activeContainer, overContainer, newIndex)
    })
  }

  function handleDragEnd(event: DragEndEvent) {
    const { over } = event
    const origin = dragOrigin.current
    dragOrigin.current = null
    setActiveCard(null)
    if (!over || !origin) return

    const target = resolveDropTarget(items, origin.cardId, String(over.id))
    const toColumnId = target?.column.id ?? String(over.id)
    const newIndex = target?.index ?? 0

    onCardMove(origin.cardId, origin.fromColumnId, toColumnId, newIndex)
  }

  const announcements = useMemo<Announcements>(() => {
    const cardAndColumn = (cardId: string | number) => {
      const columnId = findContainerId(items, String(cardId))
      const column = items.find((c) => c.id === columnId)
      const card = column?.cards.find((c) => c.id === String(cardId))
      return card && column ? { card, column } : undefined
    }
    const dropPosition = (activeId: string | number, overId: string | number) => {
      const target = resolveDropTarget(items, String(activeId), String(overId))
      return target && { title: target.column.title, position: target.index + 1 }
    }

    return {
      onDragStart({ active }) {
        const found = cardAndColumn(active.id)
        return found && dragStartAnnouncement(found.card, found.column.title)
      },
      onDragOver({ active, over }) {
        const found = cardAndColumn(active.id)
        if (!found) return undefined
        // `closestCorners` always finds a column, so `over` is only missing defensively.
        if (!over) return undefined
        const target = dropPosition(active.id, over.id)
        return target && dragOverAnnouncement(found.card, target.title, target.position)
      },
      onDragEnd({ active, over }) {
        const found = cardAndColumn(active.id)
        if (!found) return undefined
        // Dropped with no column under it (defensive, see onDragOver): nothing moves, like a cancel.
        if (!over) return dragCancelAnnouncement(found.card, found.column.title)
        const target = dropPosition(active.id, over.id)
        return target && dragEndAnnouncement(found.card, target.title, target.position)
      },
      onDragCancel({ active }) {
        const found = cardAndColumn(active.id)
        return found && dragCancelAnnouncement(found.card, found.column.title)
      },
    }
  }, [
    items,
    dragStartAnnouncement,
    dragOverAnnouncement,
    dragEndAnnouncement,
    dragCancelAnnouncement,
  ])

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      accessibility={{
        announcements,
        screenReaderInstructions: { draggable: dragInstructions },
      }}
    >
      <div className={cn('flex gap-4 overflow-x-auto p-1', className)}>
        {items.map((column) => (
          <KanbanColumnView
            key={column.id}
            column={column}
            renderCard={renderCard}
            getCardAriaLabel={getCardAriaLabel}
            columnWidth={columnWidth}
            cardCountLabel={cardCountLabel}
            cardRoleDescription={cardRoleDescription}
          />
        ))}
      </div>

      <DragOverlay>
        {activeCard ? (
          <div className="flex items-start gap-2 rounded-md bg-background p-2 shadow-lg">
            <GripVertical aria-hidden="true" size={16} className="mt-0.5 text-muted-foreground" />
            <div className="min-w-0 flex-1">{renderCard(activeCard)}</div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
