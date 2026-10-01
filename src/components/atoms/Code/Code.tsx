import type { ReactNode } from 'react'
import { cn } from '../../../utils/cn'

export interface CodeProps {
  children: ReactNode
  className?: string
}

/** Inline code, styled with the code highlighting tokens. For blocks, use `CodeBlock`. */
export function Code({ children, className }: CodeProps) {
  return (
    <code
      className={cn(
        'rounded-sm bg-code-background px-1 py-0.5 font-mono text-code-foreground',
        className,
      )}
    >
      {children}
    </code>
  )
}
