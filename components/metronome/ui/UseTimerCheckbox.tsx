import { ChangeEvent, Dispatch } from 'react'
import { MetronomeFull } from '../Metronome'
import { MetronomeAction } from '../hooks/useMetronomeReducer'

export function UseTimerCheckbox({
  metronome,
  dispatch,
}: {
  metronome: MetronomeFull
  dispatch: Dispatch<MetronomeAction>
}) {
  const setTimer = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_TIMER_ACTIVE', payload: !metronome.timerActive })
  }

  return (
    <div
      id="countdownCheckboxPane-1"
      className="flex items-center justify-around"
    >
      <input
        id="timerCheckbox-1"
        type="checkbox"
        checked={metronome.timerActive}
        onChange={setTimer}
        className="checkbox checkbox-sm"
      />
      <label htmlFor="timerCheckbox-1" className="ml-2 text-sm cursor-pointer">
        <span>Use timer</span>
      </label>
    </div>
  )
}
