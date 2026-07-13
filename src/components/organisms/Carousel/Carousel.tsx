import type { ReactNode } from 'react'
import { useState } from 'react'
import { cn } from '../../../utils/cn'
import { Button } from '../../atoms/Button/Button'
import { Icon } from '../../atoms/Icon/Icon'

interface CarouselProps {
  items: ReactNode[]
  showArrows?: boolean
  showDots?: boolean
  loop?: boolean
  className?: string
}

export function Carousel({
  items,
  showArrows = true,
  showDots = true,
  loop = false,
  className,
}: CarouselProps) {
  const [current, setCurrent] = useState(0)

  function prev() {
    if (loop) {
      setCurrent((c) => (c - 1 + items.length) % items.length)
    } else {
      setCurrent((c) => Math.max(0, c - 1))
    }
  }

  function next() {
    if (loop) {
      setCurrent((c) => (c + 1) % items.length)
    } else {
      setCurrent((c) => Math.min(items.length - 1, c + 1))
    }
  }

  return (
    <div role="region" aria-label="Carousel" className={cn('relative overflow-hidden', className)}>
      <div>
        {items.map((item, i) => (
          <div
            key={i}
            role="group"
            aria-roledescription="slide"
            aria-label={`Slide ${i + 1} of ${items.length}`}
            className={cn(i !== current && 'hidden')}
          >
            {item}
          </div>
        ))}
      </div>

      {showArrows && (
        <div className="flex justify-between mt-2">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Icon name="ChevronLeft" />}
            onClick={prev}
            disabled={!loop && current === 0}
            aria-label="Previous slide"
          />
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Icon name="ChevronRight" />}
            onClick={next}
            disabled={!loop && current === items.length - 1}
            aria-label="Next slide"
          />
        </div>
      )}

      {showDots && (
        <div className="flex justify-center gap-2 mt-3">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === current ? 'true' : 'false'}
              className={cn(
                'w-2 h-2 rounded-full',
                i === current ? 'bg-primary' : 'bg-muted',
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}
