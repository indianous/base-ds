import React from 'react'
import { cn } from '../../../utils/cn'
import { Spinner } from '../Spinner/Spinner'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'brutalist'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonCommonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

type ButtonAsButton = ButtonCommonProps &
  { as?: 'button' } &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonCommonProps>

type ButtonAsLink = ButtonCommonProps &
  { as: 'a'; href: string; disabled?: boolean } &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonCommonProps>

export type ButtonProps = ButtonAsButton | ButtonAsLink

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary-hover',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary-hover',
  ghost: 'bg-transparent text-foreground hover:bg-muted',
  outline: 'border border-border bg-transparent text-foreground hover:bg-muted',
  danger: 'bg-destructive text-destructive-foreground hover:bg-destructive-hover',
  brutalist:
    'relative z-10 bg-brutalist text-brutalist-foreground border-2 border-brutalist-border rounded-none font-bold ' +
    '-translate-x-[var(--button-brutalist-offset)] -translate-y-[var(--button-brutalist-offset)] transition-transform ' +
    'hover:translate-x-0 hover:translate-y-0 active:translate-x-0 active:translate-y-0 focus-visible:translate-x-0 focus-visible:translate-y-0',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-base gap-2',
  lg: 'h-12 px-6 text-lg gap-2',
}

const baseClasses =
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50'

function withBrutalistShadow(variant: ButtonVariant, element: React.ReactElement) {
  if (variant !== 'brutalist') return element

  return (
    <span className="relative inline-block">
      <span aria-hidden="true" className="absolute inset-0 rounded-none bg-brutalist-border" />
      {element}
    </span>
  )
}

export function Button(props: ButtonProps) {
  if (props.as === 'a') {
    const {
      as,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      className,
      href,
      disabled,
      onClick,
      ...rest
    } = props

    const isDisabled = isLoading || disabled

    return withBrutalistShadow(
      variant,
      <a
        href={href}
        aria-disabled={isDisabled ? 'true' : undefined}
        aria-busy={isLoading ? 'true' : undefined}
        tabIndex={isDisabled ? -1 : undefined}
        onClick={(e) => {
          if (isDisabled) {
            e.preventDefault()
            return
          }
          onClick?.(e)
        }}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          isDisabled && 'pointer-events-none opacity-50',
          className,
        )}
        {...rest}
      >
        {isLoading ? <Spinner size="sm" aria-label="Loading" /> : leftIcon}
        {children}
        {!isLoading && rightIcon}
      </a>,
    )
  }

  const {
    as,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    children,
    className,
    disabled,
    ...rest
  } = props

  return withBrutalistShadow(
    variant,
    <button
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      disabled={isLoading || disabled}
      aria-busy={isLoading ? 'true' : undefined}
      {...rest}
    >
      {isLoading ? (
        <Spinner size="sm" aria-label="Loading" />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>,
  )
}
