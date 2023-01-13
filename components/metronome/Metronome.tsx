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
  stressFirst: boolean
}

const m: Metronome = {
  title: 'Goldfinger - Superman',
  bpm: 110,
  isPlaying: false,
  beats: 4,
  stressFirst: false,
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

  const decreaseBpm = (e: MouseEvent<HTMLButtonElement>) => {
    setMetronome({ ...metronome, bpm: metronome.bpm - 1 })
  }

  const increaseBpm = (e: MouseEvent<HTMLButtonElement>) => {
    setMetronome({ ...metronome, bpm: metronome.bpm + 1 })
  }

  const decreaseBeats = (e: MouseEvent<HTMLButtonElement>) => {
    setMetronome({ ...metronome, beats: metronome.beats - 1 })
  }

  const increaseBeats = (e: MouseEvent<HTMLButtonElement>) => {
    setMetronome({ ...metronome, beats: metronome.beats + 1 })
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

  const stressFirst = (e: ChangeEvent<HTMLInputElement>) => {
    setMetronome({ ...metronome, stressFirst: !metronome.stressFirst })
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
      <div id="metronomeBodyArea-1" className="px-4 pb-4">
        <div id="metronomeBpmArea-1" className="flex flex-col items-center">
          <div id="metronomeBpmDisplay-1">
            <span className="text-7xl font-bold">{metronome.bpm}</span>
          </div>
          {new Array(metronome.beats).map((v, i) => (
            <span key={i + 1}>{i + 1}</span>
          ))}
          <div id="metronomeBpmControls-1" className="w-full">
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
                onClick={decreaseBpm}
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
                onClick={increaseBpm}
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
        <div id="metronomeSettingsArea-1">
          <div id="beatArea">
            <div id="beatControlArea" className="flex justify-between mt-4">
              <div id="stressCheckboxPane-1" className="flex items-center ">
                <input
                  id="stressCheckbox-1"
                  type="checkbox"
                  checked={metronome.stressFirst}
                  onChange={stressFirst}
                  className="appearance-none w-5 h-5 bg-violet-500 text-violet-500 border-2 border-gray-300 rounded-sm focus:outline-none focus:ring-0 cursor-pointer transition duration-200"
                />
                <label
                  htmlFor="stressCheckbox-1"
                  className="ml-2 text-sm cursor-pointer"
                >
                  Stress 1<sup>st</sup> beat
                </label>
              </div>
              <div id="beatCountArea-1" className="flex items-center">
                <button
                  className="border border-grey-600 rounded w-6 h-6 leading-none inline-flex justify-center items-center"
                  disabled={metronome.beats <= 1}
                  onClick={decreaseBeats}
                >
                  -
                </button>
                <span className="mr-1 ml-3">{metronome.beats}</span>
                <span className="mr-3 ml-1">Beats</span>
                <button
                  className="border border-grey-600 rounded w-6 h-6 leading-none inline-flex justify-center items-center"
                  disabled={metronome.beats >= 12}
                  onClick={increaseBeats}
                >
                  +
                </button>
              </div>
            </div>
            <div
              id="beatVisualizationArea"
              className="flex justify-center space-x-2 mt-3"
            >
              {Array.from(Array(metronome.beats)).map((v, i) => (
                <span
                  key={i}
                  className="border-2 border-grey-600 rounded-full h-4 w-4"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
