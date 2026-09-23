import { useState } from 'react'
import { Input, type InputProps } from '../../atoms/Input/Input'
import { Icon } from '../../atoms/Icon/Icon'
import { cn } from '../../../utils/cn'

type PasswordInputProps = Omit<InputProps, 'type'>

export function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className={cn('relative w-full', className)}>
      <Input type={showPassword ? 'text' : 'password'} className="pr-10" {...props} />
      <button
        type="button"
        aria-label={showPassword ? 'Hide password' : 'Show password'}
        onClick={() => setShowPassword((prev) => !prev)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
      >
        <Icon name={showPassword ? 'EyeOff' : 'Eye'} size="sm" />
      </button>
    </div>
  )
}
