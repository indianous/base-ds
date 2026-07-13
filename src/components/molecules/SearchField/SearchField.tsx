import React, { useState } from 'react'
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
}

export function SearchField({
  onSearch,
  placeholder,
  isLoading = false,
  defaultValue = '',
  className,
}: SearchFieldProps) {
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
          id="search-field"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          aria-label="Search input"
        />
      </div>
      <Button
        type="submit"
        aria-label="Search"
        isLoading={isLoading}
        leftIcon={<Icon name="Search" size="sm" />}
      >
        Search
      </Button>
    </form>
  )
}
