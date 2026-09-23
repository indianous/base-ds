import { cn } from '../../../utils/cn'

interface SwitchProps {
  id: string
  label?: string
  checked?: boolean
  disabled?: boolean
  onChange?: (checked: boolean) => void
  className?: string
}

export function Switch({
  id,
  label,
  checked = false,
  disabled = false,
  onChange,
  className,
}: SwitchProps) {
  const handleToggle = () => {
    if (!disabled) onChange?.(!checked)
  }

  return (
    <div className="flex items-center gap-2">
      {label && (
        <label htmlFor={id} className="text-sm text-foreground select-none">
          {label}
        </label>
      )}
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={handleToggle}
        aria-label={label ?? 'toggle switch'}
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
          checked ? 'bg-primary' : 'bg-muted',
          className,
        )}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform',
            checked ? 'translate-x-6' : 'translate-x-1',
          )}
        />
      </button>
    </div>
  )
}
