// CPF and CNPJ check digits (issue #64). The CNPJ can be alphanumeric since 2026 (IN RFB
// nº 2.229/2024): each character counts as its ASCII code minus 48 (A = 17, B = 18 …), and the
// check digits stay numeric, computed with modulo 11 as before.

function checkDigit(values: number[], weights: number[]): number {
  const sum = values.reduce((total, value, index) => total + value * (weights[index] ?? 0), 0)
  const rest = sum % 11
  return rest < 2 ? 0 : 11 - rest
}

/** Whether a CPF (formatted or not) has valid check digits. */
export function isValidCpf(value: string): boolean {
  const digits = value.replace(/\D/g, '')
  if (!/^\d{11}$/.test(digits) || /^(\d)\1{10}$/.test(digits)) return false
  const numbers = [...digits].map(Number)
  const first = checkDigit(numbers.slice(0, 9), [10, 9, 8, 7, 6, 5, 4, 3, 2])
  const second = checkDigit(numbers.slice(0, 10), [11, 10, 9, 8, 7, 6, 5, 4, 3, 2])
  return first === numbers[9] && second === numbers[10]
}

/** Whether a CNPJ (numeric or alphanumeric, formatted or not) has valid check digits. */
export function isValidCnpj(value: string): boolean {
  const cnpj = value.replace(/[.\-/\s]/g, '').toUpperCase()
  if (!/^[0-9A-Z]{12}\d{2}$/.test(cnpj) || /^(.)\1{13}$/.test(cnpj)) return false
  const values = [...cnpj].map((char) => char.charCodeAt(0) - 48)
  const first = checkDigit(values.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
  const second = checkDigit(values.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
  return first === values[12] && second === values[13]
}
