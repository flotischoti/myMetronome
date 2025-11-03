import { Icon, IconMinus } from '@tabler/icons-react'
import { useRef, MouseEvent, TouchEvent } from 'react'

export function BpmButton({
  minBpm,
  maxBpm,
  step,
  Icon,
  updateState,
}: {
  minBpm: number
  maxBpm: number
  step: number
  Icon: Icon
  updateState: (val: number) => void
}) {
  const doChangeBpm = useRef(true)
  const changeBpmClickVerifier = useRef(0)

  const handleChangeBpm = (
    e: MouseEvent<HTMLButtonElement> | TouchEvent<HTMLButtonElement>,
    changeStep: number,
  ) => {
    doChangeBpm.current = true
    updateState(changeStep)

    changeBpmClickVerifier.current++
    const verifier = changeBpmClickVerifier.current
    holdDownBpmChange(changeStep, verifier)
  }

  const holdDownBpmChange = async (changeStep: number, verifier: number) => {
    let delay = 2
    while (doChangeBpm.current) {
      await new Promise((resolve) => setTimeout(resolve, 1000 / delay))
      if (doChangeBpm.current && verifier == changeBpmClickVerifier.current) {
        updateState(changeStep)
        delay = delay * 1.5
      }
    }
  }

  const stopChangingBpm = (
    e: MouseEvent<HTMLButtonElement> | TouchEvent<HTMLButtonElement>,
  ) => {
    console.log(e.type)
    doChangeBpm.current = false
  }

  return (
    <button
      type="button"
      onMouseDown={(e) => handleChangeBpm(e, step)}
      onTouchStart={(e) => {
        handleChangeBpm(e, step)
      }}
      onTouchEnd={(e) => {
        stopChangingBpm(e)
        e.preventDefault()
      }}
      onMouseUp={stopChangingBpm}
      className="btn grow join-item rounded-full btn-outline no-animation"
    >
      <Icon />
    </button>
  )
}
