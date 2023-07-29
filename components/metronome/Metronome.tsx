'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare, faCheck } from '@fortawesome/free-solid-svg-icons'
import { ChangeEvent, MouseEvent, useEffect, useState, useRef } from 'react'
import styles from './metronome.module.scss'
import MainButton from '../shared/Button'
import { faLess } from '@fortawesome/free-brands-svg-icons'
import { useRouter } from 'next/navigation'

export interface StoredMetronome {
  id?: number
  name: string
  bpm: number
  beats: number
  stressFirst: boolean
  timeUsed: number
  timerActive: boolean
  timerValue: number
  showStats: boolean
  owner?: number
  lastOpened?: Date
}

interface LocalMetronomeSettings {
  isPlaying: boolean
  currentUsed: number
  sessionUsed: number
  activeTimer: number
}

const ts: number[] = []
const maxBpm = 300
const minBpm = 20
const timerChangeInterval = 30000
const clickStressed = 'click_stressed.mp3'
const clickNormal = 'click_normal.mp3'
const maxBeats = 12
const minBeats = 2

const defaultStoredMetronome: StoredMetronome = {
  name: 'Enter name',
  bpm: 120,
  beats: 4,
  stressFirst: false,
  timeUsed: 0,
  timerActive: false,
  timerValue: 120000,
  showStats: false,
}

const defaultLocalMetronome: LocalMetronomeSettings = {
  isPlaying: false,
  currentUsed: 0,
  sessionUsed: 0,
  activeTimer: 0,
}

const Metronome = ({
  dbMetronome,
  user,
}: {
  dbMetronome: StoredMetronome | null
  user: number | null
}) => {
  const media = useRef<HTMLAudioElement>(null)
  const m = dbMetronome ? dbMetronome : defaultStoredMetronome
  const [isEditTitle, setEditTitle] = useState(false)
  const [metronome, setMetronome] = useState({
    ...m,
    ...defaultLocalMetronome,
  })
  const [tapSequence, setTapSequence] = useState(ts)
  const [currentBeat, setCurrentBeat] = useState(0)
  const [saveState, setSaveState] = useState('')
  const bpmIncreaseState = useRef(null as unknown as NodeJS.Timer)
  const bpmDecreaseState = useRef(null as unknown as NodeJS.Timer)
  const clickInterval = useRef(null as unknown as NodeJS.Timer)
  const autoSaveTimer = useRef(null as unknown as NodeJS.Timer)
  const router = useRouter()

  useEffect(() => calculateBpmFromTaps(), [JSON.stringify(tapSequence)])

  useEffect(() => {
    return () => {
      stopIncreaseBpm()
      stopDecreaseBpm()
    }
  }, [])

  useEffect(() => {
    let timeInterval: NodeJS.Timer = null as unknown as NodeJS.Timer
    if (metronome.isPlaying) {
      if (!clickInterval.current) {
        clickInterval.current = setInterval(() => {
          changeCurrentBeat()
        }, 60000 / metronome.bpm)
      }
      timeInterval = setInterval(() => {
        setMetronome((prev) => {
          return {
            ...prev,
            timeUsed: prev.timeUsed + 1000,
            currentUsed: prev.currentUsed + 1000,
            sessionUsed: prev.sessionUsed + 1000,
            activeTimer: !prev.timerActive
              ? prev.timerValue
              : prev.activeTimer > 1000
              ? prev.activeTimer - 1000
              : 0,
            isPlaying: prev.activeTimer > 1000 ? true : false,
          }
        })
      }, 1000)
    } else {
      clearInterval(timeInterval)
      clearInterval(clickInterval.current)
      clickInterval.current = null as unknown as NodeJS.Timer
      setCurrentBeat(0)
      autosave()
    }
    return () => {
      clearInterval(timeInterval)
      clearInterval(clickInterval.current)
      clickInterval.current = null as unknown as NodeJS.Timer
    }
  }, [metronome.isPlaying])

  useEffect(() => {
    if (metronome.isPlaying) {
      clearInterval(clickInterval.current)
      clickInterval.current = setInterval(() => {
        changeCurrentBeat()
      }, 60000 / metronome.bpm)
    }
  }, [metronome.bpm, metronome.beats, metronome.stressFirst])

  useEffect(() => {
    // new Audio(
    //   // metronome.stressFirst && currentBeat == 1 ? clickStressed : clickNormal
    //   clickNormal
    // )
    if (metronome.isPlaying) media.current?.play()
  }, [currentBeat])

  // AutoSave
  useEffect(() => {
    autosave()
  }, [
    metronome.showStats,
    metronome.bpm,
    metronome.beats,
    metronome.stressFirst,
    metronome.timerActive,
    metronome.timerValue,
    metronome.name,
  ])

  // useEffect(() => {
  //   if (saveState == null) {
  //     setTimeout(() => {
  //       setSaveState('')
  //     }, 1000);
  //   }
  // })

  const autosave = () => {
    if (metronome.id) {
      clearTimeout(autoSaveTimer.current)
      autoSaveTimer.current = setTimeout(() => {
        updateMetronome()
      }, 3000)
    }
  }

  function changeCurrentBeat() {
    setCurrentBeat((prev) => (prev % metronome.beats) + 1)
  }

  const changeBpm = (e: ChangeEvent<HTMLInputElement>) => {
    setMetronome({ ...metronome, bpm: +e.target.value })
  }

  const editTitle = (e) => {
    setMetronome({ ...metronome, name: e.target.value })
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
      bpmDecreaseState.current = null as unknown as NodeJS.Timer
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
      bpmIncreaseState.current = null as unknown as NodeJS.Timer
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
      currentUsed: metronome.isPlaying ? metronome.currentUsed : 0,
      activeTimer: metronome.timerValue,
    })
  }

  const handleTap = (e: MouseEvent<HTMLButtonElement>) => {
    const currentClickTimeStamp = Date.now()
    if (
      tapSequence.length == 0 ||
      (currentClickTimeStamp - tapSequence.at(-1)!) / 1000 > 2
    ) {
      setTapSequence([currentClickTimeStamp])
    } else {
      setTapSequence([...tapSequence, currentClickTimeStamp])
    }
  }

  const stressFirst = (e: ChangeEvent<HTMLInputElement>) => {
    setMetronome({ ...metronome, stressFirst: !metronome.stressFirst })
  }

  const handleShowStats = (e: ChangeEvent<HTMLInputElement>) => {
    setMetronome({ ...metronome, showStats: !metronome.showStats })
  }

  const updateMetronome = async () => {
    if (user) {
      console.log(`saving`)
      const res = await fetch(`/api/metronomes/${metronome.id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'PUT',
        body: JSON.stringify(metronome),
      })
        .then((res) => {
          setSaveState('success')
          return res.json()
        })
        .catch(() => setSaveState('error'))
      setMetronome({
        ...res,
        currentUsed: metronome.currentUsed,
        sessionUsed: metronome.sessionUsed,
        isPlaying: metronome.isPlaying,
        activeTimer: metronome.activeTimer,
      })
      setTimeout(() => {
        setSaveState('')
      }, 2000)
    }
  }

  const calculateBpmFromTaps = (): void => {
    if (tapSequence.length > 1) {
      const timeWindow =
        tapSequence.at(-1)! -
        tapSequence.at(Math.min(tapSequence.length, metronome.beats) * -1)!
      const taps = Math.min(tapSequence.length, metronome.beats)
      const newBpm = Math.floor((taps / timeWindow) * 60000)
      const normalizedBpm = Math.min(Math.max(newBpm, minBpm), maxBpm)
      setMetronome({ ...metronome, bpm: normalizedBpm })
    }
  }

  const setTimer = (e: ChangeEvent<HTMLInputElement>) => {
    setMetronome({
      ...metronome,
      timerActive: !metronome.timerActive,
      activeTimer: metronome.timerValue,
    })
  }

  const increaseTimer = (e: MouseEvent<HTMLButtonElement>) => {
    if (metronome.isPlaying && metronome.timerActive) {
      setMetronome({
        ...metronome,
        activeTimer: metronome.activeTimer + timerChangeInterval,
      })
    } else {
      setMetronome({
        ...metronome,
        timerValue: metronome.timerValue + timerChangeInterval,
        activeTimer: metronome.timerValue + timerChangeInterval,
      })
    }
  }

  const decreaseTimer = (e: MouseEvent<HTMLButtonElement>) => {
    if (metronome.isPlaying && metronome.timerActive) {
      setMetronome({
        ...metronome,
        activeTimer: metronome.activeTimer - timerChangeInterval,
      })
    } else {
      setMetronome({
        ...metronome,
        timerValue: metronome.timerValue - timerChangeInterval,
        activeTimer: metronome.timerValue - timerChangeInterval,
      })
    }
  }

  const createMetronome = async () => {
    if (user) {
      const res = await fetch(`/api/metronomes`, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(metronome),
      }).then((res) => res.json())
      router.push(`/metronome/${res.id}`)
    }
  }

  const deleteMetronome = async () => {
    if (user) {
      await fetch(`/api/metronomes/${metronome.id}`, {
        method: 'DELETE',
      })
        .then(() => router.push('/'))
        .catch(async (res) => console.log(await res.json()))
    }
  }

  return (
    <section className="border-2">
      <div id="metronomeTitleArea-1" className="p-2 border-b-2 ">
        {isEditTitle ? (
          <div id="displayTitleArea-1" className="flex space-x-2 items-center">
            <input
              type="text"
              value={metronome.name}
              onChange={editTitle}
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
            <h1 className="font-extrabold">{metronome.name}</h1>
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
          <div id="metronomeBpmControls-1" className="w-full mt-4">
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
              {/* <audio ref={media}>
                <source src="click_normal.mp3" type="audio/mpeg" />
              </audio> */}
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
            <div id="beatControlArea" className="flex justify-between mt-8">
              <div id="stressCheckboxPane-1" className="flex items-center ">
                <input
                  id="stressCheckbox-1"
                  type="checkbox"
                  checked={metronome.stressFirst}
                  onChange={stressFirst}
                  className="appearance-none w-5 h-5 bg-zinc-100 text-zinc-100 border-2 border-gray-200 rounded-sm focus:outline-none focus:ring-0 cursor-pointer transition duration-200"
                />
                <label
                  htmlFor="stressCheckbox-1"
                  className="ml-2 text-sm cursor-pointer"
                >
                  <span className="text-gray-600">
                    Stress 1<sup>st</sup> beat
                  </span>
                </label>
              </div>
              {metronome.stressFirst && (
                <div id="beatCountArea-1" className="flex items-center">
                  <button
                    className="border border-grey-600 text-gray-600 bg-zinc-100 rounded w-6 h-6 leading-none inline-flex justify-center items-center"
                    disabled={metronome.beats <= minBeats}
                    onClick={decreaseBeats}
                  >
                    -
                  </button>
                  <span className="mr-1 ml-3 text-gray-600">
                    {metronome.beats}
                  </span>
                  <span className="mr-3 ml-1 text-gray-600">
                    Beat{metronome.beats > 1 && <span>s</span>}
                  </span>
                  <button
                    className="border border-grey-600 text-gray-600 bg-zinc-100 rounded w-6 h-6 leading-none inline-flex justify-center items-center"
                    disabled={metronome.beats >= maxBeats}
                    onClick={increaseBeats}
                  >
                    +
                  </button>
                </div>
              )}
            </div>
            {metronome.stressFirst && (
              <div
                id="beatVisualizationArea"
                className="flex justify-center space-x-2 mt-3"
              >
                {Array.from(Array(metronome.beats)).map((v, i) => (
                  <span
                    key={i}
                    className={`border-2 rounded-full h-4 w-4 ${
                      metronome.isPlaying && i + 1 == currentBeat
                        ? 'border-red-600'
                        : 'border-grey-600'
                    }`}
                  />
                ))}
              </div>
            )}
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
                checked={metronome.timerActive}
                onChange={setTimer}
                className="appearance-none w-5 h-5 bg-zinc-100 text-zinc-100 border-2 border-gray-200 rounded-sm focus:outline-none focus:ring-0 cursor-pointer transition duration-200"
              />
              <label
                htmlFor="timerCheckbox-1"
                className="ml-2 text-sm cursor-pointer"
              >
                <span className="text-gray-600">Use timer</span>
              </label>
            </div>
            {metronome.timerActive && (
              <div id="countdownSettingsArea-1" className="">
                <button
                  className="border border-grey-600 text-gray-600 bg-zinc-100 rounded w-6 h-6 leading-none inline-flex justify-center items-center"
                  disabled={metronome.timerValue <= timerChangeInterval}
                  onClick={decreaseTimer}
                >
                  -
                </button>
                <span className="ml-3 text-gray-600">
                  {(
                    '0' + Math.floor((metronome.activeTimer / 60000) % 60)
                  ).slice(-2)}
                  :
                </span>
                <span className="mr-3 text-gray-600">
                  {(
                    '0' + Math.floor((metronome.activeTimer / 1000) % 60)
                  ).slice(-2)}
                </span>
                <button
                  className="border border-grey-600 text-gray-600 bg-zinc-100 rounded w-6 h-6 leading-none inline-flex justify-center items-center"
                  disabled={metronome.timerValue >= timerChangeInterval * 119}
                  onClick={increaseTimer}
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>
        <div id="metronomeStatsArea-1" className="mt-3">
          <div
            id="metronomeStopwatchArea-1"
            className="flex justify-between items-center mt-3"
          >
            <div id="metronomeStopWatchControl-1">
              <input
                id="stopWatchCheckbox-1"
                type="checkbox"
                checked={metronome.showStats}
                onChange={handleShowStats}
                className="appearance-none w-5 h-5 bg-zinc-100 text-zinc-100 border-2 border-gray-200 rounded-sm focus:outline-none focus:ring-0 cursor-pointer transition duration-200"
              />
              <label
                htmlFor="stopWatchCheckbox-1"
                className="ml-2 text-sm cursor-pointer"
              >
                <span className="text-gray-600">Show usage</span>
              </label>
            </div>
            {metronome.showStats &&
              ['current', 'session', 'time'].map((type, i) => {
                const timerName = type + 'Used'
                return (
                  <div
                    id={`${type}TimeArea-1`}
                    className="flex flex-col items-center"
                    key={i}
                  >
                    <span className="text-gray-600 text-sm">
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </span>
                    <div id={`${type}TimeNumbers-1`}>
                      <span className="text-gray-600">
                        {(
                          '0' + Math.floor((metronome[timerName] / 60000) % 60)
                        ).slice(-2)}
                        :
                      </span>
                      <span className="text-gray-600">
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
        <div className="mt-3 flex justify-between items-center">
          <div id="popup">
            {saveState == 'success' && <span>Autosaved</span>}
            {saveState == 'error' && <span>Autosave failed</span>}
          </div>
          <div id="metronomeButtonArea-1">
            {!metronome.id && user && (
              <MainButton
                className="rounded-sm  border-black-600"
                onClick={createMetronome}
              >
                Save
              </MainButton>
            )}
            {metronome.id && (
              <MainButton
                className="rounded-sm  border-black-600"
                onClick={deleteMetronome}
              >
                Delete
              </MainButton>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Metronome
