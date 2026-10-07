// @vitest-environment node
/// <reference types="node" />
import { readFileSync } from 'node:fs'
import colors from '../tokens/colors.json'
import { themeVariables } from '../tokens'
import { buildTheme, defineTheme } from './index'

describe('buildTheme', () => {
  it('generates no declarations and the base-ds values for an empty config', () => {
    const { css, json, errors, warnings } = buildTheme(defineTheme({}))
    expect(errors).toEqual([])
    expect(warnings).toEqual([])
    expect(css).not.toMatch(/--[\w-]+:/)
    expect(json.themeVariables).toEqual(themeVariables)
  })

  it('writes a palette color as a variable in CSS and as hex in the JSON', () => {
    const { css, json, errors } = buildTheme(
      defineTheme({
        colors: {
          light: { primary: 'violet-700', 'primary-hover': 'violet-800' },
          dark: { primary: 'violet-400', 'primary-hover': 'violet-300' },
        },
      }),
    )
    expect(errors).toEqual([])
    expect(css).toMatch(/:root \{[^}]*--color-primary: var\(--color-violet-700\);/)
    expect(css).toMatch(/\.dark \{[^}]*--color-primary: var\(--color-violet-400\);/)
    expect(json.themeVariables.light['--color-primary']).toBe(colors.primitive.violet['700'])
    expect(json.themeVariables.dark['--color-primary']).toBe(colors.primitive.violet['400'])
  })

  it('accepts hex colors, also in the short form', () => {
    const { css, json, errors } = buildTheme(
      defineTheme({ colors: { light: { foreground: '#000' }, dark: { foreground: '#fafafa' } } }),
    )
    expect(errors).toEqual([])
    expect(css).toContain('--color-foreground: #000;')
    expect(json.themeVariables.light['--color-foreground']).toBe('#000000')
  })

  it('applies a color that is the same in both themes to both', () => {
    const { json, warnings } = buildTheme(
      defineTheme({ colors: { light: { 'chart-1': '#1d4ed8' } } }),
    )
    expect(warnings).toEqual([])
    expect(json.themeVariables.dark['--color-chart-1']).toBe('#1d4ed8')
  })

  it('reports unknown tokens and invalid colors', () => {
    const { errors } = buildTheme({
      colors: { light: { primry: 'violet-600', primary: 'purple-600', secondary: '#12345' } },
      spacing: { 13: '52px' },
    } as never)
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining('colors.light.primry'),
        expect.stringContaining('purple-600'),
        expect.stringContaining('#12345'),
        expect.stringContaining('spacing.13'),
      ]),
    )
  })

  it('reports a contrast failure with the pair, the theme and the ratio', () => {
    const { errors } = buildTheme(
      defineTheme({
        colors: { light: { primary: 'blue-300' }, dark: { primary: 'blue-400' } },
      }),
    )
    expect(errors).toContainEqual(
      expect.stringMatching(/primary-foreground sobre primary \(claro\): \d+,\d+:1/),
    )
  })

  it('warns when a theme-dependent color is changed only in the light theme', () => {
    const config = defineTheme({ colors: { light: { primary: 'violet-700' } } })
    const relaxed = buildTheme(config)
    expect(relaxed.errors).toEqual([])
    expect(relaxed.warnings).toContainEqual(expect.stringContaining('colors.dark.primary'))
    const strict = buildTheme(config, { strict: true })
    expect(strict.errors).toContainEqual(expect.stringContaining('colors.dark.primary'))
  })

  it('writes non-color tokens to CSS and to the JSON', () => {
    const { css, json, errors } = buildTheme(
      defineTheme({
        fontFamily: { sans: "'Inter', sans-serif" },
        fontSize: { lg: '1.25rem' },
        spacing: { '0.5': '3px', 4: '18px' },
        radius: { md: '8px' },
        borderWidth: { 2: '3px' },
        shadow: { md: 'none' },
      }),
    )
    expect(errors).toEqual([])
    for (const declaration of [
      "--font-sans: 'Inter', sans-serif;",
      '--text-lg: 1.25rem;',
      '--spacing-0-5: 3px;',
      '--spacing-4: 18px;',
      '--radius-md: 8px;',
      '--border-2: 3px;',
      '--shadow-md: none;',
    ]) {
      expect(css).toContain(declaration)
    }
    expect(json.spacing['4']).toBe('18px')
    expect(json.typography.fontFamily.sans).toBe("'Inter', sans-serif")
    expect(json.borders.radius.md).toBe('8px')
  })

  it('rejects values that would break the CSS file', () => {
    const { errors } = buildTheme(defineTheme({ spacing: { 4: '18px; } body { color: red' } }))
    expect(errors).toContainEqual(expect.stringContaining('spacing.4'))
  })

  it('overrides the base-ds values when appended after theme.css', () => {
    const themeCss = readFileSync(new URL('../styles/theme.css', import.meta.url), 'utf8')
    const { css } = buildTheme(
      defineTheme({ colors: { light: { primary: '#5b21b6' }, dark: { primary: '#c4b5fd' } } }),
    )
    const cascade = (selector: string) =>
      [...(themeCss + css).matchAll(new RegExp(`^${selector} \\{([\\s\\S]*?)^\\}`, 'gm'))]
        .flatMap(([, body = '']) => [...body.matchAll(/--color-primary:\s*([^;]+);/g)])
        .map(([, value]) => value)
        .at(-1)
    expect(cascade(':root')).toBe('#5b21b6')
    expect(cascade('\\.dark')).toBe('#c4b5fd')
  })
})
