import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../../../utils/cn'
import { computeDropdownCoords } from '../../../utils/dropdownPosition'
import type { DropdownAlign, DropdownCoords } from '../../../utils/dropdownPosition'
import { useStackedEscape } from '../../../utils/useStackedEscape'
import { Badge } from '../../atoms/Badge/Badge'
import { Button } from '../../atoms/Button/Button'
import { Checkbox } from '../../atoms/Checkbox/Checkbox'
import { Icon } from '../../atoms/Icon/Icon'

const PANEL_WIDTH = 288

export interface FilterDropdownOption {
  value: string
  label: string
}

export interface FilterDropdownProps {
  label: string
  options: FilterDropdownOption[]
  value: string[]
  onApply: (next: string[]) => void
  align?: DropdownAlign
  disabled?: boolean
  className?: string
}

export function FilterDropdown({
  label,
  options,
  value,
  onApply,
  align = 'start',
  disabled = false,
  className,
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<string[]>(value)
  const [coords, setCoords] = useState<DropdownCoords | null>(null)
  const triggerRef = useRef<HTMLSpanElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const baseId = useId()
  const panelId = `${baseId}-panel`

  const closeAndFocusTrigger = () => {
    setOpen(false)
    triggerRef.current?.querySelector<HTMLButtonElement>('button')?.focus()
  }

  const handleTriggerClick = () => {
    if (!open) setDraft(value)
    setOpen((o) => !o)
  }

  useEffect(() => {
    if (!open) return
    const updateCoords = () => {
      const rect = triggerRef.current?.getBoundingClientRect()
      if (!rect) return
      setCoords(computeDropdownCoords(rect, PANEL_WIDTH, align))
    }
    updateCoords()
    window.addEventListener('scroll', updateCoords, true)
    window.addEventListener('resize', updateCoords)
    return () => {
      window.removeEventListener('scroll', updateCoords, true)
      window.removeEventListener('resize', updateCoords)
    }
  }, [open, align])

  useEffect(() => {
    if (!open) return
    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as Node
      const insideTrigger = triggerRef.current?.contains(target)
      const insidePanel = panelRef.current?.contains(target)
      if (!insideTrigger && !insidePanel) setOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [open])

  useStackedEscape(open, closeAndFocusTrigger)

  const toggleDraftOption = (optionValue: string) => {
    setDraft((prev) =>
      prev.includes(optionValue) ? prev.filter((v) => v !== optionValue) : [...prev, optionValue],
    )
  }

  const handleSelectAll = () => setDraft(options.map((o) => o.value))
  const handleClear = () => setDraft([])

  const handleApply = () => {
    onApply(draft)
    closeAndFocusTrigger()
  }

  return (
    <>
      <span ref={triggerRef} className={cn('inline-block', className)}>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          aria-haspopup="true"
          aria-expanded={open}
          aria-controls={open ? panelId : undefined}
          rightIcon={<Icon name="ChevronDown" size="sm" />}
          onClick={handleTriggerClick}
        >
          {label}
          {value.length > 0 && (
            <>
              {' '}
              <Badge variant="primary" size="sm" className="ml-1">
                {value.length}
              </Badge>
            </>
          )}
        </Button>
      </span>

      {open &&
        coords &&
        !disabled &&
        createPortal(
          <div
            ref={panelRef}
            id={panelId}
            style={{
              position: 'fixed',
              left: coords.left,
              top: coords.top,
              bottom: coords.bottom,
              width: PANEL_WIDTH,
            }}
            className="z-20 rounded-md border border-border bg-background shadow-md"
          >
            <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
              <Button type="button" variant="ghost" size="sm" onClick={handleSelectAll}>
                Selecionar todos
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={handleClear}>
                Limpar
              </Button>
            </div>

            <div
              role="group"
              aria-label={label}
              className="flex max-h-60 flex-col gap-2 overflow-y-auto px-3 py-2"
            >
              {options.map((opt) => (
                <Checkbox
                  key={opt.value}
                  id={`${baseId}-option-${opt.value}`}
                  label={opt.label}
                  checked={draft.includes(opt.value)}
                  onChange={() => toggleDraftOption(opt.value)}
                />
              ))}
            </div>

            <div className="border-t border-border px-3 py-2">
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="w-full"
                onClick={handleApply}
              >
                Aplicar
              </Button>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
