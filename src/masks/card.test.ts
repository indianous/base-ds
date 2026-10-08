// @vitest-environment node
import {
  cardCvcMask,
  cardExpiryMask,
  cardNumberMask,
  cardNumberPattern,
  detectCardBrand,
  isValidCardNumber,
} from './card'
import { formatMasked, unmask } from './mask'

describe('detectCardBrand', () => {
  it.each([
    ['4111 1111 1111 1111', 'visa'],
    ['4', 'visa'],
    ['5555 5555 5555 4444', 'mastercard'],
    ['2221 0000 0000 0009', 'mastercard'],
    ['2720 9999 9999 9996', 'mastercard'],
    ['3782 822463 10005', 'amex'],
    ['34', 'amex'],
    ['3056 930902 5904', 'diners'],
    ['36', 'diners'],
    ['6362 9700 0045 7013', 'elo'],
    ['5067 0000 0000 0000', 'elo'],
    ['4011 7800 0000 0000', 'elo'],
    ['6062 8256 2425 4001', 'hipercard'],
    ['3841 0000 0000 0000', 'hipercard'],
  ])('detects %s as %s', (number, brand) => {
    expect(detectCardBrand(number)).toBe(brand)
  })

  it.each(['', '9', '1234', '2100'])('returns undefined for %s', (number) => {
    expect(detectCardBrand(number)).toBeUndefined()
  })
})

describe('cardNumberPattern', () => {
  it('groups Amex as 4-6-5, Diners as 4-6-4 and the rest in groups of 4', () => {
    expect(cardNumberPattern('amex')).toBe('0000 000000 00000')
    expect(cardNumberPattern('diners')).toBe('0000 000000 0000')
    expect(cardNumberPattern('visa')).toBe('0000 0000 0000 0000 000')
    expect(cardNumberPattern(undefined)).toBe('0000 0000 0000 0000 000')
  })
})

describe('isValidCardNumber', () => {
  it.each(['4111 1111 1111 1111', '5555555555554444', '378282246310005', '6362970000457013'])(
    'accepts %s (Luhn)',
    (number) => {
      expect(isValidCardNumber(number)).toBe(true)
    },
  )

  it.each(['4111 1111 1111 1112', '1234', '', '0000000000000000'])('rejects %s', (number) => {
    expect(isValidCardNumber(number)).toBe(false)
  })
})

describe('card masks', () => {
  it('groups the number by brand', () => {
    expect(formatMasked('4111111111111111', cardNumberMask)).toBe('4111 1111 1111 1111')
    expect(formatMasked('378282246310005', cardNumberMask)).toBe('3782 822463 10005')
    expect(formatMasked('30569309025904', cardNumberMask)).toBe('3056 930902 5904')
    // Amex has 15 digits: a 16th is cut.
    expect(unmask('3782822463100051', cardNumberMask)).toBe('378282246310005')
  })

  it.each([
    ['1230', '12/30'],
    ['12/2030', '12/30'],
    ['122030', '12/30'],
    ['12/203', '12/3'],
    ['5', '05'],
    ['0', '0'],
    ['12/20', '12/20'],
    ['13', '01/3'],
    ['1', '1'],
  ])('formats the expiry %s as %s', (value, formatted) => {
    expect(formatMasked(value, cardExpiryMask)).toBe(formatted)
  })

  it('accepts a 4-digit code only for Amex', () => {
    expect(formatMasked('1234', cardCvcMask('visa'))).toBe('123')
    expect(formatMasked('1234', cardCvcMask(undefined))).toBe('123')
    expect(formatMasked('1234', cardCvcMask('amex'))).toBe('1234')
  })
})
