import { useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../../../utils/cn'
import { useBodyScrollLock } from '../../../utils/useBodyScrollLock'
import { useStackedEscape } from '../../../utils/useStackedEscape'
import { Image } from '../../atoms/Image/Image'
import type { ImageProps } from '../../atoms/Image/Image'
import type { ImageComponent } from '../../../utils/imageComponent'
import { Button } from '../../atoms/Button/Button'
import { IconBase } from '../../atoms/Icon/IconBase'
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from 'lucide-react'

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
  /** Loads the main image right away with high fetch priority. Turn off below the fold. */
  priority?: boolean
  /** `sizes` of the main image. Thumbnails are always `64px`. */
  sizes?: string
  /** Component rendered in place of `<img>` for the main image and the thumbnails. */
  imageComponent?: ImageComponent
  /** `aria-label` of the gallery group. */
  label?: string
  /** `aria-label` of the previous image buttons (gallery and zoom). */
  previousLabel?: string
  /** `aria-label` of the next image buttons (gallery and zoom). */
  nextLabel?: string
  /** `aria-label` of each thumbnail button, from the image number (starting at 1) and alt. */
  thumbnailLabel?: (index: number, alt: string) => string
  /** `aria-label` of the button that opens the zoom, from the selected image's alt. */
  zoomLabel?: (alt: string) => string
  /** `aria-label` of the zoom's close button. */
  zoomCloseLabel?: string
  /** `aria-label` of the zoom's backdrop button that closes it. */
  zoomDismissLabel?: string
}

export function ImageGallery({
  images,
  thumbnailPosition = 'side',
  aspectRatio = 'square',
  objectFit = 'cover',
  className,
  priority = true,
  sizes,
  imageComponent,
  label = 'Product image gallery',
  previousLabel = 'Previous image',
  nextLabel = 'Next image',
  thumbnailLabel = (index, alt) => `View image ${index}: ${alt}`,
  zoomLabel = (alt) => `Zoom image: ${alt}`,
  zoomCloseLabel = 'Close zoom',
  zoomDismissLabel = 'Dismiss zoomed image',
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
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoomOpen])

  useStackedEscape(zoomOpen, () => setZoomOpen(false))

  if (!selected) return null

  const isFirst = selectedIndex === 0
  const isLast = selectedIndex === images.length - 1

  return (
    <div
      role="group"
      aria-label={label}
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
              aria-label={thumbnailLabel(index + 1, image.alt)}
              className={cn(
                'shrink-0 overflow-hidden rounded-md border-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isSelected ? 'border-primary' : 'border-transparent',
              )}
            >
              <Image
                src={image.src}
                alt={image.alt}
                aspectRatio="square"
                sizes="64px"
                imageComponent={imageComponent}
                className="w-16"
              />
            </button>
          )
        })}
      </div>

      <div className="relative flex-1 overflow-hidden rounded-md">
        <button
          type="button"
          onClick={() => setZoomOpen(true)}
          aria-label={zoomLabel(selected.alt)}
          className="block w-full cursor-zoom-in"
        >
          <Image
            src={selected.src}
            alt={selected.alt}
            aspectRatio={aspectRatio}
            objectFit={objectFit}
            priority={priority}
            sizes={sizes}
            imageComponent={imageComponent}
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
              aria-label={previousLabel}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-background shadow-md"
            >
              <IconBase icon={ChevronLeftIcon} size="sm" />
            </Button>
            <Button
              iconOnly
              variant="ghost"
              size="sm"
              onClick={goNext}
              disabled={isLast}
              aria-label={nextLabel}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-background shadow-md"
            >
              <IconBase icon={ChevronRightIcon} size="sm" />
            </Button>
          </>
        )}
      </div>

      {zoomOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <button
              type="button"
              aria-label={zoomDismissLabel}
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
                aria-label={zoomCloseLabel}
                className="absolute right-2 top-2 z-10 bg-background shadow-md"
              >
                <IconBase icon={XIcon} size="sm" />
              </Button>

              {/* Plain <img> on purpose: the zoom shows the original image, and its layout has no
                  fixed-size container for an image component that fills it. */}
              <img
                src={selected.src}
                alt={selected.alt}
                decoding="async"
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
                    aria-label={previousLabel}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-background shadow-md"
                  >
                    <IconBase icon={ChevronLeftIcon} size="sm" />
                  </Button>
                  <Button
                    iconOnly
                    variant="ghost"
                    size="sm"
                    onClick={goNext}
                    disabled={isLast}
                    aria-label={nextLabel}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-background shadow-md"
                  >
                    <IconBase icon={ChevronRightIcon} size="sm" />
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
