'use client'
import { createContext, useContext, ReactNode } from 'react'
import { useToast as useToastHook, ToastType } from '@/app/hooks/useToast'
import { METRONOME_CONSTANTS } from '@/constants/metronome'

interface ToastContextType {
  show: (message: string, type: Exclude<ToastType, ''>) => void
  message: string
  type: ToastType
  isVisible: boolean
}

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const toast = useToastHook(METRONOME_CONSTANTS.TOAST.DURATION)

  return <ToastContext.Provider value={toast}>{children}</ToastContext.Provider>
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}
