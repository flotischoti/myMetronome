'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { StoredMetronome } from '../metronome/Metronome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MouseEvent } from 'react'

export default function MetronomeCard({
  metronome,
}: {
  metronome: StoredMetronome
}) {
  const router = useRouter()

  async function handleDelete(e: MouseEvent<HTMLElement>) {
    e.stopPropagation()
    await fetch(`/api/users/1/metronomes/${metronome.id}`, {
      method: 'DELETE',
    })
      .then(() => router.push('/list/'))
      .catch(async (res) => console.log(await res.json()))
  }

  return (
    <div
      id="card"
      className="h-15 p-3 mb-3 border border-gray-200 rounded-lg shadow hover:bg-gray-100 flex justify-between"
    >
      <Link href={`/metronome/${metronome.id}`} className="w-full">
        <div id="info">
          <h5 className="text-1xl font-bold tracking-tight text-gray-900">
            {metronome.name}
          </h5>
          <p className="font-normal text-gray-700">{metronome.bpm} bpm</p>
        </div>
      </Link>
      <div id="controls" className="flex items-center">
        <div className="hover:drop-shadow-xl mr-2" onClick={handleDelete}>
          <FontAwesomeIcon
            icon={faTrash}
            className="hover:cursor-pointer"
            size="lg"
          />
        </div>
      </div>
    </div>
  )
}
