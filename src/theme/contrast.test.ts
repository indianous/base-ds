// @vitest-environment node
import { contrastRatio, isThemeIndependent, MIN_TEXT_CONTRAST, textPairs } from './contrast'

describe('contrast', () => {
  it('computes WCAG contrast ratios', () => {
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 5)
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5)
    expect(contrastRatio('#2563eb', '#2563eb')).toBe(1)
    expect(contrastRatio('#ffffff', '#2563eb')).toBeCloseTo(5.17, 2)
  })

  it('uses the WCAG AA minimum for normal-size text', () => {
    expect(MIN_TEXT_CONTRAST).toBe(4.5)
  })

  it('lists the foreground/background pairs the design system guarantees', () => {
    expect(textPairs).toContainEqual(['foreground', 'background'])
    expect(textPairs).toContainEqual(['primary-foreground', 'primary-hover'])
    expect(textPairs).toContainEqual(['destructive', 'background'])
    expect(textPairs).toContainEqual(['code-token-keyword', 'code-background'])
  })

  it('knows which colors are the same in both themes', () => {
    expect(isThemeIndependent('overlay')).toBe(true)
    expect(isThemeIndependent('chart-1')).toBe(true)
    expect(isThemeIndependent('primary')).toBe(false)
  })
})
