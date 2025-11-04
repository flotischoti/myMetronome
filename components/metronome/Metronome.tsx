'use client'
import { useEffect, useState, useRef, useTransition } from 'react'
import {
  IconDeviceFloppy,
  IconMinus,
  IconPlus,
  IconTrash,
  IconX,
} from '@tabler/icons-react'

import {
  createMetronomeAction,
  deleteMetronomeAction,
  updateServerAction,
} from '../../app/actions'
import { TapButton } from './ui/TapButton'
import { TitleInput } from './ui/TitleInput'
import { BpmButton } from './ui/BpmButton'
import { PlayPauseButton } from './ui/PlayPauseButton'
import { TimerArea } from './ui/TimerArea'
import { BeatArea } from './ui/BeatArea'
import { StatsArea } from './ui/StatsArea'
import { LockUnlockButton } from './ui/LockUnlockButton'
import { BpmSlider } from './ui/BpmSlider'

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
  locked: boolean
  owner?: number
  lastOpened?: Date
}

export interface LocalMetronomeSettings {
  isPlaying: boolean
  currentUsed: number
  sessionUsed: number
  activeTimer: number
}

export type MetronomeFull = StoredMetronome & LocalMetronomeSettings

const maxBpm = 300
const minBpm = 20

const defaultStoredMetronome: StoredMetronome = {
  name: '',
  bpm: 120,
  beats: 4,
  stressFirst: false,
  timeUsed: 0,
  timerActive: false,
  timerValue: 120000,
  showStats: false,
  locked: false,
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

  const [metronome, setMetronome] = useState({
    ...m,
    ...defaultLocalMetronome,
  })

  const [saveState, setSaveState] = useState('')
  const [tostMessage, setToastMessage] = useState('')
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  )
  const [deletionInProgress, setDeletionInProgress] = useState(false)
  const [updateInProgress, setUpdateInProgress] = useState(false)
  let [pendingSave, startTransitionSave] = useTransition()
  let [pendingDelete, startTransitionDelete] = useTransition()
  let [pendingUpdate, startTransitionUpdate] = useTransition()
  const pendingUpdatePrev = useRef(false)
  const pendingSavePrev = useRef(false)
  const pendingDeletePrev = useRef(false)

  useEffect(() => {
    switch (command) {
      case 'created':
        setSuccessState(`Metronome created`, 'success')
        break
      case 'deleted':
        setSuccessState(`Metronome deleted`, 'success')
        break
      case 'userdeleted':
        setSuccessState(`User deleted`, 'success')
        break
    }
  }, [])

  useEffect(() => {
    if (pendingUpdate) {
      pendingUpdatePrev.current = true
    } else if (pendingUpdatePrev.current) {
      setSuccessState('Saved', 'info')
      setUpdateInProgress(false)
      pendingUpdatePrev.current = false
    }
  }, [pendingUpdate])

  useEffect(() => {
    if (pendingSave) {
      pendingSavePrev.current = true
      setSuccessState('Saving', 'info')
    } else if (pendingSavePrev.current) {
      setSuccessState('Something went wrong', 'error')
      pendingSavePrev.current = false
    }
  }, [pendingSave])

  useEffect(() => {
    if (pendingDelete) {
      pendingDeletePrev.current = true
      setSuccessState('Deleting', 'info')
    } else if (pendingDeletePrev.current) {
      setSuccessState('Something went wrong', 'error')
      pendingDeletePrev.current = false
    }
  }, [pendingDelete])

  useEffect(() => {
    if (metronome.isPlaying && metronome.timeUsed % 30000 == 0) {
      autosave()
    }
  }, [metronome.timeUsed])

  // AutoSave
  useEffect(() => {
    if (!pendingDelete) setDeletionInProgress(false)
    autosave()
  }, [
    metronome.showStats,
    metronome.bpm,
    metronome.beats,
    metronome.stressFirst,
    metronome.timerActive,
    metronome.timerValue,
    metronome.name,
    metronome.locked,
  ])

  const autosave = () => {
    if (user && metronome.id && !pendingDelete) {
      setUpdateInProgress(true)
      clearTimeout(autoSaveTimer.current)
      autoSaveTimer.current = setTimeout(() => {
        startTransitionUpdate(async () => {
          updateServerAction(metronome)
        })
      }, 2000)
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
    <form className="select-none shadow bg-base-100">
      <TitleInput
        locked={metronome.locked}
        name={metronome.name}
        updateState={(val) => setMetronome({ ...metronome, name: val })}
      />
      <div id="metronomeBodyArea-1" className="px-3 pb-3 sm:px-4">
        <div id="metronomeBpmArea-1" className="flex flex-col items-center">
          <div id="metronomeBpmDisplay-1">
            <span className="text-7xl font-bold ">{metronome.bpm}</span>
            <span>bpm</span>
          </div>
          {new Array(metronome.beats).map((v, i) => (
            <span key={i + 1}>{i + 1}</span>
          ))}
          {!metronome.locked && (
            <div id="metronomeBpmControls-1" className="w-full mt-4">
              <BpmSlider
                minBpm={minBpm}
                maxBpm={maxBpm}
                metronome={metronome}
                setMetronome={setMetronome}
              />
              <div className="join w-full mt-2 flex">
                <BpmButton
                  maxBpm={maxBpm}
                  minBpm={minBpm}
                  step={-1}
                  Icon={IconMinus}
                  updateState={(val) =>
                    setMetronome((prev) => {
                      return {
                        ...prev,
                        bpm: Math.min(Math.max(prev.bpm + val, minBpm), maxBpm),
                      }
                    })
                  }
                />
                <BpmButton
                  maxBpm={maxBpm}
                  minBpm={minBpm}
                  step={1}
                  Icon={IconPlus}
                  updateState={(val) =>
                    setMetronome((prev) => {
                      return {
                        ...prev,
                        bpm: Math.min(Math.max(prev.bpm + val, minBpm), maxBpm),
                      }
                    })
                  }
                />
              </div>

              <div className="flex mt-4 gap-4">
                <TapButton
                  minBpm={minBpm}
                  maxBpm={maxBpm}
                  updateState={(val) =>
                    setMetronome({ ...metronome, bpm: val })
                  }
                />
                <PlayPauseButton
                  setMetronome={setMetronome}
                  metronome={metronome}
                  autosave={autosave}
                />
              </div>
            </div>
          )}
          {metronome.locked && (
            <PlayPauseButton
              setMetronome={setMetronome}
              metronome={metronome}
              autosave={autosave}
              full={true}
            />
          )}
        </div>
        <div id="metronomeSettingsArea-1">
          <BeatArea metronome={metronome} setMetronome={setMetronome} />
        </div>
        <div id="metronomeTimeArea-1">
          <TimerArea metronome={metronome} setMetronome={setMetronome} />
        </div>
        <div id="metronomeStatsArea-1" className="mt-3">
          <StatsArea metronome={metronome} setMetronome={setMetronome} />
        </div>
        <div
          id="metronomeButtonArea-1"
          className={`mt-8 flex items-end w-full justify-between`}
        >
          {!deletionInProgress && (
            <LockUnlockButton
              metronome={metronome}
              setMetronome={setMetronome}
              setSuccessState={setSuccessState}
            />
          )}
          {!metronome.id && (
            <button
              formAction={createMetronome}
              className={`btn btn-outline btn-primary ${
                pendingSave || !user ? 'btn-disabled' : 'btn-active'
              }`}
            >
              {pendingSave ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                <IconDeviceFloppy size="16" />
              )}
              Save
            </button>
          )}
          {metronome.id &&
            !metronome.locked &&
            !deletionInProgress &&
            !updateInProgress && (
              <button
                type="button"
                className="btn btn-outline btn-error btn-square btn-sm"
                onClick={(e) => setDeletionInProgress(true)}
              >
                <IconTrash size="24" />
              </button>
            )}
          {metronome.id && !deletionInProgress && updateInProgress && (
            <span className="loading loading-spinner loading-xs"></span>
          )}
          {metronome.id && deletionInProgress && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={(e) => setDeletionInProgress(false)}
            >
              <IconX />
              Cancel
            </button>
          )}
          {metronome.id && deletionInProgress && (
            <button
              formAction={deleteMetronome}
              className={`btn btn-outline btn-error btn-sm ${
                pendingDelete ? 'btn-disabled' : ''
              }`}
            >
              {pendingDelete ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                <IconTrash size="16" />
              )}
              Confirm
            </button>
          )}
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
