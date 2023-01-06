'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare, faCheck } from '@fortawesome/free-solid-svg-icons'
import { ChangeEvent, useState } from 'react'
import styles from './metronome.module.scss'

export interface Metronome {
  title: string
  bpm: number
}

export default function Metronome() {
  const m: Metronome = {
    title: 'Goldfinger - Superman',
    bpm: 110,
  }
  const [isEditTitle, setEditTitle] = useState(false)
  const [metronome, setMetronome] = useState(m)

  const changeBpm = (e: ChangeEvent<HTMLInputElement>) => {
    m.bpm = +e.target.value
    setMetronome(m)
  }

  return (
    <section className="border-2">
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
      <div id="metronomeBodyArea-1">
        <div id="metronomeBpmArea-1" className="flex flex-col items-center">
          <div id="metronomeBpmDisplay-1">
            <span className="text-7xl font-bold">{metronome.bpm}</span>
          </div>
          <div id="metronomeBpmControls-1" className="w-full px-4">
            <input
              type="range"
              min="1"
              max="250"
              value={metronome.bpm}
              onChange={changeBpm}
              className={`${styles.slider} appearance-none w-full h-0.5 mb-6 cursor-pointer bg-blue-200 rounded-lg`}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
