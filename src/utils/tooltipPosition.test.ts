import { describe, it, expect } from 'vitest'
import { computeTooltipCoords } from './tooltipPosition'

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

describe('computeTooltipCoords', () => {
  it('positions above and horizontally centered for side="top"', () => {
    const coords = computeTooltipCoords(makeRect(), 'top')
    expect(coords.top).toBe(100 - 6)
    expect(coords.left).toBe(200 + 60 / 2)
    expect(coords.transform).toBe('translate(-50%, -100%)')
  })

  it('positions below and horizontally centered for side="bottom"', () => {
    const coords = computeTooltipCoords(makeRect(), 'bottom')
    expect(coords.top).toBe(140 + 6)
    expect(coords.left).toBe(200 + 60 / 2)
    expect(coords.transform).toBe('translate(-50%, 0)')
  })

  it('positions to the left and vertically centered for side="left"', () => {
    const coords = computeTooltipCoords(makeRect(), 'left')
    expect(coords.top).toBe(100 + 40 / 2)
    expect(coords.left).toBe(200 - 6)
    expect(coords.transform).toBe('translate(-100%, -50%)')
  })

  it('positions to the right and vertically centered for side="right"', () => {
    const coords = computeTooltipCoords(makeRect(), 'right')
    expect(coords.top).toBe(100 + 40 / 2)
    expect(coords.left).toBe(260 + 6)
    expect(coords.transform).toBe('translate(0, -50%)')
  })
})
