'use client'

import { useEffect, useState } from 'react'
import { StoredMetronome } from '../metronome/Metronome'
import MetronomeCard from './MetronomeCard'

const MetronomeCardContainer = ({
  metronomes,
  command,
}: {
  metronomes: StoredMetronome[]
  command: string | undefined
}) => {
  const [showToast, setShowToast] = useState(false)
  const [tostMessage, setToastMessage] = useState('')
  const [metrenomeForDeletion, setMetronomeForDeletion] = useState<
    undefined | number
  >(undefined)

  useEffect(() => {
    if (command === 'deleted') {
      setShowToast(true)
      setToastMessage('Metronome deleted')
      setTimeout(() => {
        setShowToast(false)
      }, 2000)
    }
  }, [])

  return (
    <>
      <div className="shadow rounded-md">
        {metronomes.map((m, i) => (
          <MetronomeCard
            key={i}
            metronome={m}
            idForDeletion={metrenomeForDeletion}
            setForDeletion={setMetronomeForDeletion}
          />
        ))}
      </div>
      {showToast && (
        <div className="toast">
          <div className="alert alert-success">
            <span>{tostMessage}</span>
          </div>
        </div>
      )}
    </>
  )
}

export default MetronomeCardContainer
