/**
 * @jest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react'
import { useMetronomeReducer } from '@/components/metronome/hooks/useMetronomeReducer'
import { METRONOME_CONSTANTS } from '@/constants/metronome'
import type { MetronomeFull } from '@/components/metronome/Metronome'

// ========================================
// HELPER: Initial State für Tests
// ========================================
const createInitialState = (
  overrides?: Partial<MetronomeFull>,
): MetronomeFull => ({
  name: 'Test Metronome',
  bpm: 120,
  beats: 4,
  stressFirst: false,
  timeUsed: 0,
  timerActive: false,
  timerValue: 120000,
  showStats: false,
  locked: false,
  isPlaying: false,
  currentUsed: 0,
  sessionUsed: 0,
  activeTimer: 0,
  ...overrides,
})

// ========================================
// TESTS
// ========================================
describe('metronomeReducer', () => {
  // ----------------------------------------
  // BPM Tests
  // ----------------------------------------
  describe('SET_BPM', () => {
    it('should set BPM to valid value', () => {
      const { result } = renderHook(() =>
        useMetronomeReducer(createInitialState()),
      )

      act(() => {
        result.current[1]({ type: 'SET_BPM', payload: 140 })
      })

      expect(result.current[0].bpm).toBe(140)
    })

    it('should clamp BPM to minimum (20)', () => {
      const { result } = renderHook(() =>
        useMetronomeReducer(createInitialState()),
      )

      act(() => {
        result.current[1]({ type: 'SET_BPM', payload: 10 })
      })

      expect(result.current[0].bpm).toBe(METRONOME_CONSTANTS.BPM.MIN)
    })

    it('should clamp BPM to maximum (300)', () => {
      const { result } = renderHook(() =>
        useMetronomeReducer(createInitialState()),
      )

      act(() => {
        result.current[1]({ type: 'SET_BPM', payload: 500 })
      })

      expect(result.current[0].bpm).toBe(METRONOME_CONSTANTS.BPM.MAX)
    })
  })

  describe('CHANGE_BPM', () => {
    it('should increment BPM by payload', () => {
      const { result } = renderHook(() =>
        useMetronomeReducer(createInitialState({ bpm: 120 })),
      )

      act(() => {
        result.current[1]({ type: 'CHANGE_BPM', payload: 5 })
      })

      expect(result.current[0].bpm).toBe(125)
    })

    it('should decrement BPM by negative payload', () => {
      const { result } = renderHook(() =>
        useMetronomeReducer(createInitialState({ bpm: 120 })),
      )

      act(() => {
        result.current[1]({ type: 'CHANGE_BPM', payload: -10 })
      })

      expect(result.current[0].bpm).toBe(110)
    })

    it('should clamp when incrementing beyond max', () => {
      const { result } = renderHook(() =>
        useMetronomeReducer(createInitialState({ bpm: 295 })),
      )

      act(() => {
        result.current[1]({ type: 'CHANGE_BPM', payload: 10 })
      })

      expect(result.current[0].bpm).toBe(METRONOME_CONSTANTS.BPM.MAX)
    })

    it('should clamp when decrementing below min', () => {
      const { result } = renderHook(() =>
        useMetronomeReducer(createInitialState({ bpm: 25 })),
      )

      act(() => {
        result.current[1]({ type: 'CHANGE_BPM', payload: -10 })
      })

      expect(result.current[0].bpm).toBe(METRONOME_CONSTANTS.BPM.MIN)
    })
  })

  // ----------------------------------------
  // Simple Property Updates
  // ----------------------------------------
  describe('SET_NAME', () => {
    it('should update metronome name', () => {
      const { result } = renderHook(() =>
        useMetronomeReducer(createInitialState()),
      )

      act(() => {
        result.current[1]({ type: 'SET_NAME', payload: 'My Practice Session' })
      })

      expect(result.current[0].name).toBe('My Practice Session')
    })
  })

  describe('SET_BEATS', () => {
    it('should update beats', () => {
      const { result } = renderHook(() =>
        useMetronomeReducer(createInitialState()),
      )

      act(() => {
        result.current[1]({ type: 'SET_BEATS', payload: 6 })
      })

      expect(result.current[0].beats).toBe(6)
    })
  })

  describe('SET_LOCKED', () => {
    it('should lock metronome', () => {
      const { result } = renderHook(() =>
        useMetronomeReducer(createInitialState({ locked: false })),
      )

      act(() => {
        result.current[1]({ type: 'SET_LOCKED', payload: true })
      })

      expect(result.current[0].locked).toBe(true)
    })

    it('should unlock metronome', () => {
      const { result } = renderHook(() =>
        useMetronomeReducer(createInitialState({ locked: true })),
      )

      act(() => {
        result.current[1]({ type: 'SET_LOCKED', payload: false })
      })

      expect(result.current[0].locked).toBe(false)
    })
  })

  describe('TOGGLE_LOCKED', () => {
    it('should toggle locked state from false to true', () => {
      const { result } = renderHook(() =>
        useMetronomeReducer(createInitialState({ locked: false })),
      )

      act(() => {
        result.current[1]({ type: 'TOGGLE_LOCKED' })
      })

      expect(result.current[0].locked).toBe(true)
    })

    it('should toggle locked state from true to false', () => {
      const { result } = renderHook(() =>
        useMetronomeReducer(createInitialState({ locked: true })),
      )

      act(() => {
        result.current[1]({ type: 'TOGGLE_LOCKED' })
      })

      expect(result.current[0].locked).toBe(false)
    })
  })

  describe('SET_STRESS_FIRST', () => {
    it('should enable stress first beat', () => {
      const { result } = renderHook(() =>
        useMetronomeReducer(createInitialState()),
      )

      act(() => {
        result.current[1]({ type: 'SET_STRESS_FIRST', payload: true })
      })

      expect(result.current[0].stressFirst).toBe(true)
    })
  })

  describe('SET_SHOW_STATS', () => {
    it('should show stats', () => {
      const { result } = renderHook(() =>
        useMetronomeReducer(createInitialState()),
      )

      act(() => {
        result.current[1]({ type: 'SET_SHOW_STATS', payload: true })
      })

      expect(result.current[0].showStats).toBe(true)
    })
  })

  // ----------------------------------------
  // Timer Tests
  // ----------------------------------------
  describe('SET_TIMER_ACTIVE', () => {
    it('should activate timer and set activeTimer to timerValue', () => {
      const { result } = renderHook(() =>
        useMetronomeReducer(createInitialState({ timerValue: 120000 })),
      )

      act(() => {
        result.current[1]({ type: 'SET_TIMER_ACTIVE', payload: true })
      })

      expect(result.current[0].timerActive).toBe(true)
      expect(result.current[0].activeTimer).toBe(120000)
    })

    it('should deactivate timer and reset activeTimer to 0', () => {
      const { result } = renderHook(() =>
        useMetronomeReducer(
          createInitialState({ timerActive: true, activeTimer: 60000 }),
        ),
      )

      act(() => {
        result.current[1]({ type: 'SET_TIMER_ACTIVE', payload: false })
      })

      expect(result.current[0].timerActive).toBe(false)
      expect(result.current[0].activeTimer).toBe(0)
    })
  })

  describe('INCREASE_TIMER', () => {
    it('should increase timer when not playing', () => {
      const { result } = renderHook(() =>
        useMetronomeReducer(
          createInitialState({ timerValue: 120000, isPlaying: false }),
        ),
      )

      act(() => {
        result.current[1]({ type: 'INCREASE_TIMER', payload: 30000 })
      })

      expect(result.current[0].timerValue).toBe(150000)
      expect(result.current[0].activeTimer).toBe(150000)
    })

    it('should increase activeTimer when playing', () => {
      const { result } = renderHook(() =>
        useMetronomeReducer(
          createInitialState({
            timerValue: 120000,
            activeTimer: 90000,
            isPlaying: true,
          }),
        ),
      )

      act(() => {
        result.current[1]({ type: 'INCREASE_TIMER', payload: 30000 })
      })

      expect(result.current[0].activeTimer).toBe(120000)
      expect(result.current[0].timerValue).toBe(120000)
    })

    it('should not exceed maximum (3570000ms)', () => {
      // ✨ KORRIGIERT!
      const { result } = renderHook(() =>
        useMetronomeReducer(
          createInitialState({ timerValue: 3570000 - 30000 }),
        ),
      )

      act(() => {
        result.current[1]({ type: 'INCREASE_TIMER', payload: 30000 })
      })

      expect(result.current[0].timerValue).toBe(3570000)
    })
  })

  describe('DECREASE_TIMER', () => {
    it('should decrease timer when not playing', () => {
      const { result } = renderHook(() =>
        useMetronomeReducer(
          createInitialState({ timerValue: 120000, isPlaying: false }),
        ),
      )

      act(() => {
        result.current[1]({ type: 'DECREASE_TIMER', payload: 30000 })
      })

      expect(result.current[0].timerValue).toBe(90000)
      expect(result.current[0].activeTimer).toBe(90000)
    })

    it('should decrease activeTimer when playing', () => {
      const { result } = renderHook(() =>
        useMetronomeReducer(
          createInitialState({
            timerValue: 120000,
            activeTimer: 90000,
            isPlaying: true,
          }),
        ),
      )

      act(() => {
        result.current[1]({ type: 'DECREASE_TIMER', payload: 30000 })
      })

      expect(result.current[0].activeTimer).toBe(60000)
      expect(result.current[0].timerValue).toBe(120000) // Unchanged
    })

    it('should not go below 0', () => {
      const { result } = renderHook(() =>
        useMetronomeReducer(createInitialState({ timerValue: 15000 })),
      )

      act(() => {
        result.current[1]({ type: 'DECREASE_TIMER', payload: 30000 })
      })

      expect(result.current[0].timerValue).toBe(0)
      expect(result.current[0].activeTimer).toBe(0)
    })
  })

  // ----------------------------------------
  // Play/Pause Tests
  // ----------------------------------------
  describe('START_PLAYING', () => {
    it('should start playing and reset session stats', () => {
      const { result } = renderHook(() =>
        useMetronomeReducer(
          createInitialState({
            currentUsed: 5000,
            sessionUsed: 10000,
          }),
        ),
      )

      act(() => {
        result.current[1]({ type: 'START_PLAYING' })
      })

      expect(result.current[0].isPlaying).toBe(true)
      expect(result.current[0].currentUsed).toBe(0)
    })

    it('should set activeTimer when timer is active', () => {
      const { result } = renderHook(() =>
        useMetronomeReducer(
          createInitialState({
            timerActive: true,
            timerValue: 120000,
          }),
        ),
      )

      act(() => {
        result.current[1]({ type: 'START_PLAYING' })
      })

      expect(result.current[0].activeTimer).toBe(120000)
    })

    it('should not set activeTimer when timer is inactive', () => {
      const { result } = renderHook(() =>
        useMetronomeReducer(
          createInitialState({
            timerActive: false,
            timerValue: 120000,
          }),
        ),
      )

      act(() => {
        result.current[1]({ type: 'START_PLAYING' })
      })

      expect(result.current[0].activeTimer).toBe(0)
    })
  })

  describe('STOP_PLAYING', () => {
    it('should stop playing', () => {
      const { result } = renderHook(() =>
        useMetronomeReducer(createInitialState({ isPlaying: true })),
      )

      act(() => {
        result.current[1]({ type: 'STOP_PLAYING' })
      })

      expect(result.current[0].isPlaying).toBe(false)
    })
  })

  describe('INCREMENT_TIME', () => {
    it('should increment all time counters by 1000ms', () => {
      const { result } = renderHook(() =>
        useMetronomeReducer(
          createInitialState({
            timeUsed: 5000,
            currentUsed: 3000,
            sessionUsed: 8000,
            isPlaying: true,
          }),
        ),
      )

      act(() => {
        result.current[1]({ type: 'INCREMENT_TIME' })
      })

      expect(result.current[0].timeUsed).toBe(6000)
      expect(result.current[0].currentUsed).toBe(4000)
      expect(result.current[0].sessionUsed).toBe(9000)
    })

    it('should decrement activeTimer when timer is active', () => {
      const { result } = renderHook(() =>
        useMetronomeReducer(
          createInitialState({
            timerActive: true,
            activeTimer: 5000,
            timerValue: 120000,
            isPlaying: true,
          }),
        ),
      )

      act(() => {
        result.current[1]({ type: 'INCREMENT_TIME' })
      })

      expect(result.current[0].activeTimer).toBe(4000)
    })

    it('should stop playing when timer reaches 0', () => {
      const { result } = renderHook(() =>
        useMetronomeReducer(
          createInitialState({
            timerActive: true,
            activeTimer: 500, // Less than 1000
            isPlaying: true,
          }),
        ),
      )

      act(() => {
        result.current[1]({ type: 'INCREMENT_TIME' })
      })

      expect(result.current[0].activeTimer).toBe(0)
      expect(result.current[0].isPlaying).toBe(false)
    })

    it('should keep playing when no timer is active', () => {
      const { result } = renderHook(() =>
        useMetronomeReducer(
          createInitialState({
            timerActive: false,
            isPlaying: true,
          }),
        ),
      )

      act(() => {
        result.current[1]({ type: 'INCREMENT_TIME' })
      })

      expect(result.current[0].isPlaying).toBe(true)
    })
  })

  // ----------------------------------------
  // Complex Scenarios
  // ----------------------------------------
  describe('Complex Scenarios', () => {
    it('should handle full play session with timer', () => {
      const { result } = renderHook(() =>
        useMetronomeReducer(
          createInitialState({
            timerActive: true,
            timerValue: 3000, // 3 seconds
          }),
        ),
      )

      // Start playing
      act(() => {
        result.current[1]({ type: 'START_PLAYING' })
      })
      expect(result.current[0].isPlaying).toBe(true)
      expect(result.current[0].activeTimer).toBe(3000)

      // After 1 second
      act(() => {
        result.current[1]({ type: 'INCREMENT_TIME' })
      })
      expect(result.current[0].activeTimer).toBe(2000)
      expect(result.current[0].isPlaying).toBe(true)

      // After 2 seconds
      act(() => {
        result.current[1]({ type: 'INCREMENT_TIME' })
      })
      expect(result.current[0].activeTimer).toBe(1000)
      expect(result.current[0].isPlaying).toBe(true)

      // After 3 seconds - should stop
      act(() => {
        result.current[1]({ type: 'INCREMENT_TIME' })
      })
      expect(result.current[0].activeTimer).toBe(0)
      expect(result.current[0].isPlaying).toBe(true)

      //
      act(() => {
        result.current[1]({ type: 'INCREMENT_TIME' })
      })
      expect(result.current[0].isPlaying).toBe(false)
    })

    it('should maintain state integrity during BPM changes while playing', () => {
      const { result } = renderHook(() =>
        useMetronomeReducer(createInitialState({ bpm: 120, isPlaying: true })),
      )

      act(() => {
        result.current[1]({ type: 'CHANGE_BPM', payload: 10 })
      })

      expect(result.current[0].bpm).toBe(130)
      expect(result.current[0].isPlaying).toBe(true) // Should still be playing
    })

    it('should handle lock/unlock without affecting other state', () => {
      const { result } = renderHook(() =>
        useMetronomeReducer(
          createInitialState({
            bpm: 140,
            beats: 6,
            locked: false,
          }),
        ),
      )

      act(() => {
        result.current[1]({ type: 'TOGGLE_LOCKED' })
      })

      expect(result.current[0].locked).toBe(true)
      expect(result.current[0].bpm).toBe(140) // Unchanged
      expect(result.current[0].beats).toBe(6) // Unchanged
    })
  })

  // ----------------------------------------
  // Edge Cases
  // ----------------------------------------
  describe('Edge Cases', () => {
    it('should handle rapid BPM changes', () => {
      const { result } = renderHook(() =>
        useMetronomeReducer(createInitialState({ bpm: 120 })),
      )

      act(() => {
        result.current[1]({ type: 'CHANGE_BPM', payload: 50 })
        result.current[1]({ type: 'CHANGE_BPM', payload: 50 })
        result.current[1]({ type: 'CHANGE_BPM', payload: 50 })
      })

      expect(result.current[0].bpm).toBe(270)
    })
  })
})
