// Contrast rules of the design system, shared by `src/tokens/contrast.test.ts` (base-ds's own
// tokens) and `buildTheme` (an app's theme config): one place, so a new rule applies to both.

/** WCAG AA minimum for normal-size text. */
export const MIN_TEXT_CONTRAST = 4.5

function relativeLuminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((start) => {
    const channel = parseInt(hex.slice(start, start + 2), 16) / 255
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** WCAG contrast ratio between two `#rrggbb` colors, in either order. */
export function contrastRatio(foreground: string, background: string): number {
  const [lighter, darker] = [relativeLuminance(foreground), relativeLuminance(background)].sort(
    (a, b) => b - a,
  ) as [number, number]
  return (lighter + 0.05) / (darker + 0.05)
}

const statuses = ['primary', 'secondary', 'success', 'warning', 'destructive', 'info']

const codeTextTokens = [
  'code-foreground',
  ...[
    'comment',
    'keyword',
    'string',
    'string-expression',
    'constant',
    'function',
    'parameter',
    'punctuation',
    'link',
  ].map((token) => `code-token-${token}`),
]

/** Semantic color pairs (text on background) that must meet `MIN_TEXT_CONTRAST` in both themes. */
export const textPairs: readonly [foreground: string, background: string][] = [
  ['foreground', 'background'],
  ['muted-foreground', 'background'],
  ['muted-foreground', 'muted'],
  ...statuses.map((status): [string, string] => [`${status}-foreground`, status]),
  ...statuses.map((status): [string, string] => [`${status}-foreground`, `${status}-hover`]),
  ...statuses.map((status): [string, string] => [`${status}-muted-fg`, `${status}-muted`]),
  // Statuses used as text (`text-primary`, `text-destructive` …) on the page background.
  ...statuses.map((status): [string, string] => [status, 'background']),
  // Code highlighting (issue #59): every token is text on the code block's background.
  ...codeTextTokens.map((token): [string, string] => [token, 'code-background']),
]

/** Semantic colors that are the same in both themes, so `.dark` doesn't redefine them. */
export const isThemeIndependent = (name: string) => name === 'overlay' || name.startsWith('chart-')
