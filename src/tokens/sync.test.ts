// @vitest-environment node
/// <reference types="node" />
import { readFileSync } from 'node:fs'
import spacing from './spacing.json'
import typography from './typography.json'
import borders from './borders.json'
import shadows from './shadows.json'

// The Tailwind preset is generated from these JSON files and the web uses theme.css, so the two
// must hold the same values for mobile and web to look the same (issue #57). colors.json is
// covered by contrast.test.ts.
const themeCss = readFileSync(new URL('../styles/theme.css', import.meta.url), 'utf8')
const rootBody = /^:root \{([\s\S]*?)^\}/m.exec(themeCss)?.[1] ?? ''
const declarations = new Map(
  [...rootBody.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(([, name = '', value = '']) => [
    name,
    value.replace(/\s+/g, ' ').trim(),
  ]),
)

const groups: [title: string, values: Record<string, string>, variable: (key: string) => string][] =
  [
    ['spacing', spacing, (key) => `--spacing-${key.replace('.', '-')}`],
    ['font families', typography['font-family'], (key) => `--font-${key}`],
    ['font sizes', typography['font-size'], (key) => `--text-${key}`],
    ['font weights', typography['font-weight'], (key) => `--font-weight-${key}`],
    ['line heights', typography['line-height'], (key) => `--leading-${key}`],
    ['letter spacing', typography['letter-spacing'], (key) => `--tracking-${key}`],
    ['border radius', borders.radius, (key) => `--radius-${key}`],
    ['border widths', borders.width, (key) => `--border-${key}`],
    ['shadows', shadows, (key) => `--shadow-${key}`],
  ]

describe('non-color tokens', () => {
  it.each(groups)(
    'keeps the %s of the JSON tokens in sync with theme.css',
    (_, values, variable) => {
      for (const [key, value] of Object.entries(values)) {
        expect({ key, value: declarations.get(variable(key)) }).toEqual({ key, value })
      }
    },
  )
})
