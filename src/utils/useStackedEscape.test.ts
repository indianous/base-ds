import { describe, it, expect, vi } from 'vitest'
import { renderHook, fireEvent } from '@testing-library/react'
import { useStackedEscape } from './useStackedEscape'

function pressEscape() {
  fireEvent.keyDown(document, { key: 'Escape' })
}

describe('useStackedEscape', () => {
  it('calls onClose on Escape when a single instance is open', () => {
    const onClose = vi.fn()
    renderHook(() => useStackedEscape(true, onClose))
    pressEscape()
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('does not call onClose when open is false', () => {
    const onClose = vi.fn()
    renderHook(() => useStackedEscape(false, onClose))
    pressEscape()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('calls onClose only for the most recently opened instance', () => {
    const onCloseFirst = vi.fn()
    const onCloseSecond = vi.fn()
    renderHook(() => useStackedEscape(true, onCloseFirst))
    renderHook(() => useStackedEscape(true, onCloseSecond))
    pressEscape()
    expect(onCloseSecond).toHaveBeenCalledOnce()
    expect(onCloseFirst).not.toHaveBeenCalled()
  })

  it('falls through to the instance below after the top one unmounts', () => {
    const onCloseFirst = vi.fn()
    const onCloseSecond = vi.fn()
    renderHook(() => useStackedEscape(true, onCloseFirst))
    const second = renderHook(() => useStackedEscape(true, onCloseSecond))
    second.unmount()
    pressEscape()
    expect(onCloseFirst).toHaveBeenCalledOnce()
    expect(onCloseSecond).not.toHaveBeenCalled()
  })

  it('falls through to the instance below when the top one flips open to false (without unmounting)', () => {
    const onCloseFirst = vi.fn()
    const onCloseSecond = vi.fn()
    renderHook(() => useStackedEscape(true, onCloseFirst))
    const second = renderHook(({ open }) => useStackedEscape(open, onCloseSecond), {
      initialProps: { open: true },
    })
    second.rerender({ open: false })
    pressEscape()
    expect(onCloseFirst).toHaveBeenCalledOnce()
    expect(onCloseSecond).not.toHaveBeenCalled()
  })
})
