// @vitest-environment node
import { isValidCnpj, isValidCpf } from './documents'

describe('isValidCpf', () => {
  it.each(['529.982.247-25', '52998224725', '111.444.777-35'])('accepts %s', (cpf) => {
    expect(isValidCpf(cpf)).toBe(true)
  })

  it.each(['529.982.247-24', '111.111.111-11', '000.000.000-00', '1234567890', '', 'abc'])(
    'rejects %s',
    (cpf) => {
      expect(isValidCpf(cpf)).toBe(false)
    },
  )
})

describe('isValidCnpj', () => {
  it.each(['11.222.333/0001-81', '11222333000181', '12.ABC.345/01DE-35', '12abc34501de35'])(
    'accepts %s (numeric and alphanumeric)',
    (cnpj) => {
      expect(isValidCnpj(cnpj)).toBe(true)
    },
  )

  it.each([
    '11.222.333/0001-82',
    '12.ABC.345/01DE-36',
    '11.111.111/1111-11',
    '12ABC34501DEAB',
    '1122233300018',
    '',
  ])('rejects %s', (cnpj) => {
    expect(isValidCnpj(cnpj)).toBe(false)
  })
})
