import { createContext, useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { ToastAction, ToastVariant } from './Toast'

interface ToastOptions {
  title?: string
  description?: string
  variant?: ToastVariant
  duration?: number
  action?: ToastAction
}

interface ToastItem extends ToastOptions {
  id: string
}

interface ToastContextValue {
  toasts: ToastItem[]
  toast: (options: ToastOptions) => string
  dismiss: (id: string) => void
}

const DEFAULT_DURATION = 5000

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

interface ToastProviderProps {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>())

  const dismiss = useCallback((id: string) => {
    const timer = timers.current.get(id)
    if (timer !== undefined) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
    setToasts((current) => current.filter((item) => item.id !== id))
  }, [])

  const toast = useCallback(
    (options: ToastOptions) => {
      const id = crypto.randomUUID()
      const duration = options.duration ?? DEFAULT_DURATION

      setToasts((current) => [...current, { ...options, id }])

      if (duration > 0) {
        timers.current.set(
          id,
          setTimeout(() => dismiss(id), duration),
        )
      }

      return id
    },
    [dismiss],
  )

  useEffect(() => {
    const activeTimers = timers.current
    return () => {
      activeTimers.forEach((timer) => clearTimeout(timer))
      activeTimers.clear()
    }
  }, [])

  return <ToastContext.Provider value={{ toasts, toast, dismiss }}>{children}</ToastContext.Provider>
}

export { ToastContext }
export type { ToastContextValue, ToastOptions, ToastItem }
