import { createPortal } from 'react-dom'
import { Toast } from './Toast'
import { useToast } from './useToast'

export function ToastViewport() {
  const { toasts, dismiss } = useToast()

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
