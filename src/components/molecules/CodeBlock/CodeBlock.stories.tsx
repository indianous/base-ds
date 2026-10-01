import type { Meta, StoryObj } from '@storybook/react'
import { CodeBlock } from './CodeBlock'

const meta: Meta<typeof CodeBlock> = {
  component: CodeBlock,
  title: 'Molecules/CodeBlock',
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof CodeBlock>

const plainCode = `npm install @indianous/base-ds@^0.5.1
npm run build`

// Output of Shiki's codeToHtml with the css-variables theme and variablePrefix: '--color-code-',
// stored as a string so the story doesn't run Shiki in the browser.
const highlightedTypeScript =
  '<pre class="shiki base-ds" style="background-color:var(--color-code-background);color:var(--color-code-foreground)" tabindex="0"><code><span class="line"><span style="color:var(--color-code-token-comment)">// Formats a price in Brazilian reais</span></span>\n<span class="line"><span style="color:var(--color-code-token-keyword)">export</span><span style="color:var(--color-code-token-keyword)"> function</span><span style="color:var(--color-code-token-function)"> formatPrice</span><span style="color:var(--color-code-foreground)">(cents</span><span style="color:var(--color-code-token-keyword)">:</span><span style="color:var(--color-code-token-constant)"> number</span><span style="color:var(--color-code-token-punctuation)">,</span><span style="color:var(--color-code-foreground)"> currency </span><span style="color:var(--color-code-token-keyword)">=</span><span style="color:var(--color-code-token-string-expression)"> \'BRL\'</span><span style="color:var(--color-code-foreground)">)</span><span style="color:var(--color-code-token-keyword)">:</span><span style="color:var(--color-code-token-constant)"> string</span><span style="color:var(--color-code-foreground)"> {</span></span>\n<span class="line"><span style="color:var(--color-code-token-keyword)">  const</span><span style="color:var(--color-code-token-constant)"> value</span><span style="color:var(--color-code-token-keyword)"> =</span><span style="color:var(--color-code-foreground)"> cents </span><span style="color:var(--color-code-token-keyword)">/</span><span style="color:var(--color-code-token-constant)"> 100</span></span>\n<span class="line"><span style="color:var(--color-code-token-keyword)">  return</span><span style="color:var(--color-code-token-keyword)"> new</span><span style="color:var(--color-code-token-constant)"> Intl</span><span style="color:var(--color-code-token-function)">.NumberFormat</span><span style="color:var(--color-code-foreground)">(</span><span style="color:var(--color-code-token-string-expression)">\'pt-BR\'</span><span style="color:var(--color-code-token-punctuation)">,</span><span style="color:var(--color-code-foreground)"> { style</span><span style="color:var(--color-code-token-keyword)">:</span><span style="color:var(--color-code-token-string-expression)"> \'currency\'</span><span style="color:var(--color-code-token-punctuation)">,</span><span style="color:var(--color-code-foreground)"> currency })</span><span style="color:var(--color-code-token-function)">.format</span><span style="color:var(--color-code-foreground)">(value)</span></span>\n<span class="line"><span style="color:var(--color-code-foreground)">}</span></span>\n<span class="line"></span>\n<span class="line"><span style="color:var(--color-code-token-constant)">console</span><span style="color:var(--color-code-token-function)">.log</span><span style="color:var(--color-code-foreground)">(</span><span style="color:var(--color-code-token-string-expression)">`Total: </span><span style="color:var(--color-code-token-keyword)">${</span><span style="color:var(--color-code-token-function)">formatPrice</span><span style="color:var(--color-code-foreground)">(</span><span style="color:var(--color-code-token-constant)">12990</span><span style="color:var(--color-code-foreground)">)</span><span style="color:var(--color-code-token-keyword)">}</span><span style="color:var(--color-code-token-string-expression)">`</span><span style="color:var(--color-code-foreground)">)</span></span></code></pre>'

export const Plain: Story = { args: { children: plainCode, language: 'Bash' } }

export const Highlighted: Story = { args: { html: highlightedTypeScript, language: 'TypeScript' } }

export const WithoutLanguage: Story = { args: { children: plainCode } }

export const LongLine: Story = {
  args: {
    language: 'Bash',
    children:
      'curl -H "Authorization: Bearer $GITHUB_PACKAGES_TOKEN" https://npm.pkg.github.com/@indianous%2fbase-ds | jq ".versions | keys"',
  },
}

export const CustomLabels: Story = {
  args: { html: highlightedTypeScript, language: 'TypeScript', label: 'Código de exemplo' },
}
