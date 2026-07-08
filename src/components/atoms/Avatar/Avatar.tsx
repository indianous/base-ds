import { useState } from 'react'
import { cn } from '../../../utils/cn'

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl'
type AvatarShape = 'circle' | 'square'

interface AvatarProps {
  src?: string
  alt: string
  fallback?: string
  size?: AvatarSize
  shape?: AvatarShape
  className?: string
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
}

const shapeClasses: Record<AvatarShape, string> = {
  circle: 'rounded-full',
  square: 'rounded-md',
}

export function Avatar({
  src,
  alt,
  fallback,
  size = 'md',
  shape = 'circle',
  className,
}: AvatarProps) {
  const [imgError, setImgError] = useState(false)

  const showImage = Boolean(src) && !imgError

  return (
    <span
      className={cn(
        'relative inline-flex items-center justify-center overflow-hidden bg-muted text-muted-foreground font-medium flex-shrink-0',
        sizeClasses[size],
        shapeClasses[shape],
        className,
      )}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span aria-hidden="true">{fallback}</span>
      )}
    </span>
  )
}
