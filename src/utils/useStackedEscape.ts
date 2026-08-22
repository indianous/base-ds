import { useEffect, useRef } from 'react'

let stack: symbol[] = []

export function useStackedEscape(open: boolean, onClose: () => void) {
  const tokenRef = useRef(Symbol())
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    if (!open) return
    const token = tokenRef.current
    stack.push(token)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (stack[stack.length - 1] !== token) return
      onCloseRef.current()
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      stack = stack.filter((t) => t !== token)
    }
  }, [open])
}
