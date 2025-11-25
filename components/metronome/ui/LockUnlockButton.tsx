import { useRef, useState, MouseEvent, Dispatch } from 'react'
import { MetronomeFull } from '../Metronome'
import { MetronomeAction } from '../hooks/useMetronomeReducer'
import { IconLock, IconLockOpen } from '@tabler/icons-react'
import { useToast } from '@/contexts/ToastContext'

export function LockUnlockButton({
  metronome,
  dispatch,
}: {
  metronome: MetronomeFull
  dispatch: Dispatch<MetronomeAction>
}) {
  const toast = useToast()
  const waitingClick = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  )
  const [lastClick, setLastClick] = useState(0)

  const lockUnlock = (e: MouseEvent<HTMLButtonElement>) => {
    if (lastClick && e.timeStamp - lastClick < 250 && waitingClick) {
      setLastClick(0)
      clearTimeout(waitingClick.current)
      waitingClick.current = undefined
      if (metronome.locked) dispatch({ type: 'SET_LOCKED', payload: false })
    } else {
      setLastClick(e.timeStamp)
      waitingClick.current = setTimeout(() => {
        waitingClick.current = undefined
        if (metronome.locked) toast.show('Double-click to unlock', 'info')
      }, 251)
      if (!metronome.locked) dispatch({ type: 'SET_LOCKED', payload: true })
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
