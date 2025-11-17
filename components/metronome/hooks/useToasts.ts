import { useState, useCallback } from 'react'

export type ToastType = 'success' | 'error' | 'info' | ''

interface ToastState {
  message: string
  type: ToastType
}

export const useToast = (duration = 2000) => {
  const [toast, setToast] = useState<ToastState>({
    message: '',
    type: '',
  })

  const show = useCallback(
    (message: string, type: Exclude<ToastType, ''>) => {
      // ✨ Exclude empty string
      setToast({ message, type })

      setTimeout(() => {
        setToast({ message: '', type: '' })
      }, duration)
    },
    [duration],
  )

  const hide = useCallback(() => {
    setToast({ message: '', type: '' })
  }, [])

  return {
    message: toast.message,
    type: toast.type,
    show,
    hide,
    isVisible: toast.type !== '',
  }
}
