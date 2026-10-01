// Public entry `@indianous/base-ds/tokens` (issue #57): the design tokens as plain data, with no
// React or DOM, so a React Native app, a build script or a Server Component can import them.
import colorsJson from './colors.json'
import spacingJson from './spacing.json'
import typographyJson from './typography.json'
import bordersJson from './borders.json'
import shadowsJson from './shadows.json'

export const colors = {
  primitive: colorsJson.primitive,
  /** Semantic colors of the light theme. */
  semantic: colorsJson.semantic,
  /** Semantic colors of the dark theme (only the ones that change with the theme). */
  semanticDark: colorsJson['semantic-dark'],
}

export const spacing = spacingJson

export const typography = {
  fontFamily: typographyJson['font-family'],
  fontSize: typographyJson['font-size'],
  fontWeight: typographyJson['font-weight'],
  lineHeight: typographyJson['line-height'],
  letterSpacing: typographyJson['letter-spacing'],
}

export const borders = bordersJson

export const shadows = shadowsJson

export type ThemeVariables = Record<`--color-${string}`, string>

function toVariables(semanticColors: Record<string, string>): ThemeVariables {
  return Object.fromEntries(
    Object.entries(semanticColors).map(([name, value]) => [`--color-${name}`, value]),
  ) as ThemeVariables
}

/**
 * The semantic color variables of each theme, with plain values (no `var()` pointing at another
 * variable). In React Native with NativeWind, apply them at the root with
 * `vars(themeVariables[colorScheme])`; the Tailwind preset's colors read these variables.
 */
export const themeVariables: { light: ThemeVariables; dark: ThemeVariables } = {
  light: toVariables(colors.semantic),
  dark: toVariables({ ...colors.semantic, ...colors.semanticDark }),
}
