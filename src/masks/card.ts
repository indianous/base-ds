// Card brand detection, grouping and Luhn check (issue #63). Plain functions, no React or DOM,
// so they also work on the server (`@indianous/base-ds/masks`).

import type { MaskDefinition } from './mask'

export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'elo' | 'hipercard' | 'diners'

// Elo ranges (6-digit prefixes), as commonly published to acquirers. Elo adds ranges over time:
// update this table when a new one shows up. Checked before Visa and Mastercard, since some Elo
// ranges start with 4 and 5.
const eloRanges: [from: number, to: number][] = [
  [401178, 401179],
  [431274, 431274],
  [438935, 438935],
  [451416, 451416],
  [457393, 457393],
  [457631, 457632],
  [504175, 504175],
  [506699, 506778],
  [509000, 509999],
  [627780, 627780],
  [636297, 636297],
  [636368, 636368],
  [650031, 650033],
  [650035, 650051],
  [650405, 650439],
  [650485, 650538],
  [650541, 650598],
  [650700, 650718],
  [650720, 650727],
  [650901, 650978],
  [651652, 651679],
  [655000, 655019],
  [655021, 655058],
]

const hipercardPrefixes = ['606282', '384100', '384140', '384160']

const digitsOf = (value: string) => value.replace(/\D/g, '')

const inRange = (prefix: string, from: number, to: number) => {
  const value = Number(prefix)
  return value >= from && value <= to
}

/** The card brand from the number's first digits, or undefined while it can't tell. */
export function detectCardBrand(number: string): CardBrand | undefined {
  const digits = digitsOf(number)
  if (digits === '') return undefined
  const six = digits.slice(0, 6)
  if (six.length === 6 && eloRanges.some(([from, to]) => inRange(six, from, to))) return 'elo'
  if (six.length === 6 && hipercardPrefixes.includes(six)) return 'hipercard'
  if (/^3[47]/.test(digits)) return 'amex'
  if (/^3(0[0-5]|[689])/.test(digits)) return 'diners'
  if (/^5[1-5]/.test(digits)) return 'mastercard'
  if (digits.length >= 4 && inRange(digits.slice(0, 4), 2221, 2720)) return 'mastercard'
  if (digits.startsWith('4')) return 'visa'
  return undefined
}

/** The number's grouping: Amex 4-6-5, Diners 4-6-4, the rest in groups of 4 (up to 19 digits). */
export function cardNumberPattern(brand: CardBrand | undefined): string {
  if (brand === 'amex') return '0000 000000 00000'
  if (brand === 'diners') return '0000 000000 0000'
  return '0000 0000 0000 0000 000'
}

/** Whether a card number (formatted or not) passes the Luhn check. */
export function isValidCardNumber(number: string): boolean {
  const digits = digitsOf(number)
  if (digits.length < 12 || digits.length > 19 || /^0+$/.test(digits)) return false
  let sum = 0
  for (let index = 0; index < digits.length; index++) {
    let digit = Number(digits[digits.length - 1 - index])
    if (index % 2 === 1) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
  }
  return sum % 10 === 0
}

/** The card number's mask: the grouping follows the brand, and the length too (Amex has 15). */
export const cardNumberMask: MaskDefinition = {
  // From the fewest slots to the most: Diners 14, Amex 15, the rest up to 19.
  patterns: [cardNumberPattern('diners'), cardNumberPattern('amex'), cardNumberPattern(undefined)],
  choose: (raw) => cardNumberPattern(detectCardBrand(raw)),
  inputMode: 'numeric',
  autoComplete: 'cc-number',
  placeholder: '0000 0000 0000 0000',
}

// MM/YY from what is typed or pasted: a month digit that can't start a month gets a leading 0
// (`5` → `05`, `13` → `01/3`) and a 4-digit year loses its century (`12/2030` → `12/30`).
function normalizeExpiry(value: string): string {
  let digits = value.replace(/\D/g, '')
  if (/^[2-9]/.test(digits) || /^1[3-9]/.test(digits)) digits = `0${digits}`
  if (digits.length > 4 && digits.slice(2, 4) === '20')
    digits = digits.slice(0, 2) + digits.slice(4)
  return digits
}

/** The expiry's mask, `MM/YY`; `MM/YYYY` (typed, pasted or autofilled) becomes `MM/YY`. */
export const cardExpiryMask: MaskDefinition = {
  patterns: ['00/00'],
  normalize: normalizeExpiry,
  inputMode: 'numeric',
  autoComplete: 'cc-exp',
  placeholder: 'MM/YY',
  // Room for MM/YYYY, which the browser would cut before the mask shortens it.
  maxLength: 7,
}

/** The security code's mask: 4 digits for Amex, 3 for the rest. */
export function cardCvcMask(brand: CardBrand | undefined): MaskDefinition {
  const pattern = brand === 'amex' ? '0000' : '000'
  return { patterns: [pattern], inputMode: 'numeric', autoComplete: 'cc-csc', placeholder: pattern }
}
