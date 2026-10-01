import type { ReactElement } from 'react'

/**
 * Test helper (issue #60): wraps an element the way React 19's Flight hands a client element from
 * a Server Component to a client component — a lazy node (`$$typeof: Symbol.for('react.lazy')`)
 * whose `props` are undefined, with an already resolved thenable as payload (`use()` reads it
 * synchronously). Testing Library never crosses the server/client boundary, so tests build it here.
 */
export function lazyElementForTests<T extends ReactElement>(element: T): T {
  const payload = { status: 'fulfilled', value: element, then: () => {} }
  return {
    $$typeof: Symbol.for('react.lazy'),
    _payload: payload,
    _init: (resolved: typeof payload) => resolved.value,
  } as unknown as T
}
