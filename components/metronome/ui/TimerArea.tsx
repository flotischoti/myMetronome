import { IconMinus, IconPlus } from '@tabler/icons-react'
import { MetronomeFull } from '../Metronome'
import { UseTimerCheckbox } from './UseTimerCheckbox'
import { MouseEvent } from 'react'

export function TimerArea({
  metronome,
  setMetronome,
}: {
  metronome: MetronomeFull
  setMetronome: Function
}) {
  const timerChangeInterval = 30000

  const increaseTimer = (e: MouseEvent<HTMLButtonElement>) => {
    // Only increase active timer if the metronome is currently playing
    if (metronome.isPlaying && metronome.timerActive) {
      setMetronome({
        ...metronome,
        activeTimer: metronome.activeTimer + timerChangeInterval,
      })
    } else {
      setMetronome({
        ...metronome,
        timerValue: metronome.timerValue + timerChangeInterval,
        activeTimer: metronome.timerValue + timerChangeInterval,
      })
    }
  }

  const decreaseTimer = (e: MouseEvent<HTMLButtonElement>) => {
    if (metronome.isPlaying && metronome.timerActive) {
      setMetronome({
        ...metronome,
        activeTimer: metronome.activeTimer - timerChangeInterval,
      })
    } else {
      setMetronome({
        ...metronome,
        timerValue: metronome.timerValue - timerChangeInterval,
        activeTimer: metronome.timerValue - timerChangeInterval,
      })
    }
  }

  return (
    <div id="metronomeCountdownArea-1" className="flex justify-between mt-4">
      <UseTimerCheckbox metronome={metronome} setMetronome={setMetronome} />
      {metronome.timerActive && (
        <div
          id="countdownSettingsArea-1"
          className="flex items-center justify-between w-32"
        >
          <button
            type="button"
            className="btn btn-xs btn-outline btn-neutral"
            disabled={
              metronome.isPlaying
                ? metronome.activeTimer < timerChangeInterval
                : metronome.timerValue <= timerChangeInterval
            }
            onClick={decreaseTimer}
          >
            <IconMinus size="8" />
          </button>
          <span className="countdown font-mono text-base font-sans">
            <span
              style={{
                '--value': (
                  '0' +
                  Math.floor(
                    ((metronome.isPlaying
                      ? metronome.activeTimer
                      : metronome.timerValue) /
                      60000) %
                      60,
                  )
                ).slice(-2),
              }}
            ></span>
            :
            <span
              style={{
                '--value': (
                  '0' +
                  Math.floor(
                    ((metronome.isPlaying
                      ? metronome.activeTimer
                      : metronome.timerValue) /
                      1000) %
                      60,
                  )
                ).slice(-2),
              }}
            ></span>
          </span>
          <button
            type="button"
            className="btn btn-xs btn-outline btn-neutral"
            disabled={
              metronome.isPlaying
                ? metronome.activeTimer >= timerChangeInterval * 119
                : metronome.timerValue >= timerChangeInterval * 119
            }
            onClick={increaseTimer}
          >
            <IconPlus size="8" />
          </button>
        </div>
      )}
    </div>
  )
}
