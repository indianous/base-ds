import { useState } from 'react'
import { cn } from '../../../utils/cn'
import { IconBase } from '../../atoms/Icon/IconBase'
import { StarIcon } from 'lucide-react'

type RatingSize = 'sm' | 'md' | 'lg'

interface RatingProps {
  value?: number
  max?: number
  onChange?: (value: number) => void
  readOnly?: boolean
  size?: RatingSize
  className?: string
  /** `aria-label` of the radio group. */
  label?: string
  /** `aria-label` of each star, from its value. */
  starLabel?: (value: number) => string
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
  label = 'Rating',
  starLabel = (value) => `${value} star${value > 1 ? 's' : ''}`,
}: RatingProps) {
  const [hovered, setHovered] = useState<number>(0)

  return (
    <div role="radiogroup" aria-label={label} className={cn('flex flex-row', className)}>
      {Array.from({ length: max }, (_, index) => {
        const i = index + 1
        const isFilled = (hovered || value) >= i

        return (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={value === i}
            aria-label={starLabel(i)}
            onClick={() => !readOnly && onChange?.(i)}
            onMouseEnter={() => !readOnly && setHovered(i)}
            onMouseLeave={() => !readOnly && setHovered(0)}
            disabled={readOnly}
            className="focus:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded"
          >
            <IconBase
              icon={StarIcon}
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
