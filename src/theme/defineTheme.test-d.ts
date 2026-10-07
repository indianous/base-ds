// Type-level checks, run by `npm run typecheck` (no runtime test).
import { defineTheme } from './index'

defineTheme({
  colors: { light: { primary: 'violet-600', background: '#fff' }, dark: { primary: '#a78bfa' } },
  spacing: { 4: '18px', '0.5': '3px' },
  fontFamily: { sans: 'Inter, sans-serif' },
})

// @ts-expect-error unknown semantic color
defineTheme({ colors: { light: { primry: 'violet-600' } } })

// @ts-expect-error color outside the palette
defineTheme({ colors: { light: { primary: 'purple-600' } } })

// @ts-expect-error `overlay` is the same in both themes, so it can't be set for dark only
defineTheme({ colors: { dark: { overlay: '#000000' } } })

// @ts-expect-error unknown spacing step
defineTheme({ spacing: { 13: '52px' } })
