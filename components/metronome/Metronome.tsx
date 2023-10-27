'use client'
import {
  ChangeEvent,
  MouseEvent,
  useEffect,
  useState,
  useRef,
  useTransition,
  FocusEvent,
  TouchEvent,
} from 'react'
import {
  IconDeviceFloppy,
  IconEdit,
  IconMinus,
  IconPlayerPause,
  IconPlayerPlay,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react'

import {
  createMetronomeAction,
  deleteMetronomeAction,
  updateServerAction,
} from '../../app/actions'

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

const maxBpm = 300
const minBpm = 20
const timerChangeInterval = 30000
const maxBeats = 12
const minBeats = 2
const scheduleAheadTime = 0.1
const lookahead = 25

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
  command,
}: {
  dbMetronome: StoredMetronome | null
  user: number | null
  command: string | undefined
}) => {
  const m = dbMetronome ? dbMetronome : defaultStoredMetronome
  const [isEditTitle, setEditTitle] = useState(false)
  const [metronome, setMetronome] = useState({
    ...m,
    ...defaultLocalMetronome,
  })
  const [tapTimes, setTapTimes] = useState<number[]>([])
  const currentBeatInBar = useRef<number>(-1)
  const [saveState, setSaveState] = useState('')
  const [tostMessage, setToastMessage] = useState('')
  const [isDoingSomething, setIsDoingSomething] = useState(false)
  const doChangeBpm = useRef(true)
  const changeBpmClickVerifier = useRef(0)
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  )
  const timeInterval = useRef<ReturnType<typeof setInterval> | undefined>(
    undefined
  )
  const audioContext = useRef<AudioContext | null>(null)
  const nextNoteTime = useRef<number>(0)
  const schedulerIntervalId = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  )
  let [pendingSave, startTransitionSave] = useTransition()
  let [pendingDelete, startTransitionDelete] = useTransition()
  let [pendingUpdate, startTransitionUpdate] = useTransition()

  useEffect(() => {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    audioContext.current = new AudioContext()

    switch (command) {
      case 'created':
        setSuccessState(`Metronome created`, 'success')
        break
      case 'deleted':
        setSuccessState(`Metronome deleted`, 'success')
        break
    }

    return () => {
      if (audioContext.current) {
        audioContext.current.close()
      }
      clearInterval(timeInterval.current)
    }
  }, [])

  // useEffect(() => {
  //   if (metronome.isPlaying) {
  //     if (schedulerIntervalId.current)
  //       clearInterval(schedulerIntervalId.current)
  //     schedulerIntervalId.current = setInterval(() => scheduler(), lookahead)
  //   }
  // }, [nextNoteTime.current])

  useEffect(() => {
    if (pendingSave) {
      setIsDoingSomething(true)
      setSuccessState('Saving', 'info')
    } else if (pendingUpdate) {
      setSuccessState('Autosaving', 'info')
    } else if (pendingDelete) {
      setIsDoingSomething(true)
      setSuccessState('Deleting', 'info')
    } else {
      if (isDoingSomething) setSuccessState('Something went wrong', 'error')
      setIsDoingSomething(false)
    }
  }, [pendingUpdate, pendingSave, pendingDelete])

  useEffect(() => {
    if (metronome.isPlaying) {
      const tmpNextNotetime = nextNoteTime.current
      pause()
      nextNoteTime.current = tmpNextNotetime
      play()
    }
  }, [metronome.bpm, metronome.beats, metronome.stressFirst])

  useEffect(() => {
    if (
      metronome.isPlaying &&
      metronome.timerActive &&
      metronome.activeTimer == 0
    ) {
      pause()
    }
  }, [metronome.activeTimer])

  useEffect(() => {
    if (metronome.isPlaying && metronome.timeUsed % 30000 == 0) {
      autosave()
    }
  }, [metronome.timeUsed])

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

  const scheduleNote = () => {
    if (!audioContext.current) return

    const time = nextNoteTime.current
    const osc = audioContext.current.createOscillator()
    const envelope = audioContext.current.createGain()
    osc.frequency.value =
      currentBeatInBar.current == 0 && metronome.stressFirst ? 1000 : 800
    envelope.gain.value = 1
    envelope.gain.exponentialRampToValueAtTime(1, time + 0.001)
    envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.02)

    osc.connect(envelope)
    envelope.connect(audioContext.current.destination)

    osc.start(time)
    osc.stop(time + 0.05)
  }

  const scheduler = () => {
    if (!audioContext.current) return
    const secondsPerBeat = 60.0 / metronome.bpm
    while (
      nextNoteTime.current <
      audioContext.current.currentTime + scheduleAheadTime
    ) {
      scheduleNote()
      nextNoteTime.current += secondsPerBeat
      currentBeatInBar.current =
        (currentBeatInBar.current + 1) % metronome.beats
    }
  }

  const play = () => {
    if (!audioContext.current) {
      return
    }
    setMetronome({
      ...metronome,
      isPlaying: true,
    })
    timeInterval.current = setInterval(() => {
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
          isPlaying:
            !prev.timerActive || prev.activeTimer >= 1000 ? true : false,
        }
      })
    }, 1000)
    currentBeatInBar.current = 0
    if (nextNoteTime.current == 0)
      nextNoteTime.current = audioContext.current.currentTime + 0.05
    schedulerIntervalId.current = setInterval(() => scheduler(), lookahead)
  }

  const pause = () => {
    setMetronome({
      ...metronome,
      isPlaying: false,
      currentUsed: 0,
      activeTimer: metronome.timerValue,
    })
    clearInterval(timeInterval.current)
    currentBeatInBar.current = 0
    nextNoteTime.current = 0
    clearInterval(schedulerIntervalId.current)
  }

  const autosave = () => {
    if (metronome.id) {
      clearTimeout(autoSaveTimer.current)
      autoSaveTimer.current = setTimeout(() => {
        updateMetronome()
      }, 3000)
    }
  }

  const changeBpm = (e: ChangeEvent<HTMLInputElement>) => {
    setMetronome({ ...metronome, bpm: +e.target.value })
  }

  const editTitle = (e: FocusEvent<HTMLInputElement>) => {
    const newVal = e.target.value.trim()
    setEditTitle(false)
    if (newVal != '') setMetronome({ ...metronome, name: newVal })
  }

  const handleChangeBpm = (
    e: MouseEvent<HTMLButtonElement> | TouchEvent<HTMLButtonElement>,
    step: number
  ) => {
    if (!doChangeBpm.current) {
      doChangeBpm.current = true
      setMetronome({ ...metronome, bpm: metronome.bpm + step })
      changeBpmClickVerifier.current++
      const verifier = changeBpmClickVerifier.current
      holdDownBpmChange(step, verifier)
    }
  }

  const holdDownBpmChange = async (changeStep: number, verifier: number) => {
    let delay = 2
    while (doChangeBpm.current) {
      await new Promise((resolve) => setTimeout(resolve, 1000 / delay))
      if (doChangeBpm.current && verifier == changeBpmClickVerifier.current) {
        setMetronome((prev) => {
          return {
            ...prev,
            bpm: Math.min(Math.max(prev.bpm + changeStep, minBpm), maxBpm),
          }
        })
        delay = delay * 1.5
      }
    }
  }

  const stopChangingBpm = () => {
    doChangeBpm.current = false
  }

  const decreaseBeats = (e: MouseEvent<HTMLButtonElement>) => {
    setMetronome({ ...metronome, beats: metronome.beats - 1 })
  }

  const increaseBeats = (e: MouseEvent<HTMLButtonElement>) => {
    setMetronome({ ...metronome, beats: metronome.beats + 1 })
  }

  const playPause = (e?: MouseEvent<HTMLButtonElement>) => {
    if (metronome.isPlaying) {
      pause()
      autosave()
    } else {
      play()
    }
  }

  const handleTap = (e: MouseEvent<HTMLButtonElement>) => {
    const now: number = Date.now()
    setTapTimes([...tapTimes, now])

    if (tapTimes.length >= 2) {
      const timeDifference: number = now - tapTimes[tapTimes.length - 2]
      if (timeDifference < 5000) {
        const newTempo: number = Math.round(60000 / timeDifference) * 2
        const normalizedTempo = Math.min(Math.max(newTempo, minBpm), maxBpm)
        setMetronome({ ...metronome, bpm: normalizedTempo })
      }
    }
  }

  const stressFirst = (e: ChangeEvent<HTMLInputElement>) => {
    setMetronome({ ...metronome, stressFirst: !metronome.stressFirst })
  }

  const handleShowStats = (e: ChangeEvent<HTMLInputElement>) => {
    setMetronome({ ...metronome, showStats: !metronome.showStats })
  }

  const updateMetronome = async () => {
    if (user && metronome.id && !isDoingSomething) {
      startTransitionUpdate(async () => {
        updateServerAction(metronome)
      })
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

  const setSuccessState = (message: string, type: string) => {
    setToastMessage(message)
    setSaveState(type)
    setTimeout(() => {
      setSaveState('')
    }, 2000)
  }

  const createMetronome = async () => {
    if (!metronome.name || metronome.name.trim() == '') {
      setSuccessState('Provide a name', 'error')
    } else {
      startTransitionSave(() => {
        createMetronomeAction(metronome)
      })
    }
  }

  const deleteMetronome = async () => {
    if (user) {
      startTransitionDelete(() => {
        deleteMetronomeAction(metronome.id!, '/metronome/new')
      })
    }
  }

  return (
    <form className="select-none shadow">
      <div id="metronomeTitleArea-1" className="p-2">
        {!isEditTitle ? (
          <div onClick={() => setEditTitle(true)} className="flex items-center">
            <h1 className="text-xl p-2 hover:cursor-text">
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
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.currentTarget.blur()
                e.stopPropagation()
              }
            }}
          />
        )}
      </div>
      <div id="metronomeBodyArea-1" className="px-2 sm:px-4">
        <div id="metronomeBpmArea-1" className="flex flex-col items-center">
          <div id="metronomeBpmDisplay-1">
            <span className="text-7xl font-bold ">{metronome.bpm}</span>
            <span>bpm</span>
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
              className="range range-neutral-content my-2"
            />
            <div className="join w-full mt-2 flex">
              <button
                type="button"
                onMouseDown={(e) => handleChangeBpm(e, -1)}
                onTouchStart={(e) => {
                  handleChangeBpm(e, -1)
                }}
                onTouchEnd={(e) => {
                  stopChangingBpm()
                }}
                onTouchCancel={(e) => {
                  stopChangingBpm()
                }}
                onMouseUp={stopChangingBpm}
                onMouseLeave={stopChangingBpm}
                className="btn grow join-item rounded-full btn-outline no-animation"
              >
                <IconMinus />
              </button>

              <button
                type="button"
                onMouseDown={(e) => handleChangeBpm(e, 1)}
                onTouchStart={(e) => {
                  handleChangeBpm(e, 1)
                }}
                onTouchEnd={(e) => {
                  stopChangingBpm()
                }}
                onTouchCancel={(e) => {
                  stopChangingBpm()
                }}
                onMouseUp={stopChangingBpm}
                onMouseLeave={stopChangingBpm}
                className="btn grow join-item rounded-full btn-outline no-animation"
              >
                <IconPlus />
              </button>
            </div>

            {/* <div className="divider m-0"></div> */}
            <div className="flex mt-4 gap-4">
              <button
                type="button"
                onClick={handleTap}
                className="btn btn-circle h-24 grow neutral btn-outline"
              >
                Tap
              </button>
              <button
                type="button"
                onClick={playPause}
                className="btn btn-circle h-24 grow btn-outline"
              >
                {metronome.isPlaying ? <IconPlayerPause /> : <IconPlayerPlay />}
                {metronome.isPlaying ? 'Pause' : 'Play'}
              </button>
            </div>
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
                    type="button"
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
                    type="button"
                    className="btn btn-xs join-item"
                    disabled={metronome.beats >= maxBeats}
                    onClick={increaseBeats}
                  >
                    <IconPlus size="8" />
                  </button>
                </div>
              )}
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
                  type="button"
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
                  type="button"
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
            className="flex justify-between items-center mt-3 gap-0"
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
                const timerName = (type + 'Used') as
                  | 'currentUsed'
                  | 'sessionUsed'
                  | 'timeUsed'
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
        <div className="mt-4 py-4 flex justify-end items-center">
          <div id="metronomeButtonArea-1">
            {!metronome.id && (
              <button
                formAction={createMetronome}
                className={`btn btn-outline ${
                  isDoingSomething || !user ? 'btn-disabled' : 'btn-active'
                }`}
              >
                {isDoingSomething ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <IconDeviceFloppy size="16" />
                )}
                Save
              </button>
            )}
            {metronome.id && (
              <button
                formAction={deleteMetronome}
                className={`btn btn-outline btn-error ${
                  isDoingSomething ? 'btn-disabled' : 'btn-active'
                }`}
              >
                {isDoingSomething ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <IconTrash size="16" />
                )}
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
      {saveState != '' && (
        <div className="toast toast-end">
          <div
            className={`alert ${
              saveState == 'success'
                ? 'alert-success'
                : saveState == 'error'
                ? 'alert-error'
                : 'alert-info'
            } `}
          >
            <span>{tostMessage}</span>
          </div>
        </div>
      )}
    </form>
  )
}

export default Metronome
