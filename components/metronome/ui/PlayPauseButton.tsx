import { Dispatch, MouseEvent, useEffect, useRef } from 'react'
import { MetronomeFull } from '../Metronome'
import { MetronomeAction } from '../hooks/useMetronomeReducer'
import { METRONOME_CONSTANTS } from '@/constants/metronome'
import { IconPlayerPause, IconPlayerPlay } from '@tabler/icons-react'

export function PlayPauseButton({
  metronome,
  dispatch,
  full = false,
}: {
  metronome: MetronomeFull
  dispatch: Dispatch<MetronomeAction>
  full?: boolean
}) {
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
    const AudioContext =
      window.AudioContext || (window as any).webkitAudioContext
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
      play(true) // Preserve timer when restarting for settings changes
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metronome.bpm, metronome.beats, metronome.stressFirst])

  useEffect(() => {
    if (
      metronome.isPlaying &&
      metronome.timerActive &&
      metronome.activeTimer === 0
    ) {
      pause()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metronome.activeTimer])

  const scheduleNote = () => {
    if (!audioContext.current) return
    const time = nextNoteTime.current
    const osc = audioContext.current.createOscillator()
    const envelope = audioContext.current.createGain()
    osc.frequency.value =
      currentBeatInBar.current === 0 && metronome.stressFirst
        ? METRONOME_CONSTANTS.AUDIO.FREQUENCY_HIGH
        : METRONOME_CONSTANTS.AUDIO.FREQUENCY_LOW
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
      audioContext.current.currentTime +
        METRONOME_CONSTANTS.AUDIO.SCHEDULE_AHEAD
    ) {
      scheduleNote()
      nextNoteTime.current += secondsPerBeat
      currentBeatInBar.current =
        (currentBeatInBar.current + 1) % metronome.beats
    }
  }

  const play = (preserveTimer = false) => {
    if (!audioContext.current) return
    dispatch({ type: preserveTimer ? 'RESTART_AUDIO' : 'START_PLAYING' })
    timeInterval.current = setInterval(() => {
      dispatch({ type: 'INCREMENT_TIME' })
    }, 1000)
    currentBeatInBar.current = 0
    if (nextNoteTime.current === 0)
      nextNoteTime.current = audioContext.current.currentTime + 0.15
    schedulerIntervalId.current = setInterval(
      () => scheduler(),
      METRONOME_CONSTANTS.AUDIO.LOOKAHEAD,
    )
  }

  const pause = () => {
    dispatch({ type: 'STOP_PLAYING' })
    clearInterval(timeInterval.current)
    currentBeatInBar.current = 0
    nextNoteTime.current = 0
    clearInterval(schedulerIntervalId.current)
  }

  const playPause = (e?: MouseEvent<HTMLButtonElement>) => {
    metronome.isPlaying ? pause() : play()
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
