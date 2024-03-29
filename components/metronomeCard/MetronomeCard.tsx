'use client'

import { StoredMetronome } from '../metronome/Metronome'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { IconTrash, IconX } from '@tabler/icons-react'
import { useFormState } from 'react-dom'
import { useFormStatus } from 'react-dom'
import { deleteMetronomeAction } from '../../app/actions'
import { useEffect, useState } from 'react'

const initialState = {
  message: '',
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" className="hover:drop-shadow-xl mr-2 btn btn-error">
      {pending ? (
        <span className="loading loading-spinner loading-sm" />
      ) : (
        <IconTrash className="hover:cursor-pointer" />
      )}
      Confirm
    </button>
  )
}

const MetronomeCard = ({
  metronome,
  setForDeletion,
  idForDeletion,
}: {
  metronome: StoredMetronome
  setForDeletion: (id: number | undefined) => void
  idForDeletion: number | undefined
}) => {
  const deleteMetronomeFromCard = deleteMetronomeAction.bind(
    null,
    metronome.id!,
    usePathname(),
  )
  const [state, formAction] = useFormState(
    deleteMetronomeFromCard,
    initialState,
  )
  const [showAlert, setShowAlert] = useState(false)

  useEffect(() => {
    if (state?.message) {
      setShowAlert(true)
      setTimeout(() => {
        setShowAlert(false)
      }, 2000)
    }
  }, [state])

  return (
    <>
      <div
        id="card"
        className="card w-full rounded-md hover:rounded-md bg-base-100 my-1 hover:bg-base-200"
      >
        <div className="card-body p-0 relative">
          <div className="flex justify-end">
            <Link
              href={`/metronome/${metronome.id}`}
              className="w-full py-4 px-6"
              prefetch={false}
            >
              <div id="cardTitle" className="card-title">
                <div className="flex-column sm:flex flex-wrap items-center gap-4">
                  <h5 className="text-1xl font-bold tracking-tight">
                    {metronome.name}
                  </h5>
                  <div className="badge badge-neutral mr-2">
                    {metronome.bpm} bpm
                  </div>
                </div>
              </div>
              <div id="classBody" className="mt-1">
                <span>Playtime: </span>
                {`${
                  Math.floor(metronome.timeUsed / 3600000) % 24
                }h:${Math.floor(
                  (metronome.timeUsed / 60000) % 60,
                )}m:${Math.floor((metronome.timeUsed / 1000) % 60)}s`}
                <div className="text-xs mt-2 flex justify-end">
                  <span>
                    {`Last Opened: ${metronome.lastOpened?.toLocaleString(
                      'de-de',
                      {
                        dateStyle: 'short',
                        timeStyle: 'short',
                        hour12: false,
                      },
                    )}`}
                  </span>
                </div>
              </div>
            </Link>
            <div className="divider divider-horizontal mx-0"></div>
            <div className="flex items-center p-4">
              <button
                type="button"
                className="hover:drop-shadow-xl mr-2 btn btn-square btn-sm btn-outline btn-error"
                onClick={(e) => setForDeletion(metronome.id!)}
              >
                <IconTrash className="hover:cursor-pointer text-error" />
              </button>
            </div>
          </div>
          {idForDeletion == metronome.id && (
            <form
              id="controls"
              action={formAction}
              className="flex w-full h-full items-center justify-between p-8 absolute bg-base-100 bg-opacity-90"
            >
              <button
                type="button"
                className="btn btn-neutral"
                onClick={(e) => setForDeletion(undefined)}
              >
                <IconX />
                Cancel
              </button>
              <SubmitButton />
            </form>
          )}
        </div>
      </div>
      {showAlert && (
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
