import { afterEach, describe, it, expect, vi } from 'vitest'
import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { CardCvcInput, CardExpiryInput, CardNumberInput } from './CardInput'
import type { CardBrand } from '../../../masks/card'
import { FormField } from '../FormField/FormField'

const field = (name: string) => screen.getByRole('textbox', { name }) as HTMLInputElement

describe('CardNumberInput', () => {
  it('groups the digits and reports the raw number', async () => {
    const onValueChange = vi.fn()
    render(<CardNumberInput id="number" aria-label="Number" onValueChange={onValueChange} />)
    await userEvent.type(field('Number'), '4111111111111111')
    expect(field('Number')).toHaveValue('4111 1111 1111 1111')
    expect(onValueChange).toHaveBeenLastCalledWith('4111111111111111', '4111 1111 1111 1111')
  })

  it('groups Amex as 4-6-5 and stops at 15 digits', async () => {
    render(<CardNumberInput id="number" aria-label="Number" />)
    await userEvent.type(field('Number'), '3782822463100051')
    expect(field('Number')).toHaveValue('3782 822463 10005')
  })

  it('reports the brand when it changes', async () => {
    const onBrandChange = vi.fn()
    render(<CardNumberInput id="number" aria-label="Number" onBrandChange={onBrandChange} />)
    await userEvent.type(field('Number'), '4111')
    expect(onBrandChange).toHaveBeenCalledTimes(1)
    expect(onBrandChange).toHaveBeenLastCalledWith('visa')
    await userEvent.clear(field('Number'))
    expect(onBrandChange).toHaveBeenLastCalledWith(undefined)
    await userEvent.type(field('Number'), '34')
    expect(onBrandChange).toHaveBeenLastCalledWith('amex')
  })

  it('shows the brand as text and announces it politely', async () => {
    render(<CardNumberInput id="number" aria-label="Number" />)
    const region = screen.getByRole('status')
    expect(region).toHaveAttribute('aria-live', 'polite')
    expect(region).toHaveTextContent('')
    await userEvent.type(field('Number'), '5555')
    expect(region).toHaveTextContent('Card brand: Mastercard')
    expect(screen.getByText('Mastercard')).toBeInTheDocument()
  })

  it('detects the brand of a controlled value', () => {
    function Controlled() {
      const [value, setValue] = useState('378282246310005')
      return (
        <CardNumberInput id="number" aria-label="Number" value={value} onValueChange={setValue} />
      )
    }
    render(<Controlled />)
    expect(screen.getByRole('status')).toHaveTextContent('Card brand: American Express')
  })

  it('accepts a custom brandLabel', async () => {
    render(
      <CardNumberInput
        id="number"
        aria-label="Número"
        defaultValue="4111"
        brandLabel={(brand) => `Bandeira: ${brand}`}
      />,
    )
    expect(screen.getByRole('status')).toHaveTextContent('Bandeira: visa')
  })

  it('sets the card number autocomplete and numeric keyboard', () => {
    render(<CardNumberInput id="number" aria-label="Number" />)
    expect(field('Number')).toHaveAttribute('autocomplete', 'cc-number')
    expect(field('Number')).toHaveAttribute('inputmode', 'numeric')
  })

  it('has no accessibility violations inside a FormField', async () => {
    const { container } = render(
      <FormField label="Card number" id="number" error="Invalid number">
        <CardNumberInput id="number" defaultValue="4111" />
      </FormField>,
    )
    expect(field('Card number')).toHaveAttribute('aria-invalid', 'true')
    expect(field('Card number')).toHaveAttribute('aria-describedby')
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('CardExpiryInput', () => {
  it('formats MM/YY', async () => {
    render(<CardExpiryInput id="expiry" aria-label="Expiry" />)
    await userEvent.type(field('Expiry'), '1230')
    expect(field('Expiry')).toHaveValue('12/30')
    expect(field('Expiry')).toHaveAttribute('autocomplete', 'cc-exp')
    expect(field('Expiry')).toHaveAttribute('placeholder', 'MM/YY')
  })

  it('turns a pasted MM/YYYY into MM/YY', async () => {
    const onValueChange = vi.fn()
    render(<CardExpiryInput id="expiry" aria-label="Expiry" onValueChange={onValueChange} />)
    field('Expiry').focus()
    await userEvent.paste('12/2030')
    expect(field('Expiry')).toHaveValue('12/30')
    expect(onValueChange).toHaveBeenLastCalledWith('1230', '12/30')
  })

  it('adds the leading zero of the month', async () => {
    render(<CardExpiryInput id="expiry" aria-label="Expiry" />)
    await userEvent.type(field('Expiry'), '530')
    expect(field('Expiry')).toHaveValue('05/30')
  })

  it('accepts a placeholder in another language', () => {
    render(<CardExpiryInput id="expiry" aria-label="Validade" placeholder="MM/AA" />)
    expect(field('Validade')).toHaveAttribute('placeholder', 'MM/AA')
  })
})

describe('CardCvcInput', () => {
  it.each<[CardBrand | undefined, string]>([
    ['visa', '123'],
    [undefined, '123'],
    ['amex', '1234'],
  ])('keeps the digits a %s code has', async (brand, expected) => {
    render(<CardCvcInput id="cvc" aria-label="CVC" brand={brand} />)
    await userEvent.type(field('CVC'), '12345')
    expect(field('CVC')).toHaveValue(expected)
    expect(field('CVC')).toHaveAttribute('maxlength', String(expected.length))
  })

  it('sets the security code autocomplete and hides the code when printing', () => {
    render(<CardCvcInput id="cvc" aria-label="CVC" />)
    expect(field('CVC')).toHaveAttribute('autocomplete', 'cc-csc')
    expect(field('CVC')).toHaveAttribute('inputmode', 'numeric')
    expect(field('CVC').className).toContain('print:text-transparent')
  })
})

describe('card inputs', () => {
  afterEach(() => vi.restoreAllMocks())

  it('keep nothing outside the field while typing', async () => {
    const methods = ['log', 'info', 'warn', 'error', 'debug'] as const
    const consoleSpies = methods.map((method) => vi.spyOn(console, method))
    const setItem = vi.spyOn(Storage.prototype, 'setItem')
    const { container } = render(
      <>
        <CardNumberInput id="number" aria-label="Number" />
        <CardExpiryInput id="expiry" aria-label="Expiry" />
        <CardCvcInput id="cvc" aria-label="CVC" />
      </>,
    )
    await userEvent.type(field('Number'), '4111111111111111')
    await userEvent.type(field('Expiry'), '1230')
    await userEvent.type(field('CVC'), '123')

    for (const spy of consoleSpies) expect(spy).not.toHaveBeenCalled()
    expect(setItem).not.toHaveBeenCalled()
    expect(localStorage.length).toBe(0)
    expect(sessionStorage.length).toBe(0)
    // No attribute of the components holds the values (React itself mirrors a controlled input's
    // value in its `value` attribute, as in any React form).
    const attributes = [...container.querySelectorAll('*')].flatMap((element) =>
      [...element.attributes]
        .filter((attribute) => attribute.name !== 'value')
        .map((attribute) => attribute.value),
    )
    for (const secret of ['4111', '1230', '12/30', '123']) {
      expect(attributes.filter((value) => value.includes(secret))).toEqual([])
    }
  })
})
