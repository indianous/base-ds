import * as React from 'react'
import type { ReactNode } from 'react'

const REACT_LAZY_TYPE = Symbol.for('react.lazy')

interface LazyNode {
  $$typeof: typeof REACT_LAZY_TYPE
  _payload: PromiseLike<ReactNode>
}

function isLazyNode(node: ReactNode): node is ReactNode & LazyNode {
  return (
    typeof node === 'object' &&
    node !== null &&
    '$$typeof' in node &&
    node.$$typeof === REACT_LAZY_TYPE &&
    '_payload' in node &&
    typeof node._payload === 'object' &&
    node._payload !== null &&
    'then' in node._payload
  )
}

// `use` only exists from React 19 (peer range is ^18 || ^19), and so do these lazy nodes. Reading
// it by a computed key keeps bundlers from flagging a missing `use` export on React 18 — the same
// trick as Radix's Slot.
const use = (React as unknown as Record<string, unknown>)[' use '.trim()] as
  (<T>(usable: PromiseLike<T>) => T) | undefined

/**
 * Resolves an element a Server Component passed to a client component (issue #60). React 19 can
 * hand it over as a lazy node — `props` undefined, not clonable — so read it with `use()` before
 * reading props or calling `cloneElement`. Any other node comes back as is. A hook (it calls
 * `use`), so call it unconditionally at the top of the component.
 */
export function useResolvedElement(node: ReactNode): ReactNode {
  if (isLazyNode(node) && typeof use === 'function') return use(node._payload)
  return node
}
