// @vitest-environment node
import colorsJson from './colors.json'
import spacingJson from './spacing.json'
import typographyJson from './typography.json'
import bordersJson from './borders.json'
import shadowsJson from './shadows.json'
import { borders, colors, shadows, spacing, themeVariables, typography } from './index'

describe('tokens module', () => {
  it('exposes the JSON tokens, with camelCase names', () => {
    expect(colors.primitive).toEqual(colorsJson.primitive)
    expect(colors.semantic).toEqual(colorsJson.semantic)
    expect(colors.semanticDark).toEqual(colorsJson['semantic-dark'])
    expect(spacing).toEqual(spacingJson)
    expect(typography).toEqual({
      fontFamily: typographyJson['font-family'],
      fontSize: typographyJson['font-size'],
      fontWeight: typographyJson['font-weight'],
      lineHeight: typographyJson['line-height'],
      letterSpacing: typographyJson['letter-spacing'],
    })
    expect(borders).toEqual(bordersJson)
    expect(shadows).toEqual(shadowsJson)
  })

  it('has a resolved CSS variable for every semantic color in the light theme', () => {
    for (const [name, value] of Object.entries(colorsJson.semantic)) {
      expect(themeVariables.light[`--color-${name}`]).toBe(value)
    }
    expect(Object.keys(themeVariables.light)).toHaveLength(Object.keys(colorsJson.semantic).length)
  })

  it('uses the dark values in the dark theme, and the shared ones where there is none', () => {
    const dark: Record<string, string> = colorsJson['semantic-dark']
    for (const [name, lightValue] of Object.entries(colorsJson.semantic)) {
      expect(themeVariables.dark[`--color-${name}`]).toBe(dark[name] ?? lightValue)
    }
    expect(themeVariables.dark['--color-primary']).not.toBe(themeVariables.light['--color-primary'])
  })

  it('never points a variable at another one, so React Native gets plain values', () => {
    for (const value of [
      ...Object.values(themeVariables.light),
      ...Object.values(themeVariables.dark),
    ]) {
      expect(value).not.toContain('var(')
    }
  })
})
