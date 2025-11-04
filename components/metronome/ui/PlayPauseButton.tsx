import { Dispatch, MouseEvent, SetStateAction, useEffect, useRef } from 'react'
import { LocalMetronomeSettings, StoredMetronome } from '../Metronome'
import { IconPlayerPause, IconPlayerPlay } from '@tabler/icons-react'

export function PlayPauseButton({
  metronome,
  setMetronome,
  autosave,
  full = false,
}: {
  metronome: StoredMetronome & LocalMetronomeSettings
  setMetronome: Dispatch<SetStateAction<any>>
  autosave: () => void
  full?: boolean
}) {
  const lookahead = 25
  const scheduleAheadTime = 0.2
  const audioContext = useRef<AudioContext | null>(null)
  const timeInterval = useRef<ReturnType<typeof setInterval> | undefined>(
    undefined,
  )
  const currentBeatInBar = useRef<number>(-1)
  const nextNoteTime = useRef<number>(0)
  const schedulerIntervalId = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  )
  useEffect(() => {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    audioContext.current = new AudioContext()
    return () => {
      if (audioContext.current) {
        audioContext.current.close()
      }
      clearInterval(timeInterval.current)
    }
  }, [])

  useEffect(() => {
    if (metronome.isPlaying) {
      const tmpNextNotetime = nextNoteTime.current
      pause()
      nextNoteTime.current = tmpNextNotetime
      play()
    }
  }, [metronome.bpm, metronome.beats, metronome.stressFirst])

  // Pause metronome when activeTimer reached 0
  useEffect(() => {
    if (
      metronome.isPlaying &&
      metronome.timerActive &&
      metronome.activeTimer == 0
    ) {
      pause()
    }
  }, [metronome.activeTimer])

  const scheduleNote = () => {
    if (!audioContext.current) return

    const time = nextNoteTime.current
    const osc = audioContext.current.createOscillator()
    const envelope = audioContext.current.createGain()
    osc.frequency.value =
      currentBeatInBar.current == 0 && metronome.stressFirst ? 1000 : 800
    envelope.gain.value = 1
    envelope.gain.exponentialRampToValueAtTime(1, time + 0.001)
    envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.02)

    osc.connect(envelope)
    envelope.connect(audioContext.current.destination)

    osc.start(time)
    osc.stop(time + 0.05)
  }

  const scheduler = () => {
    if (!audioContext.current) return
    const secondsPerBeat = 60.0 / metronome.bpm
    while (
      nextNoteTime.current <
      audioContext.current.currentTime + scheduleAheadTime
    ) {
      scheduleNote()
      nextNoteTime.current += secondsPerBeat
      currentBeatInBar.current =
        (currentBeatInBar.current + 1) % metronome.beats
    }
  }

  const play = () => {
    if (!audioContext.current) {
      return
    }
    setMetronome({
      ...metronome,
      isPlaying: true,
      activeTimer: metronome.timerValue,
    })
    timeInterval.current = setInterval(() => {
      setMetronome((prev: StoredMetronome & LocalMetronomeSettings) => {
        return {
          ...prev,
          timeUsed: prev.timeUsed + 1000,
          currentUsed: prev.currentUsed + 1000,
          sessionUsed: prev.sessionUsed + 1000,
          activeTimer: !prev.timerActive
            ? prev.timerValue
            : prev.activeTimer > 1000
              ? prev.activeTimer - 1000
              : 0,
          isPlaying:
            !prev.timerActive || prev.activeTimer >= 1000 ? true : false,
        }
      })
    }, 1000)
    currentBeatInBar.current = 0
    if (nextNoteTime.current == 0)
      nextNoteTime.current = audioContext.current.currentTime + 0.15
    schedulerIntervalId.current = setInterval(() => scheduler(), lookahead)
  }

  const pause = () => {
    setMetronome({
      ...metronome,
      isPlaying: false,
      currentUsed: 0,
    })
    clearInterval(timeInterval.current)
    currentBeatInBar.current = 0
    nextNoteTime.current = 0
    clearInterval(schedulerIntervalId.current)
  }

  const playPause = (e?: MouseEvent<HTMLButtonElement>) => {
    if (metronome.isPlaying) {
      pause()
      autosave()
    } else {
      play()
    }
  }

  return (
    <button
      type="button"
      onClick={playPause}
      className={`btn btn-circle h-24 btn-outline ${
        full ? 'w-full mt-4' : 'grow'
      }`}
    >
      {metronome.isPlaying ? <IconPlayerPause /> : <IconPlayerPlay />}
      {metronome.isPlaying ? 'Pause' : 'Play'}
    </button>
  )
}
