// @vitest-environment node
import tailwindcss from 'tailwindcss'
import postcss from 'postcss'
import preset from './tailwind-preset'

// The web's tailwind.config.js, loaded at runtime (it's plain JS, outside the typed sources).
const webConfigUrl = new URL('../tailwind.config.js', import.meta.url).href
const loadWebConfig = async (): Promise<{ theme: { extend: Record<string, unknown> } }> =>
  (await import(/* @vite-ignore */ webConfigUrl)).default

// Tailwind turns nested color groups into dash-joined names (`primary.foreground` →
// `primary-foreground`, `primary.DEFAULT` → `primary`), so compare the flattened names.
function flattenColorNames(colors: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(colors).flatMap(([key, value]) => {
    const name = key === 'DEFAULT' ? prefix : prefix ? `${prefix}-${key}` : key
    return typeof value === 'object' && value !== null
      ? flattenColorNames(value as Record<string, unknown>, name)
      : [name]
  })
}

const extend = preset.theme?.extend as Record<string, Record<string, unknown>>

async function generate(classes: string): Promise<string> {
  const result = await postcss([
    tailwindcss({
      presets: [preset],
      content: [{ raw: `<div class="${classes}"></div>`, extension: 'html' }],
      corePlugins: { preflight: false },
    }),
  ]).process('@tailwind utilities;', { from: undefined })
  return result.css
}

describe('tailwind preset', () => {
  it('has the same color names as the web config', async () => {
    const web = await loadWebConfig()
    const webColors = flattenColorNames(web.theme.extend.colors as Record<string, unknown>)
    expect(Object.keys(extend.colors ?? {}).sort()).toEqual(webColors.sort())
  })

  it.each([
    'spacing',
    'fontFamily',
    'fontSize',
    'fontWeight',
    'lineHeight',
    'letterSpacing',
    'boxShadow',
    'borderRadius',
    'borderWidth',
  ])('has the same %s keys as the web config', async (key) => {
    const web = await loadWebConfig()
    const webKeys = Object.keys(web.theme.extend[key] as Record<string, unknown>)
    expect(Object.keys(extend[key] ?? {}).sort()).toEqual(webKeys.sort())
  })

  it('uses CSS variables for colors only, and plain values for the rest', () => {
    for (const value of Object.values(extend.colors ?? {})) {
      expect(value).toMatch(/^var\(--color-[\w-]+\)$/)
    }
    for (const [key, group] of Object.entries(extend)) {
      if (key === 'colors') continue
      expect(JSON.stringify(group)).not.toContain('var(')
    }
  })

  it('generates utilities with the token values when compiled by Tailwind v3', async () => {
    const css = await generate('bg-primary text-primary-foreground p-4 text-lg rounded-md')
    expect(css).toContain('background-color: var(--color-primary)')
    expect(css).toContain('color: var(--color-primary-foreground)')
    expect(css).toContain('padding: 16px')
    expect(css).toContain('font-size: 1.125rem')
    expect(css).toContain('border-radius: 6px')
  })
})
