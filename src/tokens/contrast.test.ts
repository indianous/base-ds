// @vitest-environment node
/// <reference types="node" />
import { readFileSync } from 'node:fs'
import colors from './colors.json'

// Read from disk: Vitest stubs CSS imports (even `?raw`) to an empty string.
const themeCss = readFileSync(new URL('../styles/theme.css', import.meta.url), 'utf8')

// WCAG AA minimum for normal-size text.
const MIN_TEXT_CONTRAST = 4.5

const declarations = new Map(
  [...themeCss.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(([, name = '', value = '']) => [
    name,
    value.trim(),
  ]),
)

function resolveToken(name: string): string {
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

function relativeLuminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((start) => {
    const channel = parseInt(hex.slice(start, start + 2), 16) / 255
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrastRatio(foreground: string, background: string): number {
  const [lighter, darker] = [relativeLuminance(foreground), relativeLuminance(background)].sort(
    (a, b) => b - a,
  ) as [number, number]
  return (lighter + 0.05) / (darker + 0.05)
}

const statuses = ['primary', 'secondary', 'success', 'warning', 'destructive', 'info']

const textPairs: [foreground: string, background: string][] = [
  ['foreground', 'background'],
  ['muted-foreground', 'background'],
  ['muted-foreground', 'muted'],
  ...statuses.map((status): [string, string] => [`${status}-foreground`, status]),
  ...statuses.map((status): [string, string] => [`${status}-muted-fg`, `${status}-muted`]),
]

describe('color tokens', () => {
  it.each(textPairs)('%s on %s meets WCAG AA contrast for text', (foreground, background) => {
    const ratio = contrastRatio(resolveToken(foreground), resolveToken(background))
    expect(ratio).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST)
  })

  it('keeps colors.json in sync with theme.css', () => {
    const semantic: Record<string, string> = colors.semantic
    const hexTokens = Object.entries(semantic).filter(([, value]) => value.startsWith('#'))
    expect(hexTokens.length).toBeGreaterThan(0)
    for (const [name, value] of hexTokens) {
      expect({ name, value: resolveToken(name) }).toEqual({ name, value: value.toLowerCase() })
    }
  })
})
