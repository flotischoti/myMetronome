import { MetronomeFull } from '../Metronome'
import { MetronomeAction } from '../hooks/useMetronomeReducer'
import { Dispatch, ChangeEvent } from 'react'

export function StatsArea({
  metronome,
  dispatch,
}: {
  metronome: MetronomeFull
  dispatch: Dispatch<MetronomeAction>
}) {
  const handleShowStats = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_SHOW_STATS', payload: !metronome.showStats })
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
          <span>Stats</span>
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
                {metronome[timerName] > 1000 * 60 * 60 && (
                  <>
                    <span
                      style={
                        {
                          '--value': (
                            '0' +
                            Math.floor(metronome[timerName] / (1000 * 60 * 60))
                          ).slice(-2),
                        } as React.CSSProperties
                      }
                    ></span>
                    :
                  </>
                )}
                <span
                  style={
                    {
                      '--value': (
                        '0' + Math.floor((metronome[timerName] / 60000) % 60)
                      ).slice(-2),
                    } as React.CSSProperties
                  }
                ></span>
                :
                <span
                  style={
                    {
                      '--value': (
                        '0' + Math.floor((metronome[timerName] / 1000) % 60)
                      ).slice(-2),
                    } as React.CSSProperties
                  }
                ></span>
              </span>
            </div>
          )
        })}
    </div>
  )
}
