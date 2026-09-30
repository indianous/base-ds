import type { AnchorHTMLAttributes, ElementType } from 'react'

/**
 * Element rendered in place of `<a>` by components with internal links, such as Next.js `Link`.
 * It receives `href`, `className`, `children` and the `aria-*`/`on*` props of an anchor.
 */
export type LinkComponent = ElementType<AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }>
