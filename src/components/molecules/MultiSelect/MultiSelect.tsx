import { useEffect, useId, useRef, useState } from 'react'
import type { AriaAttributes, KeyboardEvent as ReactKeyboardEvent } from 'react'
import { cn } from '../../../utils/cn'
import { Badge } from '../../atoms/Badge/Badge'
import { Icon } from '../../atoms/Icon/Icon'

export interface MultiSelectOption {
  value: string
  label: string
}

export interface MultiSelectProps extends Pick<
  AriaAttributes,
  'aria-label' | 'aria-labelledby' | 'aria-describedby' | 'aria-invalid'
> {
  id: string
  options: MultiSelectOption[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function MultiSelect({
  id,
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
  className,
  ...ariaProps
}: MultiSelectProps) {
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listboxId = useId()

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(filter.toLowerCase()),
  )
  const selectedOptions = options.filter((opt) => value.includes(opt.value))

  useEffect(() => {
    if (!open) return
    const handlePointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [open])

  const openList = () => {
    setOpen(true)
    setHighlightedIndex(0)
  }

  const toggleOption = (optionValue: string) => {
    const next = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue]
    onChange(next)
  }

  const removeOption = (optionValue: string) => {
    onChange(value.filter((v) => v !== optionValue))
  }

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        if (!open) {
          openList()
          return
        }
        setHighlightedIndex((i) => (i + 1) % filteredOptions.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        if (!open) {
          openList()
          return
        }
        setHighlightedIndex((i) => (i - 1 + filteredOptions.length) % filteredOptions.length)
        break
      case 'Enter': {
        e.preventDefault()
        const highlighted = filteredOptions[highlightedIndex]
        if (highlighted) toggleOption(highlighted.value)
        break
      }
      case 'Escape':
        e.preventDefault()
        setOpen(false)
        break
      case 'Backspace': {
        const lastValue = value.at(-1)
        if (filter === '' && lastValue !== undefined) {
          removeOption(lastValue)
        }
        break
      }
    }
  }

  const highlightedOption = filteredOptions[highlightedIndex]

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <div
        aria-disabled={disabled || undefined}
        className={cn(
          'flex flex-wrap items-center gap-2 rounded-md border border-input bg-background p-2 focus-within:ring-2 focus-within:ring-ring min-h-[42px]',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        {selectedOptions.map((opt) => (
          <Badge key={opt.value} variant="default" size="sm" className="flex items-center gap-1">
            {opt.label}
            <button
              type="button"
              onClick={() => removeOption(opt.value)}
              aria-label={`Remove ${opt.label}`}
              disabled={disabled}
              className="ml-1 hover:text-destructive-foreground focus:outline-none"
            >
              <Icon name="X" size="sm" />
            </button>
          </Badge>
        ))}
        <input
          ref={inputRef}
          id={id}
          {...ariaProps}
          role="combobox"
          type="text"
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value)
            openList()
          }}
          onFocus={openList}
          onKeyDown={handleKeyDown}
          placeholder={selectedOptions.length === 0 ? placeholder : undefined}
          disabled={disabled}
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            open && highlightedOption ? `${listboxId}-option-${highlightedOption.value}` : undefined
          }
          className="border-0 bg-transparent focus:outline-none flex-1 min-w-[120px] text-foreground disabled:cursor-not-allowed"
        />
      </div>

      {open && !disabled && (
        <div
          id={listboxId}
          role="listbox"
          aria-multiselectable="true"
          className="absolute top-full z-20 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-background py-1 shadow-md"
        >
          {filteredOptions.length === 0 && (
            <div className="px-3 py-2 text-sm text-muted-foreground">Nenhum resultado</div>
          )}
          {filteredOptions.map((opt, index) => {
            const isSelected = value.includes(opt.value)
            const isHighlighted = index === highlightedIndex
            return (
              <div
                key={opt.value}
                id={`${listboxId}-option-${opt.value}`}
                role="option"
                tabIndex={-1}
                aria-selected={isSelected}
                onMouseDown={(e) => {
                  e.preventDefault()
                  toggleOption(opt.value)
                  inputRef.current?.focus()
                }}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={cn(
                  'flex cursor-pointer items-center justify-between px-3 py-2 text-sm text-foreground',
                  isHighlighted && 'bg-muted',
                )}
              >
                {opt.label}
                {isSelected && <Icon name="Check" size="sm" />}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
