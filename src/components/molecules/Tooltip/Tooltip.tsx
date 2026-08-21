import { cloneElement, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type {
  FocusEvent as ReactFocusEvent,
  MouseEvent as ReactMouseEvent,
  ReactElement,
} from 'react'
import { cn } from '../../../utils/cn'
import { computeTooltipCoords } from '../../../utils/tooltipPosition'
import type { TooltipCoords, TooltipSide } from '../../../utils/tooltipPosition'

const VIEWPORT_MARGIN = 40

const oppositePosition: Record<TooltipSide, TooltipSide> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
}

export interface TooltipProps {
  label: string
  position?: TooltipSide
  children: ReactElement
  className?: string
  [key: string]: unknown
}

export function Tooltip({ label, position = 'top', children, className, ...rest }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const [coords, setCoords] = useState<TooltipCoords | null>(null)
  const containerRef = useRef<HTMLSpanElement>(null)
  const tooltipId = useId()

  const show = () => setVisible(true)
  const hide = () => setVisible(false)

  useEffect(() => {
    if (!visible) return

    const updateCoords = () => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      const notEnoughSpace: Record<TooltipSide, boolean> = {
        top: rect.top < VIEWPORT_MARGIN,
        bottom: window.innerHeight - rect.bottom < VIEWPORT_MARGIN,
        left: rect.left < VIEWPORT_MARGIN,
        right: window.innerWidth - rect.right < VIEWPORT_MARGIN,
      }
      const resolvedPosition = notEnoughSpace[position] ? oppositePosition[position] : position

      setCoords(computeTooltipCoords(rect, resolvedPosition))
    }

    updateCoords()
    window.addEventListener('scroll', updateCoords, true)
    window.addEventListener('resize', updateCoords)
    return () => {
      window.removeEventListener('scroll', updateCoords, true)
      window.removeEventListener('resize', updateCoords)
    }
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
    <span ref={containerRef} className={cn('inline-block', className)}>
      {triggerElement}
      {visible &&
        coords &&
        createPortal(
          <span
            role="tooltip"
            id={tooltipId}
            style={{
              position: 'fixed',
              top: coords.top,
              left: coords.left,
              transform: coords.transform,
            }}
            className="z-50 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs text-background shadow-md"
          >
            {label}
          </span>,
          document.body,
        )}
    </span>
  )
}
