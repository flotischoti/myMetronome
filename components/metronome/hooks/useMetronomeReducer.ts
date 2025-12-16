import { useReducer, Reducer } from 'react'
import { METRONOME_CONSTANTS } from '@/constants/metronome'
import type { MetronomeFull } from '@/components/metronome/Metronome'

// ========================================
// ACTION TYPES
// ========================================
export type MetronomeAction =
  // Simple property updates
  | { type: 'SET_BPM'; payload: number }
  | { type: 'CHANGE_BPM'; payload: number }
  | { type: 'SET_NAME'; payload: string }
  | { type: 'SET_BEATS'; payload: number }
  | { type: 'SET_LOCKED'; payload: boolean }
  | { type: 'SET_STRESS_FIRST'; payload: boolean }
  | { type: 'SET_SHOW_STATS'; payload: boolean }
  | { type: 'SET_TIMER_ACTIVE'; payload: boolean }
  | { type: 'SET_TIMER_VALUE'; payload: number }
  | { type: 'SET_ACTIVE_TIMER'; payload: number }

  // Complex state transitions
  | { type: 'RESET_TIMER' }
  | { type: 'START_PLAYING' }
  | { type: 'RESTART_AUDIO' } // Restart playback without resetting timer
  | { type: 'STOP_PLAYING' }
  | { type: 'TOGGLE_LOCKED' }
  | { type: 'INCREMENT_TIME' } // Called every second
  | { type: 'INCREASE_TIMER'; payload: number }
  | { type: 'DECREASE_TIMER'; payload: number }

// ========================================
// HELPER FUNCTIONS
// ========================================
const clampBpm = (bpm: number): number => {
  return Math.min(
    Math.max(bpm, METRONOME_CONSTANTS.BPM.MIN),
    METRONOME_CONSTANTS.BPM.MAX,
  )
}

// ========================================
// REDUCER
// ========================================
const metronomeReducer: Reducer<MetronomeFull, MetronomeAction> = (
  state,
  action,
) => {
  switch (action.type) {
    // ----------------------------------------
    // Simple Updates
    // ----------------------------------------
    case 'SET_BPM':
      return { ...state, bpm: clampBpm(action.payload) }

    case 'CHANGE_BPM':
      return { ...state, bpm: clampBpm(state.bpm + action.payload) }

    case 'SET_NAME':
      return { ...state, name: action.payload }

    case 'SET_BEATS':
      return { ...state, beats: action.payload }

    case 'SET_LOCKED':
      return { ...state, locked: action.payload }

    case 'SET_STRESS_FIRST':
      return { ...state, stressFirst: action.payload }

    case 'SET_SHOW_STATS':
      return { ...state, showStats: action.payload }

    case 'SET_TIMER_ACTIVE':
      return {
        ...state,
        timerActive: action.payload,
        activeTimer: action.payload ? state.timerValue : 0,
      }

    case 'SET_TIMER_VALUE':
      return { ...state, timerValue: action.payload }

    case 'SET_ACTIVE_TIMER':
      return { ...state, activeTimer: action.payload }

    case 'TOGGLE_LOCKED':
      return { ...state, locked: !state.locked }

    case 'RESET_TIMER':
      return { ...state, activeTimer: state.timerValue }
    // ----------------------------------------
    // Complex Updates
    // ----------------------------------------

    case 'START_PLAYING':
      return {
        ...state,
        isPlaying: true,
        currentUsed: 0,
      }

    case 'RESTART_AUDIO':
      return {
        ...state,
        isPlaying: true,
        currentUsed: 0,
      }

    case 'STOP_PLAYING':
      return {
        ...state,
        isPlaying: false,
      }

    case 'INCREMENT_TIME':
      // Called every second when playing
      return {
        ...state,
        timeUsed: state.timeUsed + 1000,
        currentUsed: state.currentUsed + 1000,
        sessionUsed: state.sessionUsed + 1000,
        activeTimer: !state.timerActive
          ? state.timerValue
          : state.activeTimer > 1000
            ? state.activeTimer - 1000
            : 0,
        // Auto-stop when timer reaches 0
        isPlaying: !state.timerActive || state.activeTimer >= 1000,
      }

    case 'INCREASE_TIMER': {
      const interval = action.payload
      if (state.isPlaying) {
        return {
          ...state,
          activeTimer: Math.min(3570000, state.activeTimer + interval),
        }
      } else {
        return {
          ...state,
          timerValue: Math.min(3570000, state.timerValue + interval),
          activeTimer: Math.min(3570000, state.timerValue + interval),
        }
      }
    }

    case 'DECREASE_TIMER': {
      const interval = action.payload
      if (state.isPlaying) {
        return {
          ...state,
          activeTimer: Math.max(0, state.activeTimer - interval),
        }
      } else {
        return {
          ...state,
          timerValue: Math.max(0, state.timerValue - interval),
          activeTimer: Math.max(0, state.timerValue - interval),
        }
      }
    }

    default:
      return state
  }
}

// ========================================
// CUSTOM HOOK
// ========================================
export const useMetronomeReducer = (initialState: MetronomeFull) => {
  return useReducer(metronomeReducer, initialState)
}
