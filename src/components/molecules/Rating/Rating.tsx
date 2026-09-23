import { useState } from 'react'
import { cn } from '../../../utils/cn'
import { Icon } from '../../atoms/Icon/Icon'

type RatingSize = 'sm' | 'md' | 'lg'

interface RatingProps {
  value?: number
  max?: number
  onChange?: (value: number) => void
  readOnly?: boolean
  size?: RatingSize
  className?: string
}

const iconSize: Record<RatingSize, 'sm' | 'md' | 'lg'> = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
}

export function Rating({
  value = 0,
  max = 5,
  onChange,
  readOnly = false,
  size = 'md',
  className,
}: RatingProps) {
  const [hovered, setHovered] = useState<number>(0)

  return (
    <div role="radiogroup" aria-label="Rating" className={cn('flex flex-row', className)}>
      {Array.from({ length: max }, (_, index) => {
        const i = index + 1
        const isFilled = (hovered || value) >= i

        return (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={value === i}
            aria-label={`${i} star${i > 1 ? 's' : ''}`}
            onClick={() => !readOnly && onChange?.(i)}
            onMouseEnter={() => !readOnly && setHovered(i)}
            onMouseLeave={() => !readOnly && setHovered(0)}
            disabled={readOnly}
            className="focus:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded"
          >
            <Icon
              name="Star"
              size={iconSize[size]}
              className={cn(
                'transition-colors',
                isFilled
                  ? 'text-warning fill-[var(--color-warning)]'
                  : 'text-muted-foreground fill-transparent',
              )}
            />
          </button>
        )
      })}
    </div>
  )
}
