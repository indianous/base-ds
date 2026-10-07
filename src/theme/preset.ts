import type { Config } from 'tailwindcss'
import { colors } from '../tokens'

/** The non-color tokens a Tailwind preset is built from (`@indianous/base-ds/tokens` shape). */
export interface PresetTokens {
  spacing: Record<string, string>
  typography: {
    fontFamily: Record<string, string>
    fontSize: Record<string, string>
    fontWeight: Record<string, string>
    lineHeight: Record<string, string>
    letterSpacing: Record<string, string>
  }
  borders: { radius: Record<string, string>; width: Record<string, string> }
  shadows: Record<string, string>
}

// Colors change with the theme, so they read the `--color-*` variables; everything else is a
// plain value, which works in React Native without variables (issue #57).
export function presetFromTokens({
  spacing,
  typography,
  borders,
  shadows,
}: PresetTokens): Partial<Config> {
  return {
    theme: {
      extend: {
        colors: Object.fromEntries(
          Object.keys(colors.semantic).map((name) => [name, `var(--color-${name})`]),
        ),
        spacing,
        fontFamily: Object.fromEntries(
          Object.entries(typography.fontFamily).map(([name, stack]) => [name, [stack]]),
        ),
        fontSize: typography.fontSize,
        fontWeight: typography.fontWeight,
        lineHeight: typography.lineHeight,
        letterSpacing: typography.letterSpacing,
        boxShadow: shadows,
        borderRadius: borders.radius,
        borderWidth: { ...borders.width, DEFAULT: borders.width['1'] ?? '1px' },
      },
    },
  }
}
