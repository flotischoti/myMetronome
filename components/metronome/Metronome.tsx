'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare, faCheck } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'

export interface metronome {
  title: string
}

export default function Metronome() {
  const [isEditTitle, setEditTitle] = useState(false)

  return (
    <section className="m-2 border-2">
      <div id="metronomeTitleArea-1" className="p-2 border-b-2 ">
        {isEditTitle ? (
          <div id="displayTitleArea-1" className="flex space-x-2 items-center">
            <input
              type="text"
              value="Metronome Name"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
            <FontAwesomeIcon
              icon={faCheck}
              className="hover:cursor-pointer"
              onClick={() => setEditTitle(false)}
            />
          </div>
        ) : (
          <div id="editTitleArea-1" className="flex space-x-2 items-center">
            <h1 className="font-extrabold">Metronome Name</h1>
            <FontAwesomeIcon
              icon={faPenToSquare}
              className="hover:cursor-pointer"
              onClick={() => setEditTitle(true)}
            />
          </div>
        )}
      </div>
    </section>
  )
}
