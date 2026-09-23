import { useState } from 'react'
import type { AriaAttributes, KeyboardEvent, ChangeEvent } from 'react'
import { cn } from '../../../utils/cn'
import { Badge } from '../../atoms/Badge/Badge'
import { Icon } from '../../atoms/Icon/Icon'

export interface TagsInputProps extends Pick<
  AriaAttributes,
  'aria-label' | 'aria-labelledby' | 'aria-describedby' | 'aria-invalid'
> {
  id: string
  value?: string[]
  onChange?: (tags: string[]) => void
  placeholder?: string
  disabled?: boolean
  maxTags?: number
  className?: string
}

export function TagsInput({
  id,
  value,
  onChange,
  placeholder,
  disabled = false,
  maxTags,
  className,
  ...ariaProps
}: TagsInputProps) {
  const [tags, setTags] = useState<string[]>(value ?? [])
  const [inputValue, setInputValue] = useState('')
  const [prevValue, setPrevValue] = useState(value)

  if (value !== undefined && value !== prevValue) {
    setPrevValue(value)
    setTags(value)
  }

  const addTag = (val: string) => {
    const trimmed = val.trim().replace(/,$/, '')
    if (!trimmed || tags.includes(trimmed)) return
    if (maxTags !== undefined && tags.length >= maxTags) return
    const next = [...tags, trimmed]
    setTags(next)
    onChange?.(next)
  }

  const removeTag = (tag: string) => {
    const next = tags.filter((t) => t !== tag)
    setTags(next)
    onChange?.(next)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(inputValue)
      setInputValue('')
    } else if (e.key === 'Backspace' && inputValue === '') {
      const last = tags.at(-1)
      if (last !== undefined) removeTag(last)
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  return (
    <div
      className={cn(
        'flex flex-wrap gap-2 items-center p-2 border border-input rounded-md bg-background focus-within:ring-2 focus-within:ring-ring min-h-[42px]',
        className,
      )}
    >
      {tags.map((tag) => (
        <Badge key={tag} variant="default" size="sm" className="flex items-center gap-1">
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            aria-label={`Remove ${tag}`}
            disabled={disabled}
            className="ml-1 hover:text-destructive-foreground focus:outline-none"
          >
            <Icon name="X" size="sm" />
          </button>
        </Badge>
      ))}
      <input
        id={id}
        {...ariaProps}
        type="text"
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="border-0 bg-transparent focus:outline-none flex-1 min-w-[120px]"
      />
    </div>
  )
}
