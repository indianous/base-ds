import React, { useState } from 'react'
import { cn } from '../../../utils/cn'

type AspectRatio = 'square' | 'video' | 'portrait'
type ObjectFit = 'cover' | 'contain'

export interface ImageProps {
  src: string
  alt: string
  aspectRatio?: AspectRatio
  objectFit?: ObjectFit
  fallback?: React.ReactNode
  className?: string
}

export function Image({
  src,
  alt,
  aspectRatio,
  objectFit = 'cover',
  fallback,
  className,
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

  return (
    <div className={cn('relative overflow-hidden', aspectClass, className)} style={aspectStyle}>
      <img
        src={src}
        alt={alt}
        className={cn('w-full h-full', fitClass, hasError && 'hidden')}
        onError={() => setHasError(true)}
      />
      {hasError && fallback}
    </div>
  )
}
