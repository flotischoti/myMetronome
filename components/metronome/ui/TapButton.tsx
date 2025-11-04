import { useState, MouseEvent } from 'react'

export function TapButton({
  minBpm,
  maxBpm,
  updateState,
}: {
  minBpm: number
  maxBpm: number
  updateState: (val: number) => void
}) {
  const [tapTimes, setTapTimes] = useState<number[]>([])
  const handleTap = (e: MouseEvent<HTMLButtonElement>) => {
    const now: number = Date.now()
    setTapTimes([...tapTimes, now])

    if (tapTimes.length >= 2) {
      const timeDifference: number = now - tapTimes[tapTimes.length - 2]
      if (timeDifference < 5000) {
        const newTempo: number = Math.round(60000 / timeDifference) * 2
        const normalizedTempo = Math.min(Math.max(newTempo, minBpm), maxBpm)
        updateState(normalizedTempo)
      }
    }
  }
  return (
    <button
      type="button"
      onClick={handleTap}
      className="btn btn-circle h-24 grow neutral btn-outline"
    >
      Tap
    </button>
  )
}
