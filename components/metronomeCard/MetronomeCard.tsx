'use client'

import { StoredMetronome } from '../metronome/Metronome'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MouseEvent, useState } from 'react'
import { IconTrash } from '@tabler/icons-react'

const MetronomeCard = ({ metronome }: { metronome: StoredMetronome }) => {
  const router = useRouter()
  const [showToast, setShowToast] = useState(false)

  async function handleDelete(e: MouseEvent<HTMLElement>) {
    e.stopPropagation()
    await fetch(`/api/metronomes/${metronome.id}`, {
      method: 'DELETE',
    })
      .then(() => router.refresh())
      .then(() => {
        setShowToast(true)
        setTimeout(() => {
          setShowToast(false)
        }, 3000)
      })
      .catch(async (res) => console.log(await res.json()))
  }

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
            <div id="controls" className="flex items-center p-4">
              <div className="hover:drop-shadow-xl mr-2" onClick={handleDelete}>
                <IconTrash className="hover:cursor-pointer" />
              </div>
            </div>
          </div>
        </div>
      </div>
      {showToast && (
        <div className="toast">
          <div className="alert alert-success">
            <span>Metronome deleted</span>
          </div>
        </div>
      )}
    </>
  )
}

export default MetronomeCard
