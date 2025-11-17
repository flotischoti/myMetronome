import { useCallback } from 'react'
import { useAsyncAction } from './useAsyncAction'
import {
  createMetronomeAction,
  updateServerAction,
  deleteMetronomeAction,
} from '@/app/actions'
import type { MetronomeFull } from '@/components/metronome/Metronome'

interface UseMetronomeActionsOptions {
  onSaveSuccess?: () => void
  onSaveError?: (error: string) => void
  onUpdateSuccess?: () => void
  onUpdateError?: (error: string) => void
  onDeleteSuccess?: () => void
  onDeleteError?: (error: string) => void
}

export const useMetronomeActions = (
  metronome: MetronomeFull,
  user: number | null,
  options: UseMetronomeActionsOptions = {},
) => {
  // Create Action
  const { execute: executeCreate, isPending: isCreating } = useAsyncAction(
    async () => {
      if (!metronome.name || metronome.name.trim() === '') {
        throw new Error('Provide a name')
      }
      if (!user) {
        throw new Error('User not logged in')
      }
      await createMetronomeAction(metronome)
    },
    {
      onSuccess: options.onSaveSuccess,
      onError: options.onSaveError,
    },
  )

  // Update Action
  const { execute: executeUpdate, isPending: isUpdating } = useAsyncAction(
    async () => {
      if (!user || !metronome.id) return
      await updateServerAction(metronome)
    },
    {
      onSuccess: options.onUpdateSuccess,
      onError: options.onUpdateError,
    },
  )

  // Delete Action
  const { execute: executeDelete, isPending: isDeleting } = useAsyncAction(
    async () => {
      if (!user || !metronome.id) return
      await deleteMetronomeAction(metronome.id, '/metronome/new')
    },
    {
      onSuccess: options.onDeleteSuccess,
      onError: options.onDeleteError,
    },
  )

  // ✅ FIX: Stabile Referenzen mit useCallback
  const createMetronome = useCallback(() => {
    executeCreate()
  }, [executeCreate])

  const updateMetronome = useCallback(() => {
    executeUpdate()
  }, [executeUpdate])

  const deleteMetronome = useCallback(() => {
    executeDelete()
  }, [executeDelete])

  return {
    createMetronome,
    updateMetronome,
    deleteMetronome,
    isCreating,
    isUpdating,
    isDeleting,
    isAnyPending: isCreating || isUpdating || isDeleting,
  }
}
