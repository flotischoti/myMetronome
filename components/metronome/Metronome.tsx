'use client'

import { ChangeEvent, MouseEvent, useEffect, useState, useRef } from 'react'
import styles from './metronome.module.scss'
import { useRouter } from 'next/navigation'
import {
  IconDeviceFloppy,
  IconDisc,
  IconEdit,
  IconMinus,
  IconPlayerPause,
  IconPlayerPlay,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react'

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
  name: '',
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
  const [errorMessage, setErrorMessage] = useState('')
  const [isCreating, setIsCreating] = useState(false)
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
    const newVal = e.target.value.trim()
    setEditTitle(false)
    if (newVal != '') setMetronome({ ...metronome, name: newVal })
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
        .catch(() => {
          setSaveState('error')
          setErrorMessage('Autosave failed')
        })
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

  const setError = (message: string) => {
    setErrorMessage(message)
    setSaveState('error')
    setTimeout(() => {
      setSaveState('')
    }, 2000)
  }

  const createMetronome = async () => {
    if (!metronome.name || metronome.name.trim() == '') {
      setError('Provide a name')
    } else {
      if (user) {
        setIsCreating(true)
        const res = await fetch(`/api/metronomes`, {
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: JSON.stringify(metronome),
        })
          .then((res) => res.json())
          .finally(() => setIsCreating(false))
        router.push(`/metronome/${res.id}`)
      }
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
    <section className="max-w-sm mx-auto select-none shadow">
      <div id="metronomeTitleArea-1" className="p-2">
        {!isEditTitle ? (
          <div onClick={() => setEditTitle(true)} className="flex items-center">
            <h1 className="text-xl p-2">
              {metronome.name || 'Enter metronome title'}
            </h1>
            <span>
              <IconEdit size="16" className="hover:cursor-pointer" />
            </span>
          </div>
        ) : (
          <input
            type="text"
            defaultValue={metronome.name}
            placeholder="Enter metronome title"
            onBlur={editTitle}
            autoFocus
            className="input w-full "
          />
        )}
      </div>
      <div id="metronomeBodyArea-1" className="px-4 pb-4">
        <div id="metronomeBpmArea-1" className="flex flex-col items-center">
          <div id="metronomeBpmDisplay-1">
            <span className="text-7xl font-bold ">{metronome.bpm}</span>
            <span>bpm</span>
          </div>
          {new Array(metronome.beats).map((v, i) => (
            <span key={i + 1}>{i + 1}</span>
          ))}
          <div id="metronomeBpmControls-1" className="w-full mt-4">
            <div className="join w-full mt-2 flex">
              <button
                onMouseDown={startDecreaseBpm}
                onMouseUp={stopDecreaseBpm}
                onMouseLeave={stopDecreaseBpm}
                className="btn join-item"
              >
                <IconMinus />
              </button>
              <button onClick={playPause} className="btn join-item grow">
                {metronome.isPlaying ? <IconPlayerPause /> : <IconPlayerPlay />}
                {metronome.isPlaying ? 'Pause' : 'Play'}
              </button>
              <audio ref={media}>
                <source src="click_normal.mp3" type="audio/mpeg" />
              </audio>
              <button
                onMouseDown={startIncreaseBpm}
                onMouseUp={stopIncreaseBpm}
                onMouseLeave={stopIncreaseBpm}
                className="btn join-item"
              >
                <IconPlus />
              </button>
            </div>
            <input
              type="range"
              min={minBpm}
              max={maxBpm}
              value={metronome.bpm}
              onChange={changeBpm}
              className="range range-primary my-2"
            />
            {/* <div className="divider m-0"></div> */}
            <button onClick={handleTap} className="btn btn-wide w-full h-24">
              Tap
            </button>
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
                  className="checkbox checkbox-sm"
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
                <div id="beatCountArea-1" className="join flex items-center">
                  <button
                    className="btn btn-xs join-item"
                    disabled={metronome.beats <= minBeats}
                    onClick={decreaseBeats}
                  >
                    <IconMinus size="8" />
                  </button>
                  <span className="text-base mx-1 join-item">
                    {metronome.beats} Beat
                    {metronome.beats > 1 && <span>s</span>}
                  </span>
                  <button
                    className="btn btn-xs join-item"
                    disabled={metronome.beats >= maxBeats}
                    onClick={increaseBeats}
                  >
                    <IconPlus size="8" />
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
                className="checkbox checkbox-sm"
              />
              <label
                htmlFor="timerCheckbox-1"
                className="ml-2 text-sm cursor-pointer"
              >
                <span className="text-gray-600">Use timer</span>
              </label>
            </div>
            {metronome.timerActive && (
              <div
                id="countdownSettingsArea-1"
                className="join flex items-center"
              >
                <button
                  className="btn btn-xs join-item"
                  disabled={metronome.timerValue <= timerChangeInterval}
                  onClick={decreaseTimer}
                >
                  <IconMinus size="8" />
                </button>
                <span className="countdown font-mono text-lg join-item mx-1">
                  <span
                    style={{
                      '--value': (
                        '0' + Math.floor((metronome.activeTimer / 60000) % 60)
                      ).slice(-2),
                    }}
                  ></span>
                  :
                  <span
                    style={{
                      '--value': (
                        '0' + Math.floor((metronome.activeTimer / 1000) % 60)
                      ).slice(-2),
                    }}
                  ></span>
                </span>
                <button
                  className="btn btn-xs join-item"
                  disabled={metronome.timerValue >= timerChangeInterval * 119}
                  onClick={increaseTimer}
                >
                  <IconPlus size="8" />
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
                className="checkbox checkbox-sm"
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
                    <span
                      id={`${type}TimeNumbers-1`}
                      className="countdown font-mono text-lg"
                    >
                      <span
                        style={{
                          '--value': (
                            '0' +
                            Math.floor((metronome[timerName] / 60000) % 60)
                          ).slice(-2),
                        }}
                      ></span>
                      :
                      <span
                        style={{
                          '--value': (
                            '0' + Math.floor((metronome[timerName] / 1000) % 60)
                          ).slice(-2),
                        }}
                      ></span>
                    </span>
                  </div>
                )
              })}
          </div>
        </div>
        <div className="mt-3 flex justify-end items-center">
          <div id="metronomeButtonArea-1">
            {!metronome.id && user && (
              <button className="btn btn-outline " onClick={createMetronome}>
                {isCreating ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <IconDeviceFloppy size="16" />
                )}
                Save
              </button>
            )}
            {metronome.id && (
              <button
                className="btn btn-outline btn-error"
                onClick={deleteMetronome}
              >
                <IconTrash size="16" />
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="toast toast-end">
        {saveState == 'error' && (
          <div className="alert alert-error">
            <span>{errorMessage}</span>
          </div>
        )}
        {saveState == 'success' && (
          <div className="alert alert-success">
            <span>Autosaved</span>
          </div>
        )}
      </div>
    </section>
  )
}

export default Metronome
