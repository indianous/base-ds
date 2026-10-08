// Public entry `@indianous/base-ds/masks` (issue #64): mask formatting and CPF/CNPJ validation as
// plain functions, with no React and no 'use client', so they also run on the server (a Server
// Component or a server action validating a CPF). `MaskedInput` comes from the package root.
export { formatMasked, unmask } from './mask'
export type { Mask, MaskDefinition, MaskName } from './mask'
export { isValidCnpj, isValidCpf } from './documents'
export { detectCardBrand, isValidCardNumber } from './card'
export type { CardBrand } from './card'
