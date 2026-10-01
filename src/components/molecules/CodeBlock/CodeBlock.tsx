import type { ReactNode } from 'react'
import { cn } from '../../../utils/cn'

interface CodeBlockCommonProps {
  /** Shown in the block's header and set as `data-language`. */
  language?: string
  /** Accessible name of the code block. */
  label?: string
  className?: string
}

type CodeBlockWithChildren = CodeBlockCommonProps & {
  /** Plain code, rendered as is in `<pre><code>`. */
  children: ReactNode
  html?: never
}

type CodeBlockWithHtml = CodeBlockCommonProps & {
  /**
   * HTML of a highlighter run at build time, e.g. Shiki's `codeToHtml` with the `css-variables`
   * theme and `variablePrefix: '--color-code-'` (see the README). Never pass user-provided text:
   * it's inserted as HTML.
   */
  html: string
  children?: never
}

export type CodeBlockProps = CodeBlockWithChildren | CodeBlockWithHtml

const preClasses =
  'overflow-x-auto p-4 font-mono text-sm leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring'

// The same look applied to the highlighter's own <pre> (it already has tabindex="0").
const highlightedPreClasses =
  '[&_pre]:overflow-x-auto [&_pre]:p-4 [&_pre]:font-mono [&_pre]:text-sm [&_pre]:leading-relaxed [&_pre:focus-visible]:outline-none [&_pre:focus-visible]:ring-2 [&_pre:focus-visible]:ring-inset [&_pre:focus-visible]:ring-ring'

export function CodeBlock({ language, label = 'Code', className, ...props }: CodeBlockProps) {
  return (
    <figure
      aria-label={label}
      data-language={language}
      className={cn(
        'overflow-hidden rounded-md border border-border bg-code-background text-code-foreground',
        className,
      )}
    >
      {language !== undefined && (
        <figcaption className="border-b border-border px-4 py-1.5 text-xs font-medium text-muted-foreground">
          {language}
        </figcaption>
      )}
      {props.html !== undefined ? (
        <div className={highlightedPreClasses} dangerouslySetInnerHTML={{ __html: props.html }} />
      ) : (
        // A scrollable region must be reachable by keyboard to scroll it without a mouse.
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        <pre tabIndex={0} className={preClasses}>
          <code>{props.children}</code>
        </pre>
      )}
    </figure>
  )
}
