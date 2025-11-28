import { useState, useCallback, useEffect } from 'react'

export type ToastType = 'success' | 'error' | 'info' | ''

interface ToastState {
  message: string
  type: ToastType
  timestamp: number
}

export const useToast = (duration: number = 2000) => {
  const [toast, setToast] = useState<ToastState>({
    message: '',
    type: '',
    timestamp: 0,
  })

  const show = useCallback((message: string, type: Exclude<ToastType, ''>) => {
    setToast({
      message,
      type,
      timestamp: Date.now(),
    })
  }, [])

  const hide = useCallback(() => {
    setToast({ message: '', type: '', timestamp: 0 })
  }, [])

  useEffect(() => {
    if (toast.type && toast.message) {
      const timer = setTimeout(() => {
        hide()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [toast.timestamp, duration, hide])

  return {
    show,
    message: toast.message,
    type: toast.type,
    isVisible: !!toast.type && !!toast.message,
  }
}
