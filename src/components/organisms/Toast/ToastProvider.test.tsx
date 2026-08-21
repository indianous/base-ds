import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ToastProvider } from './ToastProvider'
import { useToast } from './useToast'

function TestConsumer() {
  const { toast, dismiss, toasts } = useToast()

  return (
    <div>
      <button onClick={() => toast({ title: 'Hello' })}>Add</button>
      <button onClick={() => toast({ title: 'Persistent', duration: 0 })}>Add persistent</button>
      <button onClick={() => toast({ title: 'A' })}>Add A</button>
      <button onClick={() => toast({ title: 'B' })}>Add B</button>
      <ul>
        {toasts.map((t) => (
          <li key={t.id}>
            {t.title}
            <button onClick={() => dismiss(t.id)}>Dismiss {t.title}</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

describe('ToastProvider / useToast', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('throws when useToast is used outside ToastProvider', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const Consumer = () => {
      useToast()
      return null
    }
    expect(() => render(<Consumer />)).toThrow('useToast must be used within a ToastProvider')
    consoleErrorSpy.mockRestore()
  })

  it('adds a toast to the queue when toast() is called', async () => {
    const user = userEvent.setup()
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>,
    )
    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('removes a toast when dismiss(id) is called', async () => {
    const user = userEvent.setup()
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>,
    )
    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(screen.getByText('Hello')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Dismiss Hello' }))
    expect(screen.queryByText('Hello')).not.toBeInTheDocument()
  })

  it('auto-dismisses a toast after duration elapses', () => {
    vi.useFakeTimers()
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Add' }))
    expect(screen.getByText('Hello')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(screen.queryByText('Hello')).not.toBeInTheDocument()
  })

  it('does not auto-dismiss when duration is 0', () => {
    vi.useFakeTimers()
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Add persistent' }))
    expect(screen.getByText('Persistent')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(60000)
    })
    expect(screen.getByText('Persistent')).toBeInTheDocument()
  })

  it('supports multiple simultaneous toasts', async () => {
    const user = userEvent.setup()
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>,
    )
    await user.click(screen.getByRole('button', { name: 'Add A' }))
    await user.click(screen.getByRole('button', { name: 'Add B' }))
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
  })

  it('falls back to a generated id when crypto.randomUUID is unavailable (insecure context)', async () => {
    const originalRandomUUID = crypto.randomUUID
    // @ts-expect-error simulating an insecure context, where randomUUID does not exist
    delete crypto.randomUUID

    try {
      const user = userEvent.setup()
      render(
        <ToastProvider>
          <TestConsumer />
        </ToastProvider>,
      )
      await user.click(screen.getByRole('button', { name: 'Add A' }))
      await user.click(screen.getByRole('button', { name: 'Add B' }))
      expect(screen.getByText('A')).toBeInTheDocument()
      expect(screen.getByText('B')).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: 'Dismiss A' }))
      expect(screen.queryByText('A')).not.toBeInTheDocument()
      expect(screen.getByText('B')).toBeInTheDocument()
    } finally {
      crypto.randomUUID = originalRandomUUID
    }
  })
})
