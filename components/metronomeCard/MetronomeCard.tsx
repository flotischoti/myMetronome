'use client'

import { StoredMetronome } from '../metronome/Metronome'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { IconTrash } from '@tabler/icons-react'
import { experimental_useFormState as useFormState } from 'react-dom'
import { experimental_useFormStatus as useFormStatus } from 'react-dom'
import { deleteMetronomeAction } from '../../app/actions'

const initialState = {
  message: null,
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" className="hover:drop-shadow-xl mr-2">
      {pending ? (
        <span className="loading loading-spinner loading-md" />
      ) : (
        <IconTrash className="hover:cursor-pointer" />
      )}
    </button>
  )
}

const MetronomeCard = ({
  metronome,
  command,
}: {
  metronome: StoredMetronome
  command: string | undefined
}) => {
  const [showToast, setShowToast] = useState(false)
  const [tostMessage, setToastMessage] = useState('')
  const deleteMetronomeFromCard = deleteMetronomeAction.bind(
    null,
    metronome.id,
    usePathname()
  )
  const [state, formAction] = useFormState(
    deleteMetronomeFromCard,
    initialState
  )

  useEffect(() => {
    if (command == 'deleted') {
      setShowToast(true)
      setToastMessage('Metronome deleted')
      setTimeout(() => {
        setShowToast(false)
      }, 2000)
    }
  }, [])

  return (
    <>
      <div
        id="card"
        className="card w-full bg-base-100 shadow-xl my-2 hover:bg-slate-50"
      >
        <div className="card-body p-0">
          <div className="flex justify-end">
            <Link
              href={`/metronome/${metronome.id}`}
              className="w-full py-4 px-6"
              prefetch={false}
            >
              <div id="info" className="card-title">
                <h5 className="text-1xl font-bold tracking-tight text-gray-900">
                  {metronome.name}
                </h5>
              </div>
              <p className="font-normal text-gray-700">{metronome.bpm} bpm</p>
            </Link>
            <div className="divider divider-horizontal mx-0"></div>
            <form
              id="controls"
              action={formAction}
              className="flex items-center p-4"
            >
              <SubmitButton />
            </form>
          </div>
        </div>
      </div>
      {showToast && (
        <div className="toast">
          <div className="alert alert-success">
            <span>{tostMessage}</span>
          </div>
        </div>
      )}
      {state?.message && (
        <div className="toast">
          <div className="alert alert-error">
            <span>{state.message}</span>
          </div>
        </div>
      )}
    </>
  )
}

export default MetronomeCard
