import { describe, it, expect, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useBodyScrollLock } from './useBodyScrollLock'

describe('useBodyScrollLock', () => {
  afterEach(() => {
    document.body.style.overflow = ''
  })

  it('sets body overflow to hidden when locked=true', () => {
    renderHook(() => useBodyScrollLock(true))
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('does not change body overflow when locked=false', () => {
    renderHook(() => useBodyScrollLock(false))
    expect(document.body.style.overflow).toBe('')
  })

  it('restores the previous overflow value on unmount', () => {
    document.body.style.overflow = 'auto'
    const { unmount } = renderHook(() => useBodyScrollLock(true))
    expect(document.body.style.overflow).toBe('hidden')
    unmount()
    expect(document.body.style.overflow).toBe('auto')
  })

  it('restores overflow when locked flips from true to false', () => {
    const { rerender } = renderHook(({ locked }) => useBodyScrollLock(locked), {
      initialProps: { locked: true },
    })
    expect(document.body.style.overflow).toBe('hidden')

    rerender({ locked: false })
    expect(document.body.style.overflow).toBe('')
  })
})
