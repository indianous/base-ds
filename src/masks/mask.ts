// Mask engine for `MaskedInput` (issue #64). A pattern has slots — `0` a digit, `A` a letter,
// `*` a letter or digit — and literals (everything else). Plain functions, no React or DOM, so they
// also work on the server (`@indianous/base-ds/masks`).

export type MaskName = 'cpf' | 'cnpj' | 'cep' | 'phone' | 'date'

export interface MaskDefinition {
  /** From the fewest slots to the most: the first one that fits the value is used. */
  patterns: string[]
  /** Picks the pattern from the raw value instead (the card number by brand). */
  choose?: (raw: string) => string
  /** Rewrites the typed or pasted value before the mask applies (`12/2030` → `12/30`). */
  normalize?: (value: string) => string
  /** Letters become upper-case (CNPJ). */
  uppercase?: boolean
  inputMode: 'numeric' | 'text' | 'tel'
  autoComplete?: string
  placeholder: string
  /** The input's `maxLength` when the longest pattern's isn't enough (a longer value to normalize). */
  maxLength?: number
}

/** A built-in mask, a pattern of its own (`'00.000-0'`) or a full definition. */
export type Mask = MaskName | (string & {}) | MaskDefinition

const definitions: Record<MaskName, MaskDefinition> = {
  cpf: { patterns: ['000.000.000-00'], inputMode: 'numeric', placeholder: '000.000.000-00' },
  // Since 2026 the CNPJ can have letters in its first 12 positions (IN RFB nº 2.229/2024), so the
  // keyboard can't be numeric.
  cnpj: {
    patterns: ['**.***.***/****-00'],
    uppercase: true,
    inputMode: 'text',
    placeholder: '00.000.000/0000-00',
  },
  cep: {
    patterns: ['00000-000'],
    inputMode: 'numeric',
    autoComplete: 'postal-code',
    placeholder: '00000-000',
  },
  phone: {
    patterns: ['(00) 0000-0000', '(00) 00000-0000'],
    inputMode: 'tel',
    autoComplete: 'tel-national',
    placeholder: '(00) 00000-0000',
  },
  date: { patterns: ['00/00/0000'], inputMode: 'numeric', placeholder: '00/00/0000' },
}

const isSlot = (char: string) => char === '0' || char === 'A' || char === '*'

function accepts(slot: string, char: string): boolean {
  if (slot === '0') return /[0-9]/.test(char)
  if (slot === 'A') return /[a-zA-Z]/.test(char)
  return /[a-zA-Z0-9]/.test(char)
}

const slotsOf = (pattern: string) => [...pattern].filter(isSlot)

function definitionFor(mask: Mask): MaskDefinition {
  if (typeof mask === 'object') return mask
  if (mask in definitions) return definitions[mask as MaskName]
  return {
    patterns: [mask],
    inputMode: slotsOf(mask).every((slot) => slot === '0') ? 'numeric' : 'text',
    placeholder: mask.replace(/\*/g, '0'),
  }
}

// The value's significant characters that fit the slots, in order (the rest is skipped).
function extract(value: string, pattern: string, uppercase = false): string {
  const slots = slotsOf(pattern)
  let raw = ''
  for (const char of value) {
    if (raw.length >= slots.length) break
    if (!/[a-zA-Z0-9]/.test(char)) continue
    const next = uppercase ? char.toUpperCase() : char
    if (accepts(slots[raw.length] as string, next)) raw += next
  }
  return raw
}

function patternFor(definition: MaskDefinition, raw: string): string {
  const { patterns } = definition
  if (definition.choose) return definition.choose(raw)
  return (
    patterns.find((pattern) => slotsOf(pattern).length >= raw.length) ?? (patterns.at(-1) as string)
  )
}

/** The raw value: only the characters that fill the mask's slots (`'123.456.789-00'` → `'12345678900'`). */
export function unmask(value: string, mask: Mask): string {
  const definition = definitionFor(mask)
  const normalized = definition.normalize?.(value) ?? value
  const raw = extract(normalized, definition.patterns.at(-1) as string, definition.uppercase)
  // A chosen pattern may have fewer slots than the longest one (Amex): cut what doesn't fit.
  return definition.choose ? extract(raw, definition.choose(raw), definition.uppercase) : raw
}

/** The pattern the mask uses for a value (the phone has one for 8 and one for 9 digits). */
export function maskPatternFor(mask: Mask, value: string): string {
  return patternFor(definitionFor(mask), unmask(value, mask))
}

/** The value, raw or formatted, formatted by the mask. Literals only show before a typed character. */
export function formatMasked(value: string, mask: Mask): string {
  const raw = unmask(value, mask)
  const pattern = patternFor(definitionFor(mask), raw)
  let formatted = ''
  let index = 0
  for (const char of pattern) {
    if (index >= raw.length) break
    formatted += isSlot(char) ? raw[index++] : char
  }
  return formatted
}

/** Caret position right after `count` significant characters of a formatted value. */
export function caretAfter(formatted: string, mask: Mask, count: number): number {
  if (count <= 0) return 0
  const pattern = maskPatternFor(mask, formatted)
  let seen = 0
  for (let index = 0; index < formatted.length; index++) {
    if (isSlot(pattern[index] ?? '') && ++seen === count) return index + 1
  }
  return formatted.length
}

/** Input attributes a mask implies: keyboard, autocomplete, length and placeholder. */
export function maskInputProps(mask: Mask) {
  const definition = definitionFor(mask)
  return {
    inputMode: definition.inputMode,
    autoComplete: definition.autoComplete,
    maxLength:
      definition.maxLength ?? Math.max(...definition.patterns.map((pattern) => pattern.length)),
    placeholder: definition.placeholder,
  }
}
