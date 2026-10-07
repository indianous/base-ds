// Public entry `@indianous/base-ds/theme`: an app's theme config (`base-ds.config.ts`), validated
// and turned into a CSS file for the web and a JSON file for React Native. Plain data, no React.
import type { Config } from 'tailwindcss'
import { borders, colors, shadows, spacing, themeVariables, typography } from '../tokens'
import type { ThemeVariables } from '../tokens'
import { contrastRatio, isThemeIndependent, MIN_TEXT_CONTRAST, textPairs } from './contrast'
import { presetFromTokens } from './preset'
import type { PresetTokens } from './preset'

type Primitive = typeof colors.primitive

/** A color of the base-ds palette, e.g. `'violet-600'`. */
export type PaletteColor = {
  [Family in keyof Primitive]: `${Family}-${Extract<keyof Primitive[Family], string>}`
}[keyof Primitive]

/** A palette color or a hex color (`#rgb` / `#rrggbb`). */
export type ThemeColor = PaletteColor | `#${string}`

type LightColorName = keyof typeof colors.semantic
type DarkColorName = keyof typeof colors.semanticDark

export interface ThemeConfig {
  colors?: {
    /** Semantic colors of the light theme. The ones that don't change with the theme also apply to dark. */
    light?: Partial<Record<LightColorName, ThemeColor>>
    /** Semantic colors of the dark theme (only the ones that change with the theme). */
    dark?: Partial<Record<DarkColorName, ThemeColor>>
  }
  fontFamily?: Partial<Record<keyof typeof typography.fontFamily, string>>
  fontSize?: Partial<Record<keyof typeof typography.fontSize, string>>
  fontWeight?: Partial<Record<keyof typeof typography.fontWeight, string>>
  lineHeight?: Partial<Record<keyof typeof typography.lineHeight, string>>
  letterSpacing?: Partial<Record<keyof typeof typography.letterSpacing, string>>
  spacing?: Partial<Record<keyof typeof spacing, string>>
  radius?: Partial<Record<keyof typeof borders.radius, string>>
  borderWidth?: Partial<Record<keyof typeof borders.width, string>>
  shadow?: Partial<Record<keyof typeof shadows, string>>
  /** Where `base-ds-theme` writes the generated files, relative to the config file. */
  output?: { css?: string; json?: string }
}

/** Identity function that gives the config file its types (autocomplete, unknown tokens). */
export function defineTheme(config: ThemeConfig): ThemeConfig {
  return config
}

/** The JSON `base-ds-theme` writes: what a React Native app needs (`vars()`, the preset). */
export interface ThemeJson extends PresetTokens {
  themeVariables: { light: ThemeVariables; dark: ThemeVariables }
}

export interface ThemeBuild {
  /** CSS to import after `@indianous/base-ds/styles`, with only the customized variables. */
  css: string
  json: ThemeJson
  errors: string[]
  warnings: string[]
}

export interface BuildThemeOptions {
  /** Treats warnings (a color changed only in the light theme) as errors. */
  strict?: boolean
}

type TokenGroup = Exclude<keyof ThemeConfig, 'colors' | 'output'>

// Each non-color group: its base values and the CSS variable of a key (same names as theme.css).
const tokenGroups: Record<
  TokenGroup,
  { values: Record<string, string>; variable: (key: string) => string }
> = {
  fontFamily: { values: typography.fontFamily, variable: (key) => `--font-${key}` },
  fontSize: { values: typography.fontSize, variable: (key) => `--text-${key}` },
  fontWeight: { values: typography.fontWeight, variable: (key) => `--font-weight-${key}` },
  lineHeight: { values: typography.lineHeight, variable: (key) => `--leading-${key}` },
  letterSpacing: { values: typography.letterSpacing, variable: (key) => `--tracking-${key}` },
  spacing: { values: spacing, variable: (key) => `--spacing-${key.replace('.', '-')}` },
  radius: { values: borders.radius, variable: (key) => `--radius-${key}` },
  borderWidth: { values: borders.width, variable: (key) => `--border-${key}` },
  shadow: { values: shadows, variable: (key) => `--shadow-${key}` },
}

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i
// Characters that would end the declaration or the rule in the generated CSS.
const UNSAFE_CSS = /[;{}\n\r]/

const lightColors: Record<string, string> = colors.semantic
const darkColors: Record<string, string> = colors.semanticDark
const primitive = colors.primitive as Record<string, Record<string, string>>

/** `{ css, hex }` of a config color, or undefined if it isn't one. */
function resolveColor(value: unknown): { css: string; hex: string } | undefined {
  if (typeof value !== 'string') return undefined
  if (HEX.test(value)) {
    const digits = value.slice(1).toLowerCase()
    const full = digits.length === 3 ? [...digits].map((digit) => digit + digit).join('') : digits
    return { css: value, hex: `#${full}` }
  }
  const [family, shade, ...rest] = value.split('-')
  const hex = rest.length === 0 && family && shade ? primitive[family]?.[shade] : undefined
  return hex ? { css: `var(--color-${value})`, hex } : undefined
}

const formatRatio = (ratio: number) => ratio.toFixed(2).replace('.', ',')

/**
 * Validates an app's theme config and generates its files. Pure: `base-ds-theme` writes what it
 * returns, and an app can call it from its own build script.
 */
export function buildTheme(config: ThemeConfig, options: BuildThemeOptions = {}): ThemeBuild {
  const errors: string[] = []
  const warnings: string[] = []
  const rootDeclarations: string[] = []
  const darkDeclarations: string[] = []

  // Colors: CSS declarations, and the hex of each customized one for the JSON and the contrast check.
  const lightHex: Record<string, string> = {}
  const darkHex: Record<string, string> = {}
  const colorThemes = [
    ['light', config.colors?.light, lightColors, rootDeclarations, lightHex],
    ['dark', config.colors?.dark, darkColors, darkDeclarations, darkHex],
  ] as const
  for (const [theme, overrides, known, declarations, hexes] of colorThemes) {
    for (const [name, value] of Object.entries(overrides ?? {})) {
      const path = `colors.${theme}.${name}`
      if (!(name in known)) {
        errors.push(`${path}: token de cor desconhecido`)
        continue
      }
      const color = resolveColor(value)
      if (!color) {
        errors.push(`${path}: "${String(value)}" não é uma cor da paleta (ex.: violet-600) nem hex`)
        continue
      }
      declarations.push(`  --color-${name}: ${color.css};`)
      hexes[name] = color.hex
    }
  }

  // A theme-dependent color changed only in light keeps base-ds's value in dark.
  for (const name of Object.keys(config.colors?.light ?? {})) {
    if (!(name in lightColors) || isThemeIndependent(name) || name in darkHex) continue
    const message = `colors.light.${name} mudou só no tema claro: defina também colors.dark.${name} (o escuro continua com o valor do base-ds)`
    ;(options.strict ? errors : warnings).push(message)
  }

  // Final colors of each theme. Light overrides of theme-independent colors also apply to dark,
  // as in the CSS, where `.dark` doesn't redefine them.
  const sharedHex = Object.fromEntries(
    Object.entries(lightHex).filter(([name]) => isThemeIndependent(name)),
  )
  const finalLight = { ...lightColors, ...lightHex }
  const finalDark = { ...lightColors, ...sharedHex, ...darkColors, ...darkHex }

  // Contrast: the same pairs base-ds guarantees for its own tokens.
  for (const [label, palette] of [
    ['claro', finalLight],
    ['escuro', finalDark],
  ] as const) {
    for (const [foreground, background] of textPairs) {
      const fg = palette[foreground]
      const bg = palette[background]
      if (!fg || !bg || !HEX.test(fg) || !HEX.test(bg)) continue
      const ratio = contrastRatio(fg, bg)
      if (ratio < MIN_TEXT_CONTRAST) {
        errors.push(
          `${foreground} sobre ${background} (${label}): ${formatRatio(ratio)}:1, mínimo ${formatRatio(MIN_TEXT_CONTRAST)}:1`,
        )
      }
    }
  }

  // Non-color tokens: same names as theme.css, plain CSS values.
  const finalGroups = {} as Record<TokenGroup, Record<string, string>>
  for (const [group, { values, variable }] of Object.entries(tokenGroups) as [
    TokenGroup,
    (typeof tokenGroups)[TokenGroup],
  ][]) {
    finalGroups[group] = { ...values }
    for (const [key, value] of Object.entries(config[group] ?? {})) {
      const path = `${group}.${key}`
      if (!(key in values)) {
        errors.push(`${path}: token desconhecido`)
        continue
      }
      if (typeof value !== 'string' || value.trim() === '' || UNSAFE_CSS.test(value)) {
        errors.push(`${path}: valor CSS inválido`)
        continue
      }
      rootDeclarations.push(`  ${variable(key)}: ${value};`)
      finalGroups[group][key] = value
    }
  }

  const toVariables = (palette: Record<string, string>) =>
    Object.fromEntries(
      Object.entries(palette).map(([name, value]) => [`--color-${name}`, value]),
    ) as ThemeVariables

  const header = '/* Gerado por base-ds-theme a partir do base-ds.config. Não edite. */\n'
  const block = (selector: string, declarations: string[]) =>
    declarations.length > 0 ? `\n${selector} {\n${declarations.join('\n')}\n}\n` : ''

  return {
    css: header + block(':root', rootDeclarations) + block('.dark', darkDeclarations),
    json: {
      themeVariables:
        Object.keys(lightHex).length + Object.keys(darkHex).length === 0
          ? themeVariables
          : { light: toVariables(finalLight), dark: toVariables(finalDark) },
      spacing: finalGroups.spacing,
      typography: {
        fontFamily: finalGroups.fontFamily,
        fontSize: finalGroups.fontSize,
        fontWeight: finalGroups.fontWeight,
        lineHeight: finalGroups.lineHeight,
        letterSpacing: finalGroups.letterSpacing,
      },
      borders: { radius: finalGroups.radius, width: finalGroups.borderWidth },
      shadows: finalGroups.shadow,
    },
    errors,
    warnings,
  }
}

/**
 * The Tailwind v3 preset (NativeWind) with the non-color values of a theme — the JSON
 * `base-ds-theme` writes. Without a theme, it's the same as `@indianous/base-ds/tailwind-preset`.
 */
export function createTailwindPreset(theme?: PresetTokens): Partial<Config> {
  return presetFromTokens(theme ?? { spacing, typography, borders, shadows })
}

export type { PresetTokens }
