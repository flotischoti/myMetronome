import { IconMinus, IconPlus } from '@tabler/icons-react'
import { MetronomeFull } from '../Metronome'
import { MouseEvent, ChangeEvent } from 'react'

export function BeatArea({
  metronome,
  setMetronome,
}: {
  metronome: MetronomeFull
  setMetronome: Function
}) {
  const maxBeats = 12
  const minBeats = 2

  const decreaseBeats = (e: MouseEvent<HTMLButtonElement>) => {
    setMetronome({ ...metronome, beats: metronome.beats - 1 })
  }

  const increaseBeats = (e: MouseEvent<HTMLButtonElement>) => {
    setMetronome({ ...metronome, beats: metronome.beats + 1 })
  }
  const stressFirst = (e: ChangeEvent<HTMLInputElement>) => {
    setMetronome({ ...metronome, stressFirst: !metronome.stressFirst })
  }
  return (
    <div id="beatArea">
      <div id="beatControlArea" className="flex justify-between mt-8">
        <div id="stressCheckboxPane-1" className="flex items-center ">
          <input
            id="stressCheckbox-1"
            type="checkbox"
            checked={metronome.stressFirst}
            onChange={stressFirst}
            className="checkbox checkbox-sm"
          />
          <label
            htmlFor="stressCheckbox-1"
            className="ml-2 text-sm cursor-pointer"
          >
            <span className="">
              Stress 1<sup>st</sup> beat
            </span>
          </label>
        </div>
        {metronome.stressFirst && (
          <div
            id="beatCountArea-1"
            className="flex items-center justify-between  w-32"
          >
            <button
              type="button"
              className="btn btn-xs btn-outline btn-neutral"
              disabled={metronome.beats <= minBeats}
              onClick={decreaseBeats}
            >
              <IconMinus size="8" />
            </button>
            <span className="text-base">
              {metronome.beats} Beat
              {metronome.beats > 1 && <span>s</span>}
            </span>
            <button
              type="button"
              className="btn btn-xs btn-outline btn-neutral"
              disabled={metronome.beats >= maxBeats}
              onClick={increaseBeats}
            >
              <IconPlus size="8" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
