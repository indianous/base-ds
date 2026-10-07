// Public entry `@indianous/base-ds/tailwind-preset` (issue #57): a Tailwind v3 preset with the same
// utility names as the web (`bg-primary`, `p-4`, `text-lg` …), for NativeWind or a Tailwind v3 app.
// Colors change with the theme, so they read the `--color-*` variables (`themeVariables` from
// `@indianous/base-ds/tokens` sets them); everything else is a plain value, which works in React
// Native without variables. An app with a theme config uses `createTailwindPreset` from
// `@indianous/base-ds/theme` instead.
import { borders, shadows, spacing, typography } from './tokens'
import { presetFromTokens } from './theme/preset'

const preset = presetFromTokens({ spacing, typography, borders, shadows })

export default preset
