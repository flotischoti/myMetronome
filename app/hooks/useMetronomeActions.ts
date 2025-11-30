import { useCallback } from 'react'
import { useAsyncAction } from './useAsyncAction'
import {
  createMetronomeAction,
  updateServerAction,
  deleteMetronomeAction,
} from '@/app/actions/actions'
import type {
  MetronomeFull,
  StoredMetronome,
} from '@/components/metronome/Metronome'

interface UseMetronomeActionsOptions {
  onSaveError?: (error: string) => void
  onUpdateSuccess?: () => void
  onUpdateError?: (error: string) => void
  onDeleteError?: (error: string) => void
  deleteTarget?: string
}

export const useMetronomeActions = (
  metronome: MetronomeFull | StoredMetronome,
  user: number | null,
  options: UseMetronomeActionsOptions = {},
) => {
  // ============================================
  // CREATE Action - Success via Cookie!
  // ============================================
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
      onError: options.onSaveError,
    },
  )

  // ============================================
  // UPDATE Action
  // ============================================
  const { execute: executeUpdate, isPending: isUpdating } = useAsyncAction(
    async (silent: boolean = false) => {
      if (!user || !metronome.id) throw new Error('Cannot update')
      await updateServerAction(metronome)

      if (!silent && options.onUpdateSuccess) {
        options.onUpdateSuccess()
      }
    },
    {
      onError: options.onUpdateError,
    },
  )

  // ============================================
  // DELETE Action
  // ============================================
  const { execute: executeDelete, isPending: isDeleting } = useAsyncAction(
    async () => {
      if (!user || !metronome.id) throw new Error('Delete failed')
      await deleteMetronomeAction(
        metronome.id,
        options.deleteTarget || '/metronome/new',
      )
    },
    {
      onError: options.onDeleteError,
    },
  )

  const createMetronome = useCallback(() => {
    executeCreate()
  }, [executeCreate])

  const updateMetronome = useCallback(
    (silent: boolean = false) => {
      executeUpdate(silent)
    },
    [executeUpdate],
  )

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
