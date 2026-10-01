// Public entry `@indianous/base-ds/tailwind-preset` (issue #57): a Tailwind v3 preset with the same
// utility names as the web (`bg-primary`, `p-4`, `text-lg` …), for NativeWind or a Tailwind v3 app.
// Colors change with the theme, so they read the `--color-*` variables (`themeVariables` from
// `@indianous/base-ds/tokens` sets them); everything else is a plain value, which works in React
// Native without variables.
import type { Config } from 'tailwindcss'
import { borders, colors, shadows, spacing, typography } from './tokens'

const preset: Partial<Config> = {
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
      borderWidth: { ...borders.width, DEFAULT: borders.width['1'] },
    },
  },
}

export default preset
