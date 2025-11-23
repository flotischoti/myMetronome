'use client'
import { useState, useEffect, useRef } from 'react'
import {
  IconDeviceFloppy,
  IconMinus,
  IconPlus,
  IconTrash,
  IconX,
} from '@tabler/icons-react'

import { METRONOME_CONSTANTS } from '@/constants/metronome'
import { useMetronomeState } from './hooks/useMetronomeState'
import { useMetronomeActions } from './hooks/useMetronomeActions'
import { useAutoSave } from './hooks/useAutoSave'
import { useToast, ToastType } from './hooks/useToasts'
import { useCommandHandler } from './hooks/useCommandHandlers'

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

interface MetronomeProps {
  dbMetronome: StoredMetronome | null
  user: number | null
  command: string | undefined
}

const Metronome = ({ dbMetronome, user, command }: MetronomeProps) => {
  // ========================================
  // STATE MANAGEMENT (useReducer)
  // ========================================
  const { metronome, dispatch } = useMetronomeState(dbMetronome)

  // ========================================
  // TOAST NOTIFICATIONS
  // ========================================
  const toast = useToast(METRONOME_CONSTANTS.TOAST.DURATION)

  // ========================================
  // SERVER ACTIONS
  // ========================================
  const {
    createMetronome,
    updateMetronome,
    deleteMetronome,
    isCreating,
    isUpdating,
    isDeleting,
  } = useMetronomeActions(metronome, user, {
    onSaveSuccess: () => toast.show('Metronome created', 'success'),
    onSaveError: (err) => toast.show(err, 'error'),
    onUpdateSuccess: () => toast.show('Saved', 'info'),
    onUpdateError: (err) => toast.show(err, 'error'),
    onDeleteSuccess: () => toast.show('Metronome deleted', 'success'),
    onDeleteError: (err) => toast.show(err, 'error'),
  })

  // ========================================
  // AUTO-SAVE
  // ========================================
  const {
    trigger: triggerAutoSave,
    isSaving,
    resetSaving,
  } = useAutoSave(metronome, updateMetronome, {
    enabled: !!user && !!metronome.id && !isDeleting,
    delay: METRONOME_CONSTANTS.AUTOSAVE.DELAY,
  })

  const prevIsUpdating = useRef(isUpdating)

  useEffect(() => {
    if (prevIsUpdating.current === true && isUpdating === false) {
      resetSaving()
    }
    prevIsUpdating.current = isUpdating
  }, [isUpdating, resetSaving])

  // ========================================
  // COMMAND HANDLER
  // ========================================
  useCommandHandler(command, toast.show)

  // ========================================
  // LOCAL UI STATE
  // ========================================
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const showSavingIndicator = isSaving || isUpdating

  // ========================================
  // RENDER
  // ========================================
  return (
    <form className="select-none shadow bg-base-100">
      <TitleInput
        locked={metronome.locked}
        name={metronome.name}
        updateState={(val) => dispatch({ type: 'SET_NAME', payload: val })}
      />

      <div id="metronomeBodyArea-1" className="px-3 pb-3 sm:px-4">
        {/* BPM Display */}
        <div id="metronomeBpmArea-1" className="flex flex-col items-center">
          <div id="metronomeBpmDisplay-1">
            <span className="text-7xl font-bold">{metronome.bpm}</span>
            <span>bpm</span>
          </div>

          {/* BPM Controls (unlocked) */}
          {!metronome.locked && (
            <div id="metronomeBpmControls-1" className="w-full mt-4">
              <BpmSlider
                minBpm={METRONOME_CONSTANTS.BPM.MIN}
                maxBpm={METRONOME_CONSTANTS.BPM.MAX}
                metronome={metronome}
                dispatch={dispatch}
              />

              <div className="join w-full mt-2 flex">
                <BpmButton step={-1} Icon={IconMinus} dispatch={dispatch} />
                <BpmButton step={1} Icon={IconPlus} dispatch={dispatch} />
              </div>

              <div className="flex mt-4 gap-4">
                <TapButton
                  minBpm={METRONOME_CONSTANTS.BPM.MIN}
                  maxBpm={METRONOME_CONSTANTS.BPM.MAX}
                  dispatch={dispatch}
                />
                <PlayPauseButton
                  dispatch={dispatch}
                  metronome={metronome}
                  autosave={triggerAutoSave}
                />
              </div>
            </div>
          )}

          {/* Play Button (locked) */}
          {metronome.locked && (
            <PlayPauseButton
              dispatch={dispatch}
              metronome={metronome}
              autosave={triggerAutoSave}
              full={true}
            />
          )}
        </div>

        {/* Settings Area */}
        <div id="metronomeSettingsArea-1">
          <BeatArea metronome={metronome} dispatch={dispatch} />
        </div>

        {/* Timer Area */}
        <div id="metronomeTimeArea-1">
          <TimerArea metronome={metronome} dispatch={dispatch} />
        </div>

        {/* Stats Area */}
        <div id="metronomeStatsArea-1" className="mt-3">
          <StatsArea metronome={metronome} dispatch={dispatch} />
        </div>

        {/* Action Buttons */}
        <div
          id="metronomeButtonArea-1"
          className="mt-8 flex items-end w-full justify-between"
        >
          {/* Lock/Unlock Button - IMMER sichtbar */}
          <LockUnlockButton
            metronome={metronome}
            dispatch={dispatch}
            setSuccessState={(msg: string, type: ToastType) => {
              if (type !== '') toast.show(msg, type)
            }}
          />

          {/* Rechte Seite: Save/Delete/Spinner */}
          <div className="flex items-center gap-2">
            {/* Save Button (new metronome) */}
            {!metronome.id && (
              <button
                type="button"
                onClick={createMetronome}
                className={`btn btn-outline btn-primary ${
                  isCreating || !user ? 'btn-disabled' : 'btn-active'
                }`}
              >
                {isCreating ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <IconDeviceFloppy size="16" />
                )}
                Save
              </button>
            )}

            {/* Delete Confirmation Buttons */}
            {metronome.id && showDeleteConfirm && (
              <>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  <IconX />
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={deleteMetronome}
                  className={`btn btn-outline btn-error btn-sm ${
                    isDeleting ? 'btn-disabled' : ''
                  }`}
                >
                  {isDeleting ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    <IconTrash size="16" />
                  )}
                  Confirm
                </button>
              </>
            )}

            {/* Saving Spinner ODER Delete Button */}
            {metronome.id && !metronome.locked && !showDeleteConfirm && (
              <>
                {showSavingIndicator ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <button
                    type="button"
                    className="btn btn-outline btn-error btn-square btn-sm"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <IconTrash size="24" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast.isVisible && (
        <div className="toast toast-end">
          <div
            className={`alert ${
              toast.type === 'success'
                ? 'alert-success'
                : toast.type === 'error'
                  ? 'alert-error'
                  : 'alert-info'
            }`}
          >
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </form>
  )
}

export default Metronome
