import { MetronomeFull } from '../Metronome'
import { ChangeEvent } from 'react'

export function StatsArea({
  metronome,
  setMetronome,
}: {
  metronome: MetronomeFull
  setMetronome: Function
}) {
  const handleShowStats = (e: ChangeEvent<HTMLInputElement>) => {
    setMetronome({ ...metronome, showStats: !metronome.showStats })
  }

  return (
    <div
      id="metronomeStopwatchArea-1"
      className="flex justify-between items-center mt-3 gap-0"
    >
      <div id="metronomeStopWatchControl-1">
        <input
          id="stopWatchCheckbox-1"
          type="checkbox"
          checked={metronome.showStats}
          onChange={handleShowStats}
          className="checkbox checkbox-sm"
        />
        <label
          htmlFor="stopWatchCheckbox-1"
          className="ml-2 text-sm cursor-pointer"
        >
          <span className="">Show usage</span>
        </label>
      </div>
      {metronome.showStats &&
        ['current', 'session', 'time'].map((type, i) => {
          const timerName = (type + 'Used') as
            | 'currentUsed'
            | 'sessionUsed'
            | 'timeUsed'
          return (
            <div
              id={`${type}TimeArea-1`}
              className="flex flex-col items-center"
              key={i}
            >
              <span className="text-sm">
                {type === 'time'
                  ? 'Total'
                  : type.charAt(0).toUpperCase() + type.slice(1)}
              </span>
              <span
                id={`${type}TimeNumbers-1`}
                className="countdown font-mono text-sm font-sans"
              >
                <span
                  style={{
                    '--value': (
                      '0' + Math.floor((metronome[timerName] / 60000) % 60)
                    ).slice(-2),
                  }}
                ></span>
                :
                <span
                  style={{
                    '--value': (
                      '0' + Math.floor((metronome[timerName] / 1000) % 60)
                    ).slice(-2),
                  }}
                ></span>
              </span>
            </div>
          )
        })}
    </div>
  )
}
