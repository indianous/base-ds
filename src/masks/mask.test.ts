// @vitest-environment node
import { caretAfter, formatMasked, maskPatternFor, unmask } from './mask'

describe('mask engine', () => {
  it.each([
    ['cpf', '12345678900', '123.456.789-00'],
    ['cpf', '123.456.789-00', '123.456.789-00'],
    ['cep', '01310100', '01310-100'],
    ['date', '07102026', '07/10/2026'],
    ['cnpj', '11222333000181', '11.222.333/0001-81'],
    ['cnpj', '12abc34501de35', '12.ABC.345/01DE-35'],
    ['00.000-0', '123456', '12.345-6'],
  ])('formats %s %s as %s', (mask, value, formatted) => {
    expect(formatMasked(value, mask)).toBe(formatted)
  })

  it('shows only the literals that come before a typed character', () => {
    expect(formatMasked('', 'cep')).toBe('')
    expect(formatMasked('12345', 'cep')).toBe('12345')
    expect(formatMasked('123456', 'cep')).toBe('12345-6')
    expect(formatMasked('1', 'phone')).toBe('(1')
    expect(formatMasked('11', 'phone')).toBe('(11')
    expect(formatMasked('119', 'phone')).toBe('(11) 9')
  })

  it('switches the phone format from 8 to 9 digits', () => {
    expect(formatMasked('1133334444', 'phone')).toBe('(11) 3333-4444')
    expect(formatMasked('11999998888', 'phone')).toBe('(11) 99999-8888')
    expect(maskPatternFor('phone', '1133334444')).toBe('(00) 0000-0000')
    expect(maskPatternFor('phone', '11999998888')).toBe('(00) 00000-0000')
  })

  it('ignores characters that do not fit and cuts what is past the mask', () => {
    expect(formatMasked('12a3.45x6789-00', 'cpf')).toBe('123.456.789-00')
    expect(formatMasked('123456789001234', 'cpf')).toBe('123.456.789-00')
    expect(formatMasked('ab', '00.00')).toBe('')
  })

  it('accepts letters only where the pattern allows them', () => {
    expect(formatMasked('ab1', 'AA-0')).toBe('ab-1')
    expect(formatMasked('1a2', '**-*')).toBe('1a-2')
    // CNPJ: letters and digits in the 12 first positions (upper-cased), digits in the last 2.
    expect(formatMasked('12ABC34501DEXY', 'cnpj')).toBe('12.ABC.345/01DE')
  })

  it('unmasks to the raw value', () => {
    expect(unmask('123.456.789-00', 'cpf')).toBe('12345678900')
    expect(unmask('(11) 99999-8888', 'phone')).toBe('11999998888')
    expect(unmask('12.abc.345/01de-35', 'cnpj')).toBe('12ABC34501DE35')
  })

  it('places the caret after the same number of significant characters', () => {
    // "12345-6": after 5 characters the caret goes before the "-"; after 6, past the 6.
    expect(caretAfter('12345-6', 'cep', 5)).toBe(5)
    expect(caretAfter('12345-6', 'cep', 6)).toBe(7)
    expect(caretAfter('(11) 9', 'phone', 0)).toBe(0)
    expect(caretAfter('(11) 9', 'phone', 2)).toBe(3)
    expect(caretAfter('123.456.789-00', 'cpf', 3)).toBe(3)
  })
})
