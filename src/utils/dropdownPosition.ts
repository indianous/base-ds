import { VIEWPORT_MARGIN } from './tooltipPosition'

const GAP = 4

export type DropdownAlign = 'start' | 'end'

export interface DropdownCoords {
  left: number
  top?: number
  bottom?: number
}

export function computeDropdownCoords(
  rect: DOMRect,
  panelWidth: number,
  align: DropdownAlign,
): DropdownCoords {
  const notEnoughSpaceBelow = window.innerHeight - rect.bottom < VIEWPORT_MARGIN
  const notEnoughSpaceRight = rect.left + panelWidth > window.innerWidth - VIEWPORT_MARGIN
  const resolvedAlign: DropdownAlign = notEnoughSpaceRight ? 'end' : align
  const left = resolvedAlign === 'end' ? rect.right - panelWidth : rect.left

  return notEnoughSpaceBelow
    ? { left, bottom: window.innerHeight - rect.top + GAP }
    : { left, top: rect.bottom + GAP }
}
