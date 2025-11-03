import { useRef, useState, MouseEvent } from 'react'
import { MetronomeFull } from '../Metronome'
import { IconLock, IconLockOpen } from '@tabler/icons-react'

export function LockUnlockButton({
  metronome,
  setMetronome,
  setSuccessState,
}: {
  metronome: MetronomeFull
  setMetronome: Function
  setSuccessState: Function
}) {
  const waitingClick = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  )
  const [lastClick, setLastClick] = useState(0)
  const lockUnlock = (e: MouseEvent<HTMLButtonElement>) => {
    if (lastClick && e.timeStamp - lastClick < 250 && waitingClick) {
      setLastClick(0)
      clearTimeout(waitingClick.current)
      waitingClick.current = undefined
      if (metronome.locked) setMetronome({ ...metronome, locked: false })
    } else {
      setLastClick(e.timeStamp)
      waitingClick.current = setTimeout(() => {
        waitingClick.current = undefined
        if (metronome.locked) setSuccessState('Double-click to unlock', 'info')
      }, 251)
      if (!metronome.locked) setMetronome({ ...metronome, locked: true })
    }
  }
  return (
    <button
      type="button"
      className="btn btn-outline btn-neutral btn-square btn-sm"
      onClick={lockUnlock}
    >
      {metronome.locked ? <IconLock /> : <IconLockOpen />}
    </button>
  )
}
