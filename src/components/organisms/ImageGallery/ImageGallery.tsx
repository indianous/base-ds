import { useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../../../utils/cn'
import { useBodyScrollLock } from '../../../utils/useBodyScrollLock'
import { Image } from '../../atoms/Image/Image'
import type { ImageProps } from '../../atoms/Image/Image'
import { Button } from '../../atoms/Button/Button'
import { Icon } from '../../atoms/Icon/Icon'

export interface GalleryImage {
  src: string
  alt: string
}

export type ImageGalleryAspectRatio = ImageProps['aspectRatio']
export type ImageGalleryObjectFit = ImageProps['objectFit']

export interface ImageGalleryProps {
  images: GalleryImage[]
  thumbnailPosition?: 'side' | 'bottom'
  aspectRatio?: ImageGalleryAspectRatio
  objectFit?: ImageGalleryObjectFit
  className?: string
}

export function ImageGallery({
  images,
  thumbnailPosition = 'side',
  aspectRatio = 'square',
  objectFit = 'cover',
  className,
}: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [zoomOpen, setZoomOpen] = useState(false)
  const titleId = useId()
  const selected = images[selectedIndex]

  const goPrev = () => setSelectedIndex((i) => Math.max(0, i - 1))
  const goNext = () => setSelectedIndex((i) => Math.min(images.length - 1, i + 1))

  useBodyScrollLock(zoomOpen)

  useEffect(() => {
    if (!zoomOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoomOpen(false)
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoomOpen])

  if (!selected) return null

  const isFirst = selectedIndex === 0
  const isLast = selectedIndex === images.length - 1

  return (
    <div
      role="group"
      aria-label="Product image gallery"
      className={cn(
        'flex gap-3',
        thumbnailPosition === 'side' ? 'flex-row' : 'flex-col-reverse',
        className,
      )}
    >
      <div
        className={cn(
          'flex gap-2 overflow-auto',
          thumbnailPosition === 'side' ? 'flex-col' : 'flex-row',
        )}
      >
        {images.map((image, index) => {
          const isSelected = index === selectedIndex
          return (
            <button
              key={image.src}
              type="button"
              onClick={() => setSelectedIndex(index)}
              aria-current={isSelected ? 'true' : undefined}
              aria-label={`View image ${index + 1}: ${image.alt}`}
              className={cn(
                'shrink-0 overflow-hidden rounded-md border-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isSelected ? 'border-primary' : 'border-transparent',
              )}
            >
              <Image src={image.src} alt={image.alt} aspectRatio="square" className="w-16" />
            </button>
          )
        })}
      </div>

      <div className="relative flex-1 overflow-hidden rounded-md">
        <button
          type="button"
          onClick={() => setZoomOpen(true)}
          aria-label={`Zoom image: ${selected.alt}`}
          className="block w-full cursor-zoom-in"
        >
          <Image
            src={selected.src}
            alt={selected.alt}
            aspectRatio={aspectRatio}
            objectFit={objectFit}
          />
        </button>

        {images.length > 1 && (
          <>
            <Button
              iconOnly
              variant="ghost"
              size="sm"
              onClick={goPrev}
              disabled={isFirst}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-background shadow-md"
            >
              <Icon name="ChevronLeft" size="sm" />
            </Button>
            <Button
              iconOnly
              variant="ghost"
              size="sm"
              onClick={goNext}
              disabled={isLast}
              aria-label="Next image"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-background shadow-md"
            >
              <Icon name="ChevronRight" size="sm" />
            </Button>
          </>
        )}
      </div>

      {zoomOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <button
              type="button"
              aria-label="Dismiss zoomed image"
              onClick={() => setZoomOpen(false)}
              className="absolute inset-0 cursor-default bg-overlay"
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className="relative z-10 mx-4 max-h-[90vh] max-w-3xl"
            >
              <span id={titleId} className="sr-only">
                {selected.alt}
              </span>

              <Button
                iconOnly
                variant="ghost"
                size="sm"
                onClick={() => setZoomOpen(false)}
                aria-label="Close zoom"
                className="absolute right-2 top-2 z-10 bg-background shadow-md"
              >
                <Icon name="X" size="sm" />
              </Button>

              <img
                src={selected.src}
                alt={selected.alt}
                className="max-h-[90vh] w-full rounded-md object-contain"
              />

              {images.length > 1 && (
                <>
                  <Button
                    iconOnly
                    variant="ghost"
                    size="sm"
                    onClick={goPrev}
                    disabled={isFirst}
                    aria-label="Previous image"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-background shadow-md"
                  >
                    <Icon name="ChevronLeft" size="sm" />
                  </Button>
                  <Button
                    iconOnly
                    variant="ghost"
                    size="sm"
                    onClick={goNext}
                    disabled={isLast}
                    aria-label="Next image"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-background shadow-md"
                  >
                    <Icon name="ChevronRight" size="sm" />
                  </Button>
                </>
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
