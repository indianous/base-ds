import type { ReactNode } from 'react'
import { useRef, useState } from 'react'
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
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core'
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
}

function KanbanCardView<TCard extends { id: string }>({
  card,
  renderCard,
  ariaLabel,
}: KanbanCardViewProps<TCard>) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
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
}

function KanbanColumnView<TCard extends { id: string }>({
  column,
  renderCard,
  getCardAriaLabel,
  columnWidth,
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
          aria-label={`${column.cards.length} cards`}
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

    const overId = String(over.id)
    const toColumnId = findContainerId(items, overId) ?? overId
    const toColumn = items.find((c) => c.id === toColumnId)
    const overIndex = toColumn?.cards.findIndex((card) => card.id === overId) ?? -1
    const newIndex = overIndex >= 0 ? overIndex : (toColumn?.cards.length ?? 0)

    onCardMove(origin.cardId, origin.fromColumnId, toColumnId, newIndex)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className={cn('flex gap-4 overflow-x-auto p-1', className)}>
        {items.map((column) => (
          <KanbanColumnView
            key={column.id}
            column={column}
            renderCard={renderCard}
            getCardAriaLabel={getCardAriaLabel}
            columnWidth={columnWidth}
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
