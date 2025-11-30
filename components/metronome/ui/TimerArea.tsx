import { IconMinus, IconPlus } from '@tabler/icons-react'
import { MetronomeFull } from '../Metronome'
import { MetronomeAction } from '../hooks/useMetronomeReducer'
import { METRONOME_CONSTANTS } from '@/constants/metronome'
import { UseTimerCheckbox } from './UseTimerCheckbox'
import { Dispatch, MouseEvent } from 'react'

export function TimerArea({
  metronome,
  dispatch,
}: {
  metronome: MetronomeFull
  dispatch: Dispatch<MetronomeAction>
}) {
  const increaseTimer = (e: MouseEvent<HTMLButtonElement>) => {
    dispatch({
      type: 'INCREASE_TIMER',
      payload: METRONOME_CONSTANTS.TIMER.INTERVAL,
    })
  }

  const decreaseTimer = (e: MouseEvent<HTMLButtonElement>) => {
    dispatch({
      type: 'DECREASE_TIMER',
      payload: METRONOME_CONSTANTS.TIMER.INTERVAL,
    })
  }

  return (
    <div id="metronomeCountdownArea-1" className="flex justify-between mt-4">
      <UseTimerCheckbox metronome={metronome} dispatch={dispatch} />
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
                ? metronome.activeTimer < METRONOME_CONSTANTS.TIMER.INTERVAL
                : metronome.timerValue <= METRONOME_CONSTANTS.TIMER.INTERVAL
            }
            onClick={decreaseTimer}
          >
            <IconMinus size="8" />
          </button>
          <span className="countdown font-mono text-base font-sans">
            <span
              style={
                {
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
                } as React.CSSProperties
              }
            ></span>
            :
            <span
              style={
                {
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
                } as React.CSSProperties
              }
            ></span>
          </span>
          <button
            type="button"
            className="btn btn-xs btn-outline btn-neutral"
            disabled={
              metronome.isPlaying
                ? metronome.activeTimer >= METRONOME_CONSTANTS.TIMER.MAX
                : metronome.timerValue >= METRONOME_CONSTANTS.TIMER.MAX
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
