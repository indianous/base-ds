import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { useResolvedElement } from './useResolvedElement'
import { lazyElementForTests } from './lazyElementForTests'

const resolve = (node: ReactNode) => renderHook(() => useResolvedElement(node)).result.current

describe('useResolvedElement', () => {
  it('resolves a lazy element from a Server Component to the element itself', () => {
    const link = <a href="/projects">Projects</a>
    expect(resolve(lazyElementForTests(link))).toBe(link)
  })

  it('returns a regular element as is', () => {
    const link = <a href="/projects">Projects</a>
    expect(resolve(link)).toBe(link)
  })

  it('returns text and null as is', () => {
    expect(resolve('Projects')).toBe('Projects')
    expect(resolve(null)).toBeNull()
  })
})
