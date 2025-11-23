import { Icon } from '@tabler/icons-react'
import { Dispatch, useRef } from 'react'
import { MetronomeAction } from '../hooks/useMetronomeReducer'

export function BpmButton({
  step,
  Icon,
  dispatch,
}: {
  step: number
  Icon: Icon
  dispatch: Dispatch<MetronomeAction>
}) {
  const doChangeBpm = useRef(true)
  const changeBpmClickVerifier = useRef(0)

  const handleChangeBpm = () => {
    doChangeBpm.current = true
    dispatch({ type: 'CHANGE_BPM', payload: step })

    changeBpmClickVerifier.current++
    const verifier = changeBpmClickVerifier.current
    holdDownBpmChange(verifier)
  }

  const holdDownBpmChange = async (verifier: number) => {
    let delay = 2
    while (doChangeBpm.current) {
      await new Promise((resolve) => setTimeout(resolve, 1000 / delay))
      if (doChangeBpm.current && verifier === changeBpmClickVerifier.current) {
        dispatch({ type: 'CHANGE_BPM', payload: step })
        delay = delay * 1.5
      }
    }
  }

  const stopChangingBpm = () => {
    doChangeBpm.current = false
  }

  return (
    <button
      type="button"
      onMouseDown={handleChangeBpm}
      onTouchStart={handleChangeBpm}
      onTouchEnd={(e) => {
        stopChangingBpm()
        e.preventDefault()
      }}
      onMouseUp={stopChangingBpm}
      className="btn grow join-item rounded-full btn-outline no-animation"
    >
      <Icon />
    </button>
  )
}
