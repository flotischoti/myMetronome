'use client'
import { useToast } from '@/contexts/ToastContext'
import { useCommandHandler } from '@/app/hooks/useCommandHandler'

interface ToastContainerProps {
  command?: string
}

export function ToastContainer({ command }: ToastContainerProps) {
  const toast = useToast()

  useCommandHandler(command, toast.show)

  if (!toast.isVisible) return null

  return (
    <div className="toast toast-end">
      <div
        className={`alert ${
          toast.type === 'success'
            ? 'alert-success'
            : toast.type === 'error'
              ? 'alert-error'
              : 'alert-info'
        }`}
      >
        <span>{toast.message}</span>
      </div>
    </div>
  )
}
