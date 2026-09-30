// @vitest-environment node
/// <reference types="node" />
import { readFileSync } from 'node:fs'

// Read from disk: Vitest stubs CSS imports (even `?raw`) to an empty string.
const themeV4Css = readFileSync(new URL('./theme-v4.css', import.meta.url), 'utf8')

describe('theme-v4.css', () => {
  it('ties the dark: variant to the .dark class of the dark theme', () => {
    expect(themeV4Css).toContain('@custom-variant dark (&:where(.dark, .dark *));')
  })
})
