export type TooltipSide = 'top' | 'bottom' | 'left' | 'right'

export interface TooltipCoords {
  top: number
  left: number
  transform: string
}

const GAP = 6

export function computeTooltipCoords(rect: DOMRect, side: TooltipSide): TooltipCoords {
  switch (side) {
    case 'top':
      return {
        top: rect.top - GAP,
        left: rect.left + rect.width / 2,
        transform: 'translate(-50%, -100%)',
      }
    case 'bottom':
      return {
        top: rect.bottom + GAP,
        left: rect.left + rect.width / 2,
        transform: 'translate(-50%, 0)',
      }
    case 'left':
      return {
        top: rect.top + rect.height / 2,
        left: rect.left - GAP,
        transform: 'translate(-100%, -50%)',
      }
    case 'right':
      return {
        top: rect.top + rect.height / 2,
        left: rect.right + GAP,
        transform: 'translate(0, -50%)',
      }
  }
}
