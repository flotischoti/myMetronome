'use client'

import { useState } from 'react'
import { StoredMetronome } from '../metronome/Metronome'
import MetronomeCard from './MetronomeCard'

const MetronomeCardContainer = ({
  metronomes,
  command,
}: {
  metronomes: StoredMetronome[]
  command: string | undefined
}) => {
  const [metrenomeForDeletion, setMetronomeForDeletion] = useState<
    undefined | number
  >(undefined)

  return (
    <div className="shadow rounded-md">
      {metronomes.map((m, i) => (
        <MetronomeCard
          key={i}
          metronome={m}
          command={command}
          idForDeletion={metrenomeForDeletion}
          setForDeletion={setMetronomeForDeletion}
        />
      ))}
    </div>
  )
}

export default MetronomeCardContainer
