// components/metronome-list/MetronomeCardContainer.tsx
'use client'

import { useState } from 'react'
import { StoredMetronome } from '../metronome/Metronome'
import MetronomeCard from './MetronomeCard'
import { ToastContainer } from '@/components/toast/ToastContainer'

interface MetronomeCardContainerProps {
  metronomes: StoredMetronome[]
  command: string | undefined
}

const MetronomeCardContainer = ({
  metronomes,
  command,
}: MetronomeCardContainerProps) => {
  const [metronomeForDeletion, setMetronomeForDeletion] = useState<
    number | undefined
  >(undefined)

  return (
    <>
      <div className="shadow rounded-md">
        {metronomes.map((m, i) => (
          <MetronomeCard
            key={m.id || i}
            metronome={m}
            idForDeletion={metronomeForDeletion}
            setForDeletion={setMetronomeForDeletion}
          />
        ))}
      </div>

      <ToastContainer command={command} />
    </>
  )
}

export default MetronomeCardContainer
