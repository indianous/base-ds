import React, { cloneElement, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { ReactElement } from 'react'
import { cn } from '../../../utils/cn'
import { computeTooltipCoords } from '../../../utils/tooltipPosition'
import type { TooltipCoords, TooltipSide } from '../../../utils/tooltipPosition'
import { Spinner } from '../Spinner/Spinner'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

const VIEWPORT_MARGIN = 40

const oppositePosition: Record<TooltipSide, TooltipSide> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
}

interface ButtonCommonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  iconOnly?: boolean
  asChild?: boolean
  tooltipPosition?: TooltipSide
}

type ButtonAsButton = ButtonCommonProps & { as?: 'button' } & Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    keyof ButtonCommonProps
  >

type ButtonAsLink = ButtonCommonProps & { as: 'a'; href: string; disabled?: boolean } & Omit<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    keyof ButtonCommonProps
  >

export type ButtonProps = ButtonAsButton | ButtonAsLink

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary-hover',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary-hover',
  ghost: 'bg-transparent text-foreground hover:bg-muted',
  outline: 'border border-border bg-transparent text-foreground hover:bg-muted',
  danger: 'bg-destructive text-destructive-foreground hover:bg-destructive-hover',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-base gap-2',
  lg: 'h-12 px-6 text-lg gap-2',
}

const iconSizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 w-8 p-0',
  md: 'h-10 w-10 p-0',
  lg: 'h-12 w-12 p-0',
}

const baseClasses =
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50'

export function Button(props: ButtonProps) {
  const [tooltipVisible, setTooltipVisible] = useState(false)
  const [tooltipCoords, setTooltipCoords] = useState<TooltipCoords | null>(null)
  const triggerRef = useRef<HTMLButtonElement | HTMLAnchorElement>(null)
  const tooltipId = useId()

  const ariaLabel = props['aria-label']
  const showTooltip = Boolean(props.iconOnly) && Boolean(ariaLabel)
  const tooltipPosition = props.tooltipPosition ?? 'top'

  useEffect(() => {
    if (!showTooltip || !tooltipVisible) return

    const updateCoords = () => {
      const rect = triggerRef.current?.getBoundingClientRect()
      if (!rect) return

      const notEnoughSpace: Record<TooltipSide, boolean> = {
        top: rect.top < VIEWPORT_MARGIN,
        bottom: window.innerHeight - rect.bottom < VIEWPORT_MARGIN,
        left: rect.left < VIEWPORT_MARGIN,
        right: window.innerWidth - rect.right < VIEWPORT_MARGIN,
      }
      const resolvedPosition = notEnoughSpace[tooltipPosition]
        ? oppositePosition[tooltipPosition]
        : tooltipPosition

      setTooltipCoords(computeTooltipCoords(rect, resolvedPosition))
    }

    updateCoords()
    window.addEventListener('scroll', updateCoords, true)
    window.addEventListener('resize', updateCoords)
    return () => {
      window.removeEventListener('scroll', updateCoords, true)
      window.removeEventListener('resize', updateCoords)
    }
  }, [showTooltip, tooltipVisible, tooltipPosition])

  useEffect(() => {
    if (!showTooltip || !tooltipVisible) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setTooltipVisible(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showTooltip, tooltipVisible])

  const tooltipBubble =
    showTooltip &&
    tooltipVisible &&
    tooltipCoords &&
    createPortal(
      <span
        role="tooltip"
        id={tooltipId}
        style={{
          position: 'fixed',
          top: tooltipCoords.top,
          left: tooltipCoords.left,
          transform: tooltipCoords.transform,
        }}
        className="pointer-events-none z-50 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-normal text-background shadow-md"
      >
        {ariaLabel}
      </span>,
      document.body,
    )

  if (props.asChild) {
    const {
      asChild,
      as,
      variant = 'primary',
      size = 'md',
      iconOnly = false,
      tooltipPosition: _tooltipPosition,
      children,
      className,
      onClick,
      ...rest
    } = props as ButtonAsButton

    const child = children as ReactElement<Record<string, unknown>>

    return cloneElement(child, {
      ...rest,
      className: cn(
        baseClasses,
        variantClasses[variant],
        iconOnly ? iconSizeClasses[size] : sizeClasses[size],
        className,
        child.props.className as string | undefined,
      ),
      onClick: (e: React.MouseEvent) => {
        onClick?.(e as React.MouseEvent<HTMLButtonElement>)
        ;(child.props.onClick as ((e: React.MouseEvent) => void) | undefined)?.(e)
      },
    })
  }

  if (props.as === 'a') {
    const {
      as,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      iconOnly = false,
      tooltipPosition: _tooltipPosition,
      children,
      className,
      href,
      disabled,
      onClick,
      onMouseEnter,
      onMouseLeave,
      onFocus,
      onBlur,
      ...rest
    } = props

    const isDisabled = isLoading || disabled

    return (
      <>
        <a
          ref={triggerRef as React.Ref<HTMLAnchorElement>}
          href={href}
          aria-disabled={isDisabled ? 'true' : undefined}
          aria-busy={isLoading ? 'true' : undefined}
          aria-describedby={showTooltip && tooltipVisible ? tooltipId : undefined}
          tabIndex={isDisabled ? -1 : undefined}
          onClick={(e) => {
            if (isDisabled) {
              e.preventDefault()
              return
            }
            onClick?.(e)
          }}
          onMouseEnter={(e) => {
            onMouseEnter?.(e)
            if (showTooltip) setTooltipVisible(true)
          }}
          onMouseLeave={(e) => {
            onMouseLeave?.(e)
            if (showTooltip) setTooltipVisible(false)
          }}
          onFocus={(e) => {
            onFocus?.(e)
            if (showTooltip) setTooltipVisible(true)
          }}
          onBlur={(e) => {
            onBlur?.(e)
            if (showTooltip) setTooltipVisible(false)
          }}
          className={cn(
            baseClasses,
            variantClasses[variant],
            iconOnly ? iconSizeClasses[size] : sizeClasses[size],
            isDisabled && 'pointer-events-none opacity-50',
            className,
          )}
          {...rest}
        >
          {isLoading ? <Spinner size="sm" aria-label="Loading" /> : leftIcon}
          {children}
          {!isLoading && rightIcon}
        </a>
        {tooltipBubble}
      </>
    )
  }

  const {
    as,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    iconOnly = false,
    tooltipPosition: _tooltipPosition,
    children,
    className,
    disabled,
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur,
    ...rest
  } = props

  return (
    <>
      <button
        ref={triggerRef as React.Ref<HTMLButtonElement>}
        className={cn(
          baseClasses,
          variantClasses[variant],
          iconOnly ? iconSizeClasses[size] : sizeClasses[size],
          className,
        )}
        disabled={isLoading || disabled}
        aria-busy={isLoading ? 'true' : undefined}
        aria-describedby={showTooltip && tooltipVisible ? tooltipId : undefined}
        onMouseEnter={(e) => {
          onMouseEnter?.(e)
          if (showTooltip) setTooltipVisible(true)
        }}
        onMouseLeave={(e) => {
          onMouseLeave?.(e)
          if (showTooltip) setTooltipVisible(false)
        }}
        onFocus={(e) => {
          onFocus?.(e)
          if (showTooltip) setTooltipVisible(true)
        }}
        onBlur={(e) => {
          onBlur?.(e)
          if (showTooltip) setTooltipVisible(false)
        }}
        {...rest}
      >
        {isLoading ? <Spinner size="sm" aria-label="Loading" /> : leftIcon}
        {children}
        {!isLoading && rightIcon}
      </button>
      {tooltipBubble}
    </>
  )
}
