import { cloneElement, useEffect, useId, useRef, useState } from 'react'
import type {
  FocusEvent as ReactFocusEvent,
  MouseEvent as ReactMouseEvent,
  ReactElement,
} from 'react'
import { cn } from '../../../utils/cn'

const VIEWPORT_MARGIN = 40

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right'

const oppositePosition: Record<TooltipPosition, TooltipPosition> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
}

const positionClasses: Record<TooltipPosition, string> = {
  top: 'bottom-full left-1/2 mb-1.5 -translate-x-1/2',
  bottom: 'top-full left-1/2 mt-1.5 -translate-x-1/2',
  left: 'right-full top-1/2 mr-1.5 -translate-y-1/2',
  right: 'left-full top-1/2 ml-1.5 -translate-y-1/2',
}

export interface TooltipProps {
  label: string
  position?: TooltipPosition
  children: ReactElement
  className?: string
  [key: string]: unknown
}

export function Tooltip({ label, position = 'top', children, className, ...rest }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const [resolvedPosition, setResolvedPosition] = useState(position)
  const containerRef = useRef<HTMLSpanElement>(null)
  const tooltipId = useId()

  const show = () => setVisible(true)
  const hide = () => setVisible(false)

  useEffect(() => {
    if (!visible) return

    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const notEnoughSpace: Record<TooltipPosition, boolean> = {
      top: rect.top < VIEWPORT_MARGIN,
      bottom: window.innerHeight - rect.bottom < VIEWPORT_MARGIN,
      left: rect.left < VIEWPORT_MARGIN,
      right: window.innerWidth - rect.right < VIEWPORT_MARGIN,
    }

    setResolvedPosition(notEnoughSpace[position] ? oppositePosition[position] : position)
  }, [visible, position])

  useEffect(() => {
    if (!visible) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') hide()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [visible])

  const child = children as ReactElement<Record<string, unknown>>

  const triggerElement = cloneElement(child, {
    ...rest,
    onMouseEnter: (e: ReactMouseEvent) => {
      ;(rest.onMouseEnter as ((e: ReactMouseEvent) => void) | undefined)?.(e)
      ;(child.props.onMouseEnter as ((e: ReactMouseEvent) => void) | undefined)?.(e)
      show()
    },
    onMouseLeave: (e: ReactMouseEvent) => {
      ;(rest.onMouseLeave as ((e: ReactMouseEvent) => void) | undefined)?.(e)
      ;(child.props.onMouseLeave as ((e: ReactMouseEvent) => void) | undefined)?.(e)
      hide()
    },
    onFocus: (e: ReactFocusEvent) => {
      ;(rest.onFocus as ((e: ReactFocusEvent) => void) | undefined)?.(e)
      ;(child.props.onFocus as ((e: ReactFocusEvent) => void) | undefined)?.(e)
      show()
    },
    onBlur: (e: ReactFocusEvent) => {
      ;(rest.onBlur as ((e: ReactFocusEvent) => void) | undefined)?.(e)
      ;(child.props.onBlur as ((e: ReactFocusEvent) => void) | undefined)?.(e)
      hide()
    },
    onClick: (e: ReactMouseEvent) => {
      ;(rest.onClick as ((e: ReactMouseEvent) => void) | undefined)?.(e)
      ;(child.props.onClick as ((e: ReactMouseEvent) => void) | undefined)?.(e)
    },
    'aria-describedby': visible ? tooltipId : undefined,
  })

  return (
    <span ref={containerRef} className={cn('relative inline-block', className)}>
      {triggerElement}
      {visible && (
        <span
          role="tooltip"
          id={tooltipId}
          className={cn(
            'absolute z-30 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs text-background shadow-md',
            positionClasses[resolvedPosition],
          )}
        >
          {label}
        </span>
      )}
    </span>
  )
}
