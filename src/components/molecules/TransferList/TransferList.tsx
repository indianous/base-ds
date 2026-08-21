import { useId, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import { cn } from '../../../utils/cn'
import { Button } from '../../atoms/Button/Button'
import { Icon } from '../../atoms/Icon/Icon'

export interface TransferListOption {
  value: string
  label: string
}

export interface TransferListProps {
  options: TransferListOption[]
  value: string[]
  onChange: (next: string[]) => void
  availableLabel?: string
  selectedLabel?: string
  disabled?: boolean
  className?: string
}

interface ListboxColumnProps {
  id: string
  title: string
  items: TransferListOption[]
  highlighted: string | undefined
  onHighlight: (value: string) => void
  onMove: (value: string) => void
  disabled: boolean
}

function ListboxColumn({
  id,
  title,
  items,
  highlighted,
  onHighlight,
  onMove,
  disabled,
}: ListboxColumnProps) {
  const titleId = `${id}-title`

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (disabled || items.length === 0) return
    const currentIndex = items.findIndex((item) => item.value === highlighted)

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = items[Math.min(items.length - 1, currentIndex + 1)]
      if (next) onHighlight(next.value)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const next = items[Math.max(0, currentIndex - 1)]
      if (next) onHighlight(next.value)
    }
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
      <span id={titleId} className="text-sm font-medium text-foreground">
        {title}
      </span>
      <div
        role="listbox"
        aria-labelledby={titleId}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
        className={cn(
          'flex h-56 flex-col gap-0.5 overflow-y-auto rounded-md border border-input p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          disabled && 'pointer-events-none opacity-50',
        )}
      >
        {items.length === 0 && (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            Empty
          </div>
        )}
        {items.map((item) => {
          const isHighlighted = item.value === highlighted
          return (
            <div
              key={item.value}
              role="option"
              aria-selected={isHighlighted}
              tabIndex={-1}
              onClick={() => onHighlight(item.value)}
              onDoubleClick={() => onMove(item.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onHighlight(item.value)
                }
              }}
              className={cn(
                'cursor-pointer rounded-sm px-2 py-1.5 text-sm text-foreground',
                isHighlighted ? 'bg-primary-muted text-primary-muted-fg' : 'hover:bg-muted',
              )}
            >
              {item.label}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function TransferList({
  options,
  value,
  onChange,
  availableLabel = 'Available',
  selectedLabel = 'Selected',
  disabled = false,
  className,
}: TransferListProps) {
  const baseId = useId()
  const [highlightedAvailable, setHighlightedAvailable] = useState<string | undefined>(undefined)
  const [highlightedSelected, setHighlightedSelected] = useState<string | undefined>(undefined)

  const availableOptions = options.filter((option) => !value.includes(option.value))
  const selectedOptions = value
    .map((v) => options.find((option) => option.value === v))
    .filter((option): option is TransferListOption => option !== undefined)

  const moveToSelected = (optionValue: string) => {
    setHighlightedAvailable(undefined)
    onChange([...value, optionValue])
  }

  const moveToAvailable = (optionValue: string) => {
    setHighlightedSelected(undefined)
    onChange(value.filter((v) => v !== optionValue))
  }

  const moveAllToSelected = () => {
    setHighlightedAvailable(undefined)
    onChange(options.map((option) => option.value))
  }

  const moveAllToAvailable = () => {
    setHighlightedSelected(undefined)
    onChange([])
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <ListboxColumn
        id={`${baseId}-available`}
        title={availableLabel}
        items={availableOptions}
        highlighted={highlightedAvailable}
        onHighlight={setHighlightedAvailable}
        onMove={moveToSelected}
        disabled={disabled}
      />

      <div className="flex flex-col gap-2">
        <Button
          iconOnly
          size="sm"
          variant="outline"
          aria-label={`Move to ${selectedLabel}`}
          disabled={disabled || highlightedAvailable === undefined}
          onClick={() => {
            if (highlightedAvailable !== undefined) moveToSelected(highlightedAvailable)
          }}
        >
          <Icon name="ChevronRight" size="sm" />
        </Button>
        <Button
          iconOnly
          size="sm"
          variant="outline"
          aria-label={`Move all to ${selectedLabel}`}
          disabled={disabled || availableOptions.length === 0}
          onClick={moveAllToSelected}
        >
          <Icon name="ChevronsRight" size="sm" />
        </Button>
        <Button
          iconOnly
          size="sm"
          variant="outline"
          aria-label={`Move all to ${availableLabel}`}
          disabled={disabled || selectedOptions.length === 0}
          onClick={moveAllToAvailable}
        >
          <Icon name="ChevronsLeft" size="sm" />
        </Button>
        <Button
          iconOnly
          size="sm"
          variant="outline"
          aria-label={`Move to ${availableLabel}`}
          disabled={disabled || highlightedSelected === undefined}
          onClick={() => {
            if (highlightedSelected !== undefined) moveToAvailable(highlightedSelected)
          }}
        >
          <Icon name="ChevronLeft" size="sm" />
        </Button>
      </div>

      <ListboxColumn
        id={`${baseId}-selected`}
        title={selectedLabel}
        items={selectedOptions}
        highlighted={highlightedSelected}
        onHighlight={setHighlightedSelected}
        onMove={moveToAvailable}
        disabled={disabled}
      />
    </div>
  )
}
