// @vitest-environment node
import basePreset from '../tailwind-preset'
import { buildTheme, createTailwindPreset, defineTheme } from './index'

describe('createTailwindPreset', () => {
  it('is the base preset without a theme', () => {
    expect(createTailwindPreset()).toEqual(basePreset)
  })

  it('uses the non-color values of a theme and keeps colors as variables', () => {
    const { json } = buildTheme(defineTheme({ spacing: { 4: '18px' }, radius: { md: '8px' } }))
    const extend = createTailwindPreset(json).theme?.extend as Record<
      string,
      Record<string, unknown>
    >
    expect(extend.spacing?.['4']).toBe('18px')
    expect(extend.borderRadius?.md).toBe('8px')
    expect(extend.colors?.primary).toBe('var(--color-primary)')
  })
})
