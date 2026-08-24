import React, { useId, useState } from 'react'
import { cn } from '../../../utils/cn'
import { Input } from '../../atoms/Input/Input'
import { Button } from '../../atoms/Button/Button'
import { Icon } from '../../atoms/Icon/Icon'

interface SearchFieldProps {
  onSearch: (value: string) => void
  placeholder?: string
  isLoading?: boolean
  defaultValue?: string
  className?: string
  id?: string
  label?: string
  buttonLabel?: string
  buttonIconOnly?: boolean
}

export function SearchField({
  onSearch,
  placeholder,
  isLoading = false,
  defaultValue = '',
  className,
  id,
  label = 'Search input',
  buttonLabel = 'Search',
  buttonIconOnly = false,
}: SearchFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const [value, setValue] = useState(defaultValue)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoading) {
      onSearch(value)
    }
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={cn('flex items-center gap-2', className)}
    >
      <div className="relative flex-1">
        <Input
          id={inputId}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          aria-label={label}
        />
      </div>
      <Button
        type="submit"
        aria-label={buttonLabel}
        isLoading={isLoading}
        leftIcon={<Icon name="Search" size="sm" />}
        iconOnly={buttonIconOnly}
      >
        {buttonIconOnly ? null : buttonLabel}
      </Button>
    </form>
  )
}
