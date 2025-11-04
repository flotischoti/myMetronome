import { ChangeEvent } from 'react'
import { MetronomeFull } from '../Metronome'

export function UseTimerCheckbox({
  metronome,
  setMetronome,
}: {
  metronome: MetronomeFull
  setMetronome: Function
}) {
  const setTimer = (e: ChangeEvent<HTMLInputElement>) => {
    setMetronome({
      ...metronome,
      timerActive: !metronome.timerActive,
      activeTimer: metronome.timerValue,
    })
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
        <span className="">Use timer</span>
      </label>
    </div>
  )
}
