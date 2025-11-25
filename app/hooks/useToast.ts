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
      setToast({ message, type })

      setTimeout(() => {
        setToast({ message: '', type: '' })
      }, duration)
    },
    [duration],
  )

  return {
    message: toast.message,
    type: toast.type,
    show,
    isVisible: toast.type !== '',
  }
}
