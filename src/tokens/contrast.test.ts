// @vitest-environment node
/// <reference types="node" />
import { readFileSync } from 'node:fs'
import colors from './colors.json'
import { contrastRatio, isThemeIndependent, MIN_TEXT_CONTRAST, textPairs } from '../theme/contrast'

// Read from disk: Vitest stubs CSS imports (even `?raw`) to an empty string.
const themeCss = readFileSync(new URL('../styles/theme.css', import.meta.url), 'utf8')

// Declarations of a top-level rule in theme.css (`:root { … }`, `.dark { … }`), empty if missing.
function parseBlock(selector: string): Map<string, string> {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const body = new RegExp(`^${escaped} \\{([\\s\\S]*?)^\\}`, 'm').exec(themeCss)?.[1] ?? ''
  return new Map(
    [...body.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(([, name = '', value = '']) => [
      name,
      value.trim(),
    ]),
  )
}

const rootDeclarations = parseBlock(':root')
const darkDeclarations = parseBlock('.dark')

// In the dark theme a token resolves in `.dark` first and falls back to `:root` (the primitives).
const themes = {
  light: rootDeclarations,
  dark: new Map([...rootDeclarations, ...darkDeclarations]),
}
type Theme = keyof typeof themes

function resolveToken(name: string, theme: Theme): string {
  const declarations = themes[theme]
  const value = declarations.get(`--color-${name}`)
  if (value === undefined) throw new Error(`Unknown color token: ${name}`)
  let resolved = value
  for (let reference = /^var\((--[\w-]+)\)$/.exec(resolved); reference;) {
    const next = declarations.get(reference[1] as string)
    if (next === undefined) throw new Error(`Unresolvable reference: ${resolved}`)
    resolved = next
    reference = /^var\((--[\w-]+)\)$/.exec(resolved)
  }
  return resolved.toLowerCase()
}

const semanticDark: Record<string, string> = colors['semantic-dark']

describe.each(['light', 'dark'] as const)('%s theme color tokens', (theme) => {
  it.each(textPairs)('%s on %s meets WCAG AA contrast for text', (foreground, background) => {
    const ratio = contrastRatio(resolveToken(foreground, theme), resolveToken(background, theme))
    expect(ratio).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST)
  })
})

describe('color tokens', () => {
  it('keeps colors.json semantic in sync with the :root block of theme.css', () => {
    const semantic: Record<string, string> = colors.semantic
    const hexTokens = Object.entries(semantic).filter(([, value]) => value.startsWith('#'))
    expect(hexTokens.length).toBeGreaterThan(0)
    for (const [name, value] of hexTokens) {
      expect({ name, value: resolveToken(name, 'light') }).toEqual({
        name,
        value: value.toLowerCase(),
      })
    }
  })

  it('keeps colors.json semantic-dark in sync with the .dark block of theme.css', () => {
    const darkTokens = [...darkDeclarations.keys()]
      .filter((name) => name.startsWith('--color-'))
      .map((name) => name.slice('--color-'.length))
    expect(darkTokens.sort()).toEqual(Object.keys(semanticDark).sort())
    for (const [name, value] of Object.entries(semanticDark)) {
      expect({ name, value: resolveToken(name, 'dark') }).toEqual({
        name,
        value: value.toLowerCase(),
      })
    }
  })

  it('redefines every theme-dependent semantic color in the dark theme', () => {
    const expected = Object.keys(colors.semantic).filter((name) => !isThemeIndependent(name))
    expect(Object.keys(semanticDark).sort()).toEqual(expected.sort())
  })

  it('sets color-scheme for each theme so native controls follow it', () => {
    expect(rootDeclarations.size).toBeGreaterThan(0)
    expect(themeCss).toMatch(/^:root \{[^}]*color-scheme: light;/m)
    expect(themeCss).toMatch(/^\.dark \{[^}]*color-scheme: dark;/m)
  })
})
