import React, { useState } from 'react'
import { cn } from '../../../utils/cn'
import type { ImageComponent } from '../../../utils/imageComponent'

type AspectRatio = 'square' | 'video' | 'portrait'
type ObjectFit = 'cover' | 'contain'

export interface ImageProps {
  src: string
  alt: string
  aspectRatio?: AspectRatio
  objectFit?: ObjectFit
  fallback?: React.ReactNode
  className?: string
  /** `loading` of the image. Off-screen images wait until they're about to be seen. */
  loading?: 'lazy' | 'eager'
  /** Loads the image right away with high fetch priority (the page's main image), over `loading`. */
  priority?: boolean
  /** `sizes` of the image, so a responsive image component picks the right resolution. */
  sizes?: string | undefined
  width?: number
  height?: number
  /** Component rendered in place of `<img>` (e.g. a wrapper around Next.js `Image`). */
  imageComponent?: ImageComponent | undefined
}

export function Image({
  src,
  alt,
  aspectRatio,
  objectFit = 'cover',
  fallback,
  className,
  loading = 'lazy',
  priority = false,
  sizes,
  width,
  height,
  imageComponent: ImageElement = 'img',
}: ImageProps) {
  const [hasError, setHasError] = useState(false)

  const aspectClass =
    aspectRatio === 'square'
      ? 'aspect-square'
      : aspectRatio === 'video'
        ? 'aspect-video'
        : undefined

  const aspectStyle = aspectRatio === 'portrait' ? { aspectRatio: '3/4' } : undefined

  const fitClass = objectFit === 'contain' ? 'object-contain' : 'object-cover'

  // Only passed when given: Next.js `Image` with `fill` rejects `width`/`height`.
  const dimensions = {
    ...(width !== undefined && { width }),
    ...(height !== undefined && { height }),
  }

  return (
    <div className={cn('relative overflow-hidden', aspectClass, className)} style={aspectStyle}>
      <ImageElement
        src={src}
        alt={alt}
        loading={priority ? 'eager' : loading}
        decoding="async"
        {...(priority && { fetchPriority: 'high' as const })}
        {...(sizes !== undefined && { sizes })}
        {...dimensions}
        className={cn('w-full h-full', fitClass, hasError && 'hidden')}
        onError={() => setHasError(true)}
      />
      {hasError && fallback}
    </div>
  )
}
