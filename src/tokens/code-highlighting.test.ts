// @vitest-environment node
/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { codeToHtml, createCssVariablesTheme } from 'shiki'

// The README tells apps to highlight with Shiki's `css-variables` theme and this prefix, so every
// variable Shiki writes must be a token in both themes (issue #59).
const themeCss = readFileSync(new URL('../styles/theme.css', import.meta.url), 'utf8')

function declaredIn(selector: ':root' | '.dark'): Set<string> {
  const escaped = selector.replace('.', '\\.')
  const body = new RegExp(`^${escaped} \\{([\\s\\S]*?)^\\}`, 'm').exec(themeCss)?.[1] ?? ''
  return new Set([...body.matchAll(/(--[\w-]+):/g)].map(([, name = '']) => name))
}

const baseDsTheme = createCssVariablesTheme({
  name: 'base-ds',
  variablePrefix: '--color-code-',
  fontStyle: true,
})

const samples: [lang: string, code: string][] = [
  [
    'ts',
    `// Greets someone\nexport function greet(name: string, times = 2): string {\n  const url = 'https://example.com'\n  return \`Hello, \${name}!\`.repeat(times)\n}`,
  ],
  ['css', `/* tokens */\n.button { color: var(--color-primary); padding: 4px 8px; }`],
  ['bash', `# install\nnpm install @indianous/base-ds@^0.5.0 --save`],
  ['md', `# Title\n\nSee [the docs](https://example.com) and \`code\`.`],
]

async function variablesUsedByShiki(): Promise<Set<string>> {
  const used = new Set<string>()
  for (const [lang, code] of samples) {
    const html = await codeToHtml(code, { lang, theme: baseDsTheme })
    for (const [, name = ''] of html.matchAll(/var\((--color-code-[\w-]+)\)/g)) used.add(name)
  }
  return used
}

describe('code highlighting with Shiki', () => {
  it('uses the code tokens for the background, the text and several token kinds', async () => {
    const used = await variablesUsedByShiki()
    expect(used).toContain('--color-code-background')
    expect(used).toContain('--color-code-foreground')
    expect(
      [...used].filter((name) => name.startsWith('--color-code-token-')).length,
    ).toBeGreaterThan(4)
  })

  it.each([':root', '.dark'] as const)(
    'declares every variable Shiki writes in the %s theme',
    async (selector) => {
      const declared = declaredIn(selector)
      const missing = [...(await variablesUsedByShiki())].filter((name) => !declared.has(name))
      expect(missing).toEqual([])
    },
  )
})
