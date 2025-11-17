import { MetronomeFull } from '../Metronome'
import { MetronomeAction } from '../hooks/useMetronomeReducer'
import { Dispatch, ChangeEvent } from 'react'

export function BpmSlider({
  minBpm,
  maxBpm,
  metronome,
  dispatch,
}: {
  minBpm: number
  maxBpm: number
  metronome: MetronomeFull
  dispatch: Dispatch<MetronomeAction>
}) {
  const changeBpm = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_BPM', payload: +e.target.value })
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
