'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare, faCheck } from '@fortawesome/free-solid-svg-icons'
import { ChangeEvent, MouseEvent, useEffect, useState, useRef } from 'react'
import styles from './metronome.module.scss'
import MainButton from '../shared/Button'
import { faLess } from '@fortawesome/free-brands-svg-icons'

export interface StoredMetronome {
  title: string
  bpm: number
  beats: number
  stressFirst: boolean
  totalTime: number
  useTimer: boolean
  timer: number
}

export interface Metronome extends StoredMetronome {
  isPlaying: boolean
  currentTime: number
  sessionTime: number
  activeTimer: number
}

const ts: number[] = []
const maxBpm = 300
const minBpm = 20
const timerChangeInterval = 30000

const m: Metronome = {
  title: 'Goldfinger - Superman',
  bpm: 110,
  isPlaying: false,
  beats: 4,
  stressFirst: false,
  totalTime: 90000,
  currentTime: 0,
  sessionTime: 0,
  useTimer: false,
  timer: timerChangeInterval * 4,
  activeTimer: timerChangeInterval * 4,
}

export default function Metronome() {
  const [isEditTitle, setEditTitle] = useState(false)
  const [metronome, setMetronome] = useState(m)
  const [tapSequence, setTapSequence] = useState(ts)
  const bpmIncreaseState = useRef(null)
  const bpmDecreaseState = useRef(null)
  const clickInterval = useRef(null)

  useEffect(() => calculateBpmFromTaps(), [JSON.stringify(tapSequence)])

  useEffect(() => {
    return () => {
      stopIncreaseBpm()
      stopDecreaseBpm()
    }
  }, [])

  useEffect(() => {
    let timeInterval: NodeJS.Timer
    if (metronome.isPlaying) {
      new Audio('click.mp3').play()

      timeInterval = setInterval(() => {
        setMetronome((prev) => {
          return {
            ...prev,
            totalTime: prev.totalTime + 1000,
            currentTime: prev.currentTime + 1000,
            sessionTime: prev.sessionTime + 1000,
            activeTimer: !prev.useTimer
              ? prev.timer
              : prev.activeTimer > 1000
              ? prev.activeTimer - 1000
              : 0,
            isPlaying: prev.activeTimer > 1000 ? true : false,
          }
        })
      }, 1000)
      clickInterval.current = setInterval(() => {
        new Audio('click.mp3').play()
      }, 60000 / metronome.bpm)
    } else {
      clearInterval(timeInterval)
      clearInterval(clickInterval.current)
    }
    return () => {
      clearInterval(timeInterval)
      clearInterval(clickInterval.current)
    }
  }, [metronome.isPlaying])

  useEffect(() => {
    if (metronome.isPlaying) {
      clearInterval(clickInterval.current)
      clickInterval.current = setInterval(() => {
        new Audio('click.mp3').play()
      }, 60000 / metronome.bpm)
    }
  }, [metronome.bpm])

  const changeBpm = (e: ChangeEvent<HTMLInputElement>) => {
    setMetronome({ ...metronome, bpm: +e.target.value })
  }

  const startDecreaseBpm = (e: MouseEvent<HTMLButtonElement>) => {
    if (bpmDecreaseState.current) return
    bpmDecreaseState.current = setInterval(() => {
      setMetronome((prev) => {
        return { ...prev, bpm: prev.bpm - 1 }
      })
    }, 50)
  }

  const stopDecreaseBpm = () => {
    if (bpmDecreaseState.current) {
      clearInterval(bpmDecreaseState.current)
      bpmDecreaseState.current = null
    }
  }

  const startIncreaseBpm = (e: MouseEvent<HTMLButtonElement>) => {
    if (bpmIncreaseState.current) return
    bpmIncreaseState.current = setInterval(() => {
      setMetronome((prev) => {
        return { ...prev, bpm: prev.bpm + 1 }
      })
    }, 50)
  }

  const stopIncreaseBpm = () => {
    if (bpmIncreaseState.current) {
      clearInterval(bpmIncreaseState.current)
      bpmIncreaseState.current = null
    }
  }

  const decreaseBeats = (e: MouseEvent<HTMLButtonElement>) => {
    setMetronome({ ...metronome, beats: metronome.beats - 1 })
  }

  const increaseBeats = (e: MouseEvent<HTMLButtonElement>) => {
    setMetronome({ ...metronome, beats: metronome.beats + 1 })
  }

  const playPause = (e?: MouseEvent<HTMLButtonElement>) => {
    setMetronome({
      ...metronome,
      isPlaying: !metronome.isPlaying,
      currentTime: metronome.isPlaying ? metronome.currentTime : 0,
      activeTimer: metronome.timer,
    })
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

  const setTimer = (e: ChangeEvent<HTMLInputElement>) => {
    setMetronome({
      ...metronome,
      useTimer: !metronome.useTimer,
      activeTimer: metronome.timer,
    })
  }

  const increaseTimer = (e: MouseEvent<HTMLButtonElement>) => {
    if (metronome.isPlaying && metronome.useTimer) {
      setMetronome({
        ...metronome,
        activeTimer: metronome.activeTimer + timerChangeInterval,
      })
    } else {
      setMetronome({
        ...metronome,
        timer: metronome.timer + timerChangeInterval,
        activeTimer: metronome.timer + timerChangeInterval,
      })
    }
  }

  const decreaseTimer = (e: MouseEvent<HTMLButtonElement>) => {
    if (metronome.isPlaying && metronome.useTimer) {
      setMetronome({
        ...metronome,
        activeTimer: metronome.activeTimer - timerChangeInterval,
      })
    } else {
      setMetronome({
        ...metronome,
        timer: metronome.timer - timerChangeInterval,
        activeTimer: metronome.timer - timerChangeInterval,
      })
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
                onMouseDown={startDecreaseBpm}
                onMouseUp={stopDecreaseBpm}
                onMouseLeave={stopDecreaseBpm}
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
                onMouseDown={startIncreaseBpm}
                onMouseUp={stopIncreaseBpm}
                onMouseLeave={stopIncreaseBpm}
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
        <div id="metronomeTimeArea-1">
          <div
            id="metronomeCountdownArea-1"
            className="flex justify-between mt-4"
          >
            <div id="countdownCheckboxPane-1" className="flex items-center ">
              <input
                id="timerCheckbox-1"
                type="checkbox"
                checked={metronome.useTimer}
                onChange={setTimer}
                className="appearance-none w-5 h-5 bg-violet-500 text-violet-500 border-2 border-gray-300 rounded-sm focus:outline-none focus:ring-0 cursor-pointer transition duration-200"
              />
              <label
                htmlFor="timerCheckbox-1"
                className="ml-2 text-sm cursor-pointer"
              >
                User timer
              </label>
            </div>
            <div id="countdownSettingsArea-1" className="">
              <button
                className="border border-grey-600 rounded w-6 h-6 leading-none inline-flex justify-center items-center"
                disabled={metronome.timer <= timerChangeInterval}
                onClick={decreaseTimer}
              >
                -
              </button>
              <span className="ml-3">
                {('0' + Math.floor((metronome.activeTimer / 60000) % 60)).slice(
                  -2
                )}
                :
              </span>
              <span className="mr-3">
                {('0' + Math.floor((metronome.activeTimer / 1000) % 60)).slice(
                  -2
                )}
              </span>
              <button
                className="border border-grey-600 rounded w-6 h-6 leading-none inline-flex justify-center items-center"
                disabled={metronome.timer >= timerChangeInterval * 119}
                onClick={increaseTimer}
              >
                +
              </button>
            </div>
          </div>
          <div
            id="metronomeStopwatchArea-1"
            className="flex justify-between mt-3"
          >
            {['current', 'session', 'total'].map((type, i) => {
              const timerName = type + 'Time'
              return (
                <div
                  id={`${type}TimeArea-1`}
                  className="flex flex-col items-center"
                  key={i}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                  <div id={`${type}TimeNumbers-1`}>
                    <span>
                      {(
                        '0' + Math.floor((metronome[timerName] / 60000) % 60)
                      ).slice(-2)}
                      :
                    </span>
                    <span>
                      {(
                        '0' + Math.floor((metronome[timerName] / 1000) % 60)
                      ).slice(-2)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
