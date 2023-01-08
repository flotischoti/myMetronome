'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare, faCheck } from '@fortawesome/free-solid-svg-icons'
import { ChangeEvent, MouseEvent, useEffect, useState } from 'react'
import styles from './metronome.module.scss'
import MainButton from '../shared/Button'

export interface Metronome {
  title: string
  bpm: number
  isPlaying: boolean
  beats: number
}

const m: Metronome = {
  title: 'Goldfinger - Superman',
  bpm: 110,
  isPlaying: false,
  beats: 4,
}

const ts: number[] = []
const maxBpm = 300
const minBpm = 20

export default function Metronome() {
  const [isEditTitle, setEditTitle] = useState(false)
  const [metronome, setMetronome] = useState(m)
  const [tapSequence, setTapSequence] = useState(ts)

  useEffect(() => calculateBpmFromTaps(), [JSON.stringify(tapSequence)])

  const changeBpm = (e: ChangeEvent<HTMLInputElement>) => {
    setMetronome({ ...metronome, bpm: +e.target.value })
  }

  const decrease = (e: MouseEvent<HTMLButtonElement>) => {
    setMetronome({ ...metronome, bpm: metronome.bpm - 1 })
  }

  const increase = (e: MouseEvent<HTMLButtonElement>) => {
    setMetronome({ ...metronome, bpm: metronome.bpm + 1 })
  }

  const playPause = (e: MouseEvent<HTMLButtonElement>) => {
    setMetronome({ ...metronome, isPlaying: !metronome.isPlaying })
  }

  const handleTap = (e: MouseEvent<HTMLButtonElement>) => {
    const currentClickTimeStamp = Date.now()
    if (
      tapSequence.length == 0 ||
      (currentClickTimeStamp - tapSequence.at(-1)) / 1000 > 2
    ) {
      setTapSequence([currentClickTimeStamp])
    } else {
      setTapSequence([...tapSequence, currentClickTimeStamp])
    }
  }

  const calculateBpmFromTaps = (): void => {
    if (tapSequence.length > 1) {
      const timeWindow =
        tapSequence.at(-1) -
        tapSequence.at(Math.min(tapSequence.length, metronome.beats) * -1)
      const taps = Math.min(tapSequence.length, metronome.beats)
      const newBpm = Math.floor((taps / timeWindow) * 60000)
      const normalizedBpm = Math.min(Math.max(newBpm, minBpm), maxBpm)
      setMetronome({ ...metronome, bpm: normalizedBpm })
    }
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
              min={minBpm}
              max={maxBpm}
              value={metronome.bpm}
              onChange={changeBpm}
              className={`${styles.slider} appearance-none w-full h-0.5 mb-6 cursor-pointer bg-blue-200 rounded-lg`}
            />
            <div className="flex justify-between">
              <MainButton
                onClick={decrease}
                className="w-1/6 rounded-sm border-black-600"
              >
                -
              </MainButton>
              <MainButton
                onClick={playPause}
                className="w-2/6 rounded-sm border-black-600"
              >
                {metronome.isPlaying ? 'Pause' : 'Play'}
              </MainButton>
              <MainButton
                onClick={increase}
                className="w-1/6 rounded-sm border-black-600"
              >
                +
              </MainButton>
            </div>
            <br />
            <MainButton
              onClick={handleTap}
              className="w-full h-20 rounded-sm border-black-600"
            >
              Tap
            </MainButton>
          </div>
        </div>
      </div>
    </section>
  )
}
