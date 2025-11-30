import { useEffect, useRef, useCallback, useState } from 'react'
import type { MetronomeFull } from '@/components/metronome/Metronome'
import { METRONOME_CONSTANTS } from '@/constants/metronome'

interface UseAutoSaveOptions {
  delay?: number
  enabled?: boolean
}

export const useAutoSave = (
  metronome: MetronomeFull,
  onSave: (silent?: boolean) => void,
  options: UseAutoSaveOptions = {},
) => {
  const { delay = 2000, enabled = true } = options
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  const [isSaving, setIsSaving] = useState(false)
  const [isSilent, setIsSilent] = useState(false)

  const onSaveRef = useRef(onSave)

  useEffect(() => {
    onSaveRef.current = onSave
  }, [onSave])

  const trigger = useCallback(
    (silent: boolean = false) => {
      if (!enabled) return

      clearTimeout(timeoutRef.current)

      setIsSaving(true)
      setIsSilent(silent)

      timeoutRef.current = setTimeout(() => {
        onSaveRef.current(silent)
      }, delay)
    },
    [enabled, delay],
  )

  const resetSaving = useCallback(() => {
    setIsSaving(false)
  }, [])

  // Auto-save triggered by property change
  useEffect(() => {
    trigger(false)
  }, [
    metronome.showStats,
    metronome.bpm,
    metronome.beats,
    metronome.stressFirst,
    metronome.timerActive,
    metronome.timerValue,
    metronome.name,
    metronome.locked,
    trigger,
  ])

  // Auto-save every interval while playing
  useEffect(() => {
    if (
      (!metronome.isPlaying ||
        metronome.timeUsed % METRONOME_CONSTANTS.AUTOSAVE.INTERVAL === 0) &&
      metronome.timeUsed > 0
    ) {
      trigger(true)
    }
  }, [metronome.timeUsed, metronome.isPlaying, trigger])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current)
      setIsSaving(false)
    }
  }, [])

  return { isSaving, isSilent, resetSaving }
}
