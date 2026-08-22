import { describe, it, expect } from 'vitest'
import { computeDropdownCoords } from './dropdownPosition'

function makeRect(overrides: Partial<DOMRect> = {}): DOMRect {
  return {
    top: 100,
    bottom: 140,
    left: 200,
    right: 260,
    width: 60,
    height: 40,
    x: 200,
    y: 100,
    toJSON: () => {},
    ...overrides,
  }
}

describe('computeDropdownCoords', () => {
  it('anchors below-left of the trigger when there is enough room and align is "start"', () => {
    const coords = computeDropdownCoords(makeRect(), 288, 'start')
    expect(coords.left).toBe(200)
    expect(coords.top).toBe(140 + 4)
    expect(coords.bottom).toBeUndefined()
  })

  it('anchors below, right-aligned to the trigger, when align is "end"', () => {
    const coords = computeDropdownCoords(makeRect(), 288, 'end')
    expect(coords.left).toBe(260 - 288)
    expect(coords.top).toBe(140 + 4)
    expect(coords.bottom).toBeUndefined()
  })

  it('flips to align "end" when there is not enough room on the right, regardless of requested align', () => {
    const rect = makeRect({ left: 1200, right: 1260 })
    const originalInnerWidth = window.innerWidth
    window.innerWidth = 1300
    const coords = computeDropdownCoords(rect, 288, 'start')
    expect(coords.left).toBe(1260 - 288)
    window.innerWidth = originalInnerWidth
  })

  it('anchors above the trigger using "bottom" (not "top") when there is not enough room below', () => {
    const rect = makeRect({ top: 750, bottom: 780 })
    const originalInnerHeight = window.innerHeight
    window.innerHeight = 800
    const coords = computeDropdownCoords(rect, 288, 'start')
    expect(coords.top).toBeUndefined()
    expect(coords.bottom).toBe(800 - 750 + 4)
    window.innerHeight = originalInnerHeight
  })
})
