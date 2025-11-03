import { MetronomeFull } from '../Metronome'
import { ChangeEvent } from 'react'

export function BpmSlider({
  minBpm,
  maxBpm,
  metronome,
  setMetronome,
}: {
  minBpm: number
  maxBpm: number
  metronome: MetronomeFull
  setMetronome: Function
}) {
  const changeBpm = (e: ChangeEvent<HTMLInputElement>) => {
    setMetronome({ ...metronome, bpm: +e.target.value })
  }
  return (
    <input
      type="range"
      min={minBpm}
      max={maxBpm}
      value={metronome.bpm}
      onChange={changeBpm}
      className="range my-2"
    />
  )
}
