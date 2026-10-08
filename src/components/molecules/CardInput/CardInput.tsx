import { useState } from 'react'
import { CreditCardIcon } from 'lucide-react'
import { MaskedInput } from '../MaskedInput/MaskedInput'
import type { MaskedInputProps } from '../MaskedInput/MaskedInput'
import { IconBase } from '../../atoms/Icon/IconBase'
import { cardCvcMask, cardExpiryMask, cardNumberMask, detectCardBrand } from '../../../masks/card'
import type { CardBrand } from '../../../masks/card'
import { unmask } from '../../../masks/mask'
import { cn } from '../../../utils/cn'

// Card inputs (issue #63): three fields, each with its own label and autocomplete, so the browser
// can fill them. They keep nothing outside the input: no storage, no console, no data attributes.

export type CardInputProps = Omit<MaskedInputProps, 'mask'>
export type { CardBrand }

// Shown inside the field: brand names, not logos (trademarks, and lucide doesn't have them).
const brandNames: Record<CardBrand, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'Amex',
  elo: 'Elo',
  hipercard: 'Hipercard',
  diners: 'Diners',
}

const announcedNames: Record<CardBrand, string> = {
  ...brandNames,
  amex: 'American Express',
  diners: 'Diners Club',
}

export interface CardNumberInputProps extends CardInputProps {
  /** Called when the detected brand changes (undefined while it can't tell). */
  onBrandChange?: (brand: CardBrand | undefined) => void
  /** Text of the live region that announces the detected brand to screen readers. */
  brandLabel?: (brand: CardBrand) => string
}

/** Card number grouped by brand (Amex 4-6-5), with the brand shown as text inside the field. */
export function CardNumberInput({
  className,
  value,
  defaultValue,
  onValueChange,
  onBrandChange,
  brandLabel = (brand) => `Card brand: ${announcedNames[brand]}`,
  ...props
}: CardNumberInputProps) {
  const [uncontrolled, setUncontrolled] = useState(() => unmask(defaultValue ?? '', cardNumberMask))
  const brand = detectCardBrand(value ?? uncontrolled)

  function handleValueChange(raw: string, formatted: string) {
    if (value === undefined) setUncontrolled(raw)
    const next = detectCardBrand(raw)
    if (next !== brand) onBrandChange?.(next)
    onValueChange?.(raw, formatted)
  }

  return (
    <div className={cn('relative w-full', className)}>
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
        <IconBase icon={CreditCardIcon} size="sm" />
      </span>
      <MaskedInput
        {...props}
        mask={cardNumberMask}
        {...(value !== undefined && { value })}
        {...(defaultValue !== undefined && { defaultValue })}
        onValueChange={handleValueChange}
        className="pl-10 pr-28"
      />
      {brand && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground"
        >
          {brandNames[brand]}
        </span>
      )}
      <span role="status" aria-live="polite" className="sr-only">
        {brand ? brandLabel(brand) : ''}
      </span>
    </div>
  )
}

export type CardExpiryInputProps = CardInputProps

/** Expiry as `MM/YY`; `MM/YYYY`, typed, pasted or autofilled, becomes `MM/YY`. */
export function CardExpiryInput(props: CardExpiryInputProps) {
  return <MaskedInput {...props} mask={cardExpiryMask} />
}

export interface CardCvcInputProps extends CardInputProps {
  /** The card's brand, from `CardNumberInput`'s `onBrandChange`: Amex codes have 4 digits. */
  brand?: CardBrand | undefined
}

/** Security code, 3 digits (4 for Amex), hidden when the page is printed. */
export function CardCvcInput({ brand, className, ...props }: CardCvcInputProps) {
  return (
    <MaskedInput
      {...props}
      mask={cardCvcMask(brand)}
      className={cn('print:text-transparent', className)}
    />
  )
}
