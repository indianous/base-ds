import { useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { Toast } from './Toast'
import { useToast } from './useToast'

const subscribeNever = () => () => {}

export function ToastViewport() {
  const { toasts, dismiss } = useToast()

  // document.body doesn't exist during SSR — defer the portal until after
  // hydration, otherwise this crashes any server-rendered page that includes it.
  const mounted = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  )

  if (!mounted) return null

  return createPortal(
    <div
      role="region"
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2"
    >
      {toasts.map(({ id, variant, title, description, action }) => (
        <Toast
          key={id}
          {...(variant !== undefined ? { variant } : {})}
          {...(title !== undefined ? { title } : {})}
          {...(description !== undefined ? { description } : {})}
          {...(action !== undefined ? { action } : {})}
          onDismiss={() => dismiss(id)}
        />
      ))}
    </div>,
    document.body,
  )
}
