import { cn } from '../../../utils/cn'

type SpinnerSize = 'sm' | 'md' | 'lg'

interface SpinnerProps {
  size?: SpinnerSize
  'aria-label'?: string
  className?: string
}

export function Spinner({
  size = 'md',
  'aria-label': ariaLabel = 'Carregando...',
  className,
}: SpinnerProps) {
  const sizeClasses: Record<SpinnerSize, string> = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }

  return (
    <div
      role="status"
      aria-label={ariaLabel}
      className={cn(
        'inline-block animate-spin rounded-full border-2 border-current border-t-transparent',
        sizeClasses[size],
        className,
      )}
    />
  )
}
