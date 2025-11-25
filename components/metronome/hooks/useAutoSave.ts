import { useEffect, useRef, useCallback, useState } from 'react'
import type { MetronomeFull } from '@/components/metronome/Metronome'

interface UseAutoSaveOptions {
  delay?: number
  enabled?: boolean
}

export const useAutoSave = (
  metronome: MetronomeFull,
  onSave: () => void,
  options: UseAutoSaveOptions = {},
) => {
  const { delay = 2000, enabled = true } = options
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  const [isSaving, setIsSaving] = useState(false)

  const onSaveRef = useRef(onSave)

  useEffect(() => {
    onSaveRef.current = onSave
  }, [onSave])

  const trigger = useCallback(() => {
    if (!enabled) return

    clearTimeout(timeoutRef.current)

    setIsSaving(true)

    timeoutRef.current = setTimeout(() => {
      onSaveRef.current()
    }, delay)
  }, [enabled, delay])

  const resetSaving = useCallback(() => {
    setIsSaving(false)
  }, [])

  // Auto-save triggered by property change
  useEffect(() => {
    trigger()
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

  // Auto-save every 30 seconds while playing
  useEffect(() => {
    if (
      metronome.isPlaying &&
      metronome.timeUsed % 30000 === 0 &&
      metronome.timeUsed > 0
    ) {
      trigger()
    }
  }, [metronome.timeUsed, metronome.isPlaying, trigger])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current)
      setIsSaving(false)
    }
  }, [])

  return { trigger, isSaving, resetSaving }
}
