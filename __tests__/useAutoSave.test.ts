// __tests__/hooks/useAutoSave.test.ts
import { renderHook, act, waitFor } from '@testing-library/react'
import { useAutoSave } from '@/components/metronome/hooks/useAutoSave'
import type { MetronomeFull } from '@/components/metronome/Metronome'
import { METRONOME_CONSTANTS } from '@/constants/metronome'

// Mock timers
jest.useFakeTimers()

const createMockMetronome = (
  overrides: Partial<MetronomeFull> = {},
): MetronomeFull => ({
  id: 1,
  name: 'Test Metronome',
  bpm: 120,
  beats: 4,
  stressFirst: true,
  timeUsed: 0,
  timerActive: false,
  timerValue: 0,
  showStats: false,
  locked: false,
  isPlaying: false,
  currentUsed: 0,
  sessionUsed: 0,
  activeTimer: 0,
  ...overrides,
})

describe('useAutoSave', () => {
  let mockOnSave: jest.Mock
  const INTERVAL = METRONOME_CONSTANTS.AUTOSAVE.INTERVAL
  const DELAY = METRONOME_CONSTANTS.AUTOSAVE.DELAY

  beforeEach(() => {
    mockOnSave = jest.fn()
    jest.clearAllTimers()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic functionality', () => {
    it('should initialize with isSaving true (initial render triggers save)', () => {
      const metronome = createMockMetronome()
      const { result } = renderHook(() =>
        useAutoSave(metronome, mockOnSave, { enabled: true }),
      )

      expect(result.current.isSaving).toBe(true)
    })

    it('should return isSaving and resetSaving', () => {
      const metronome = createMockMetronome()
      const { result } = renderHook(() =>
        useAutoSave(metronome, mockOnSave, { enabled: true }),
      )

      expect(result.current).toHaveProperty('isSaving')
      expect(result.current).toHaveProperty('resetSaving')
      expect(typeof result.current.resetSaving).toBe('function')
    })
  })

  describe('Auto-save on property changes', () => {
    it('should trigger save after delay when bpm changes', async () => {
      const { result, rerender } = renderHook(
        ({ metronome }) => useAutoSave(metronome, mockOnSave, { delay: DELAY }),
        {
          initialProps: { metronome: createMockMetronome({ bpm: 120 }) },
        },
      )

      // Clear initial render call
      mockOnSave.mockClear()
      act(() => {
        jest.advanceTimersByTime(DELAY)
      })
      mockOnSave.mockClear()

      // Change BPM
      rerender({ metronome: createMockMetronome({ bpm: 140 }) })

      expect(result.current.isSaving).toBe(true)
      expect(mockOnSave).not.toHaveBeenCalled()

      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(DELAY)
      })

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledTimes(1)
      })
    })

    it('should trigger save when name changes', async () => {
      const { rerender } = renderHook(
        ({ metronome }) => useAutoSave(metronome, mockOnSave, { delay: DELAY }),
        {
          initialProps: { metronome: createMockMetronome({ name: 'Test 1' }) },
        },
      )

      // Clear initial render
      mockOnSave.mockClear()
      act(() => {
        jest.advanceTimersByTime(DELAY)
      })
      mockOnSave.mockClear()

      rerender({ metronome: createMockMetronome({ name: 'Test 2' }) })

      act(() => {
        jest.advanceTimersByTime(DELAY)
      })

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledTimes(1)
      })
    })

    it('should trigger save when beats changes', async () => {
      const { rerender } = renderHook(
        ({ metronome }) => useAutoSave(metronome, mockOnSave, { delay: DELAY }),
        {
          initialProps: { metronome: createMockMetronome({ beats: 4 }) },
        },
      )

      // Clear initial render
      mockOnSave.mockClear()
      act(() => {
        jest.advanceTimersByTime(DELAY)
      })
      mockOnSave.mockClear()

      rerender({ metronome: createMockMetronome({ beats: 3 }) })

      act(() => {
        jest.advanceTimersByTime(DELAY)
      })

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledTimes(1)
      })
    })

    it('should trigger save when stressFirst changes', async () => {
      const { rerender } = renderHook(
        ({ metronome }) => useAutoSave(metronome, mockOnSave, { delay: DELAY }),
        {
          initialProps: {
            metronome: createMockMetronome({ stressFirst: true }),
          },
        },
      )

      // Clear initial render
      mockOnSave.mockClear()
      act(() => {
        jest.advanceTimersByTime(DELAY)
      })
      mockOnSave.mockClear()

      rerender({ metronome: createMockMetronome({ stressFirst: false }) })

      act(() => {
        jest.advanceTimersByTime(DELAY)
      })

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledTimes(1)
      })
    })

    it('should trigger save when locked changes', async () => {
      const { rerender } = renderHook(
        ({ metronome }) => useAutoSave(metronome, mockOnSave, { delay: DELAY }),
        {
          initialProps: { metronome: createMockMetronome({ locked: false }) },
        },
      )

      // Clear initial render
      mockOnSave.mockClear()
      act(() => {
        jest.advanceTimersByTime(DELAY)
      })
      mockOnSave.mockClear()

      rerender({ metronome: createMockMetronome({ locked: true }) })

      act(() => {
        jest.advanceTimersByTime(DELAY)
      })

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledTimes(1)
      })
    })

    it('should trigger save when showStats changes', async () => {
      const { rerender } = renderHook(
        ({ metronome }) => useAutoSave(metronome, mockOnSave, { delay: DELAY }),
        {
          initialProps: {
            metronome: createMockMetronome({ showStats: false }),
          },
        },
      )

      // Clear initial render
      mockOnSave.mockClear()
      act(() => {
        jest.advanceTimersByTime(DELAY)
      })
      mockOnSave.mockClear()

      rerender({ metronome: createMockMetronome({ showStats: true }) })

      act(() => {
        jest.advanceTimersByTime(DELAY)
      })

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledTimes(1)
      })
    })

    it('should trigger save when timerActive changes', async () => {
      const { rerender } = renderHook(
        ({ metronome }) => useAutoSave(metronome, mockOnSave, { delay: DELAY }),
        {
          initialProps: {
            metronome: createMockMetronome({ timerActive: false }),
          },
        },
      )

      // Clear initial render
      mockOnSave.mockClear()
      act(() => {
        jest.advanceTimersByTime(DELAY)
      })
      mockOnSave.mockClear()

      rerender({ metronome: createMockMetronome({ timerActive: true }) })

      act(() => {
        jest.advanceTimersByTime(DELAY)
      })

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledTimes(1)
      })
    })

    it('should trigger save when timerValue changes', async () => {
      const { rerender } = renderHook(
        ({ metronome }) => useAutoSave(metronome, mockOnSave, { delay: DELAY }),
        {
          initialProps: { metronome: createMockMetronome({ timerValue: 0 }) },
        },
      )

      // Clear initial render
      mockOnSave.mockClear()
      act(() => {
        jest.advanceTimersByTime(DELAY)
      })
      mockOnSave.mockClear()

      rerender({ metronome: createMockMetronome({ timerValue: 300 }) })

      act(() => {
        jest.advanceTimersByTime(DELAY)
      })

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('Debouncing behavior', () => {
    it('should debounce multiple rapid changes', async () => {
      const { rerender } = renderHook(
        ({ metronome }) => useAutoSave(metronome, mockOnSave, { delay: DELAY }),
        {
          initialProps: { metronome: createMockMetronome({ bpm: 120 }) },
        },
      )

      // Clear initial render
      mockOnSave.mockClear()
      act(() => {
        jest.advanceTimersByTime(DELAY)
      })
      mockOnSave.mockClear()

      // Rapid changes
      rerender({ metronome: createMockMetronome({ bpm: 121 }) })
      act(() => jest.advanceTimersByTime(DELAY / 4))

      rerender({ metronome: createMockMetronome({ bpm: 122 }) })
      act(() => jest.advanceTimersByTime(DELAY / 4))

      rerender({ metronome: createMockMetronome({ bpm: 123 }) })
      act(() => jest.advanceTimersByTime(DELAY / 4))

      // Should not have saved yet
      expect(mockOnSave).not.toHaveBeenCalled()

      // Wait for final delay
      act(() => jest.advanceTimersByTime(DELAY))

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledTimes(1)
      })
    })

    it('should reset timer on each change', async () => {
      const { rerender } = renderHook(
        ({ metronome }) => useAutoSave(metronome, mockOnSave, { delay: DELAY }),
        {
          initialProps: { metronome: createMockMetronome({ bpm: 120 }) },
        },
      )

      // Clear initial render
      mockOnSave.mockClear()
      act(() => {
        jest.advanceTimersByTime(DELAY)
      })
      mockOnSave.mockClear()

      rerender({ metronome: createMockMetronome({ bpm: 121 }) })
      act(() => jest.advanceTimersByTime(DELAY * 0.75))

      // Another change before timeout
      rerender({ metronome: createMockMetronome({ bpm: 122 }) })
      act(() => jest.advanceTimersByTime(DELAY * 0.75))

      // Still not saved
      expect(mockOnSave).not.toHaveBeenCalled()

      // Complete the delay
      act(() => jest.advanceTimersByTime(DELAY * 0.25))

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledTimes(1)
      })
    })

    it('should only save once after debounce period ends', async () => {
      const { rerender } = renderHook(
        ({ metronome }) => useAutoSave(metronome, mockOnSave, { delay: DELAY }),
        {
          initialProps: { metronome: createMockMetronome({ bpm: 120 }) },
        },
      )

      // Clear initial render
      mockOnSave.mockClear()
      act(() => {
        jest.advanceTimersByTime(DELAY)
      })
      mockOnSave.mockClear()

      // Multiple rapid changes
      for (let i = 121; i <= 130; i++) {
        rerender({ metronome: createMockMetronome({ bpm: i }) })
        act(() => jest.advanceTimersByTime(DELAY / 20))
      }

      expect(mockOnSave).not.toHaveBeenCalled()

      // Wait for debounce to complete
      act(() => jest.advanceTimersByTime(DELAY))

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('Auto-save when stopping playback', () => {
    it('should trigger save when isPlaying changes from true to false', async () => {
      const { rerender } = renderHook(
        ({ metronome }) => useAutoSave(metronome, mockOnSave, { delay: DELAY }),
        {
          initialProps: {
            metronome: createMockMetronome({
              isPlaying: true,
              timeUsed: INTERVAL / 2,
            }),
          },
        },
      )

      // Clear initial render
      mockOnSave.mockClear()
      act(() => {
        jest.advanceTimersByTime(DELAY)
      })
      mockOnSave.mockClear()

      // Stop playing
      rerender({
        metronome: createMockMetronome({
          isPlaying: false,
          timeUsed: INTERVAL / 2,
        }),
      })

      act(() => {
        jest.advanceTimersByTime(DELAY)
      })

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledTimes(1)
      })
    })

    it('should not trigger additional save when isPlaying changes from false to true', async () => {
      const { rerender } = renderHook(
        ({ metronome }) => useAutoSave(metronome, mockOnSave, { delay: DELAY }),
        {
          initialProps: {
            metronome: createMockMetronome({
              isPlaying: false,
              timeUsed: 0,
            }),
          },
        },
      )

      // Clear initial render
      mockOnSave.mockClear()
      act(() => {
        jest.advanceTimersByTime(DELAY)
      })
      mockOnSave.mockClear()

      // Start playing
      rerender({
        metronome: createMockMetronome({
          isPlaying: true,
          timeUsed: 0,
        }),
      })

      act(() => {
        jest.advanceTimersByTime(DELAY)
      })

      // Should not save on start
      expect(mockOnSave).not.toHaveBeenCalled()
    })

    it('should trigger save when pausing at any time', async () => {
      const { rerender } = renderHook(
        ({ metronome }) => useAutoSave(metronome, mockOnSave, { delay: DELAY }),
        {
          initialProps: {
            metronome: createMockMetronome({
              isPlaying: true,
              timeUsed: INTERVAL * 0.7, // 70% through interval
            }),
          },
        },
      )

      // Clear initial render
      mockOnSave.mockClear()
      act(() => {
        jest.advanceTimersByTime(DELAY)
      })
      mockOnSave.mockClear()

      // Pause
      rerender({
        metronome: createMockMetronome({
          isPlaying: false,
          timeUsed: INTERVAL * 0.7,
        }),
      })

      act(() => {
        jest.advanceTimersByTime(DELAY)
      })

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('Auto-save at regular intervals while playing', () => {
    it('should trigger save at first interval', async () => {
      const { rerender } = renderHook(
        ({ metronome }) => useAutoSave(metronome, mockOnSave, { delay: DELAY }),
        {
          initialProps: {
            metronome: createMockMetronome({
              isPlaying: true,
              timeUsed: 0,
            }),
          },
        },
      )

      // Clear initial render
      mockOnSave.mockClear()
      act(() => {
        jest.advanceTimersByTime(DELAY)
      })
      mockOnSave.mockClear()

      // Simulate first interval
      rerender({
        metronome: createMockMetronome({
          isPlaying: true,
          timeUsed: INTERVAL,
        }),
      })

      act(() => {
        jest.advanceTimersByTime(DELAY)
      })

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledTimes(1)
      })
    })

    it('should trigger save at second interval', async () => {
      const { rerender } = renderHook(
        ({ metronome }) => useAutoSave(metronome, mockOnSave, { delay: DELAY }),
        {
          initialProps: {
            metronome: createMockMetronome({
              isPlaying: true,
              timeUsed: 0,
            }),
          },
        },
      )

      // Clear initial render
      mockOnSave.mockClear()
      act(() => {
        jest.advanceTimersByTime(DELAY)
      })
      mockOnSave.mockClear()

      // Simulate second interval
      rerender({
        metronome: createMockMetronome({
          isPlaying: true,
          timeUsed: INTERVAL * 2,
        }),
      })

      act(() => {
        jest.advanceTimersByTime(DELAY)
      })

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledTimes(1)
      })
    })

    it('should trigger save at multiple intervals', async () => {
      const { rerender } = renderHook(
        ({ metronome }) => useAutoSave(metronome, mockOnSave, { delay: DELAY }),
        {
          initialProps: {
            metronome: createMockMetronome({
              isPlaying: true,
              timeUsed: 0,
            }),
          },
        },
      )

      // Clear initial render
      mockOnSave.mockClear()
      act(() => {
        jest.advanceTimersByTime(DELAY)
      })
      mockOnSave.mockClear()

      // Test intervals 1, 2, 3, 4, 5
      for (let i = 1; i <= 5; i++) {
        rerender({
          metronome: createMockMetronome({
            isPlaying: true,
            timeUsed: INTERVAL * i,
          }),
        })

        act(() => {
          jest.advanceTimersByTime(DELAY)
        })

        await waitFor(() => {
          expect(mockOnSave).toHaveBeenCalledTimes(i)
        })
      }
    })

    it('should not trigger save at timeUsed = 0 on initial render', async () => {
      renderHook(
        ({ metronome }) => useAutoSave(metronome, mockOnSave, { delay: DELAY }),
        {
          initialProps: {
            metronome: createMockMetronome({
              isPlaying: false,
              timeUsed: 0,
            }),
          },
        },
      )

      act(() => {
        jest.advanceTimersByTime(DELAY)
      })

      // Only one call from property change useEffect, not from timeUsed useEffect
      expect(mockOnSave).toHaveBeenCalledTimes(1)
    })

    it('should not trigger save just before interval', async () => {
      const { rerender } = renderHook(
        ({ metronome }) => useAutoSave(metronome, mockOnSave, { delay: DELAY }),
        {
          initialProps: {
            metronome: createMockMetronome({
              isPlaying: true,
              timeUsed: INTERVAL - 1000,
            }),
          },
        },
      )

      // Clear initial render
      mockOnSave.mockClear()
      act(() => {
        jest.advanceTimersByTime(DELAY)
      })
      mockOnSave.mockClear()

      // Just before interval (1 second before)
      rerender({
        metronome: createMockMetronome({
          isPlaying: true,
          timeUsed: INTERVAL - 500,
        }),
      })

      act(() => {
        jest.advanceTimersByTime(DELAY)
      })

      expect(mockOnSave).not.toHaveBeenCalled()
    })

    it('should not trigger save just after interval', async () => {
      const { rerender } = renderHook(
        ({ metronome }) => useAutoSave(metronome, mockOnSave, { delay: DELAY }),
        {
          initialProps: {
            metronome: createMockMetronome({
              isPlaying: true,
              timeUsed: INTERVAL - 1000,
            }),
          },
        },
      )

      // Clear initial render
      mockOnSave.mockClear()
      act(() => {
        jest.advanceTimersByTime(DELAY)
      })
      mockOnSave.mockClear()

      // Just after interval (1 second after)
      rerender({
        metronome: createMockMetronome({
          isPlaying: true,
          timeUsed: INTERVAL + 1000,
        }),
      })

      act(() => {
        jest.advanceTimersByTime(DELAY)
      })

      expect(mockOnSave).not.toHaveBeenCalled()
    })

    it('should not trigger at arbitrary non-interval times', async () => {
      const { rerender } = renderHook(
        ({ metronome }) => useAutoSave(metronome, mockOnSave, { delay: DELAY }),
        {
          initialProps: {
            metronome: createMockMetronome({
              isPlaying: true,
              timeUsed: 1000,
            }),
          },
        },
      )

      // Clear initial render
      mockOnSave.mockClear()
      act(() => {
        jest.advanceTimersByTime(DELAY)
      })
      mockOnSave.mockClear()

      // Test various non-interval values
      const testValues = [
        INTERVAL * 0.25, // 25% through
        INTERVAL * 0.5, // 50% through
        INTERVAL * 0.75, // 75% through
        INTERVAL * 1.3, // 30% past first interval
        INTERVAL * 1.7, // 70% past first interval
        INTERVAL * 2.2, // 20% past second interval
      ]

      for (const timeUsed of testValues) {
        rerender({
          metronome: createMockMetronome({
            isPlaying: true,
            timeUsed,
          }),
        })

        act(() => {
          jest.advanceTimersByTime(DELAY)
        })

        expect(mockOnSave).not.toHaveBeenCalled()
        mockOnSave.mockClear()
      }
    })
  })

  describe('Enabled/Disabled state', () => {
    it('should not trigger save when enabled is false', async () => {
      const { rerender } = renderHook(
        ({ metronome }) =>
          useAutoSave(metronome, mockOnSave, { enabled: false }),
        {
          initialProps: { metronome: createMockMetronome({ bpm: 120 }) },
        },
      )

      rerender({ metronome: createMockMetronome({ bpm: 140 }) })

      act(() => {
        jest.advanceTimersByTime(DELAY)
      })

      expect(mockOnSave).not.toHaveBeenCalled()
    })

    it('should set isSaving to false when disabled', () => {
      const metronome = createMockMetronome()
      const { result } = renderHook(() =>
        useAutoSave(metronome, mockOnSave, { enabled: false }),
      )

      expect(result.current.isSaving).toBe(false)
    })

    it('should not trigger on interval when disabled', async () => {
      const { rerender } = renderHook(
        ({ metronome }) =>
          useAutoSave(metronome, mockOnSave, { enabled: false }),
        {
          initialProps: {
            metronome: createMockMetronome({
              isPlaying: true,
              timeUsed: 0,
            }),
          },
        },
      )

      rerender({
        metronome: createMockMetronome({
          isPlaying: true,
          timeUsed: INTERVAL,
        }),
      })

      act(() => {
        jest.advanceTimersByTime(DELAY)
      })

      expect(mockOnSave).not.toHaveBeenCalled()
    })
  })

  describe('resetSaving functionality', () => {
    it('should reset isSaving to false when called', async () => {
      const { result, rerender } = renderHook(
        ({ metronome }) => useAutoSave(metronome, mockOnSave, { delay: DELAY }),
        {
          initialProps: { metronome: createMockMetronome({ bpm: 120 }) },
        },
      )

      // Clear initial state
      act(() => {
        jest.advanceTimersByTime(DELAY)
      })

      // Trigger save
      rerender({ metronome: createMockMetronome({ bpm: 140 }) })

      await waitFor(() => {
        expect(result.current.isSaving).toBe(true)
      })

      // Reset saving
      act(() => {
        result.current.resetSaving()
      })

      expect(result.current.isSaving).toBe(false)
    })

    it('should be callable multiple times', () => {
      const { result } = renderHook(() =>
        useAutoSave(createMockMetronome(), mockOnSave, { enabled: true }),
      )

      act(() => {
        result.current.resetSaving()
        result.current.resetSaving()
        result.current.resetSaving()
      })

      expect(result.current.isSaving).toBe(false)
    })
  })

  describe('Cleanup', () => {
    it('should clear timeout on unmount', () => {
      const { result, rerender, unmount } = renderHook(
        ({ metronome }) => useAutoSave(metronome, mockOnSave, { delay: DELAY }),
        {
          initialProps: { metronome: createMockMetronome({ bpm: 120 }) },
        },
      )

      // Clear initial render
      mockOnSave.mockClear()
      act(() => {
        jest.advanceTimersByTime(DELAY)
      })
      mockOnSave.mockClear()

      // Trigger save
      rerender({ metronome: createMockMetronome({ bpm: 140 }) })

      expect(result.current.isSaving).toBe(true)

      // Unmount before timeout completes
      unmount()

      act(() => {
        jest.advanceTimersByTime(DELAY)
      })

      // Should not have called save after unmount
      expect(mockOnSave).not.toHaveBeenCalled()
    })

    it('should handle unmount during debounce period', () => {
      const { rerender, unmount } = renderHook(
        ({ metronome }) => useAutoSave(metronome, mockOnSave, { delay: DELAY }),
        {
          initialProps: { metronome: createMockMetronome({ bpm: 120 }) },
        },
      )

      // Clear initial render
      mockOnSave.mockClear()
      act(() => {
        jest.advanceTimersByTime(DELAY)
      })
      mockOnSave.mockClear()

      // Make several changes
      rerender({ metronome: createMockMetronome({ bpm: 121 }) })
      rerender({ metronome: createMockMetronome({ bpm: 122 }) })
      rerender({ metronome: createMockMetronome({ bpm: 123 }) })

      // Unmount during debounce
      unmount()

      act(() => {
        jest.advanceTimersByTime(DELAY)
      })

      expect(mockOnSave).not.toHaveBeenCalled()
    })
  })

  describe('Custom delay', () => {
    it('should use custom delay when provided', async () => {
      const customDelay = DELAY * 2.5

      const { rerender } = renderHook(
        ({ metronome }) =>
          useAutoSave(metronome, mockOnSave, { delay: customDelay }),
        {
          initialProps: { metronome: createMockMetronome({ bpm: 120 }) },
        },
      )

      // Clear initial render
      mockOnSave.mockClear()
      act(() => {
        jest.advanceTimersByTime(customDelay)
      })
      mockOnSave.mockClear()

      rerender({ metronome: createMockMetronome({ bpm: 140 }) })

      // Should not save after default delay
      act(() => {
        jest.advanceTimersByTime(DELAY)
      })
      expect(mockOnSave).not.toHaveBeenCalled()

      // Should save after custom delay
      act(() => {
        jest.advanceTimersByTime(customDelay - DELAY)
      })

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('Integration scenarios', () => {
    it('should handle complete play-pause-modify cycle', async () => {
      const { rerender } = renderHook(
        ({ metronome }) => useAutoSave(metronome, mockOnSave, { delay: DELAY }),
        {
          initialProps: {
            metronome: createMockMetronome({
              isPlaying: false,
              timeUsed: 0,
              bpm: 120,
            }),
          },
        },
      )

      // Clear initial render
      mockOnSave.mockClear()
      act(() => jest.advanceTimersByTime(DELAY))
      mockOnSave.mockClear()

      // Start playing
      rerender({
        metronome: createMockMetronome({
          isPlaying: true,
          timeUsed: 0,
          bpm: 120,
        }),
      })

      // First interval passed
      rerender({
        metronome: createMockMetronome({
          isPlaying: true,
          timeUsed: INTERVAL,
          bpm: 120,
        }),
      })

      act(() => jest.advanceTimersByTime(DELAY))

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledTimes(1)
      })

      mockOnSave.mockClear()

      // Stop playing (not at interval)
      rerender({
        metronome: createMockMetronome({
          isPlaying: false,
          timeUsed: INTERVAL + 5000,
          bpm: 120,
        }),
      })

      act(() => jest.advanceTimersByTime(DELAY))

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledTimes(1)
      })

      mockOnSave.mockClear()

      // Modify BPM while paused
      rerender({
        metronome: createMockMetronome({
          isPlaying: false,
          timeUsed: INTERVAL + 5000,
          bpm: 140,
        }),
      })

      act(() => jest.advanceTimersByTime(DELAY))

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledTimes(1)
      })
    })

    it('should handle rapid play-pause cycles', async () => {
      const { rerender } = renderHook(
        ({ metronome }) => useAutoSave(metronome, mockOnSave, { delay: DELAY }),
        {
          initialProps: {
            metronome: createMockMetronome({
              isPlaying: false,
              timeUsed: 0,
            }),
          },
        },
      )

      // Clear initial render
      mockOnSave.mockClear()
      act(() => jest.advanceTimersByTime(DELAY))
      mockOnSave.mockClear()

      // Play -> Pause -> Play -> Pause quickly
      const cycles = [
        { isPlaying: true, timeUsed: 0 },
        { isPlaying: false, timeUsed: 1000 },
        { isPlaying: true, timeUsed: 1000 },
        { isPlaying: false, timeUsed: 2000 },
      ]

      for (const state of cycles) {
        rerender({
          metronome: createMockMetronome(state),
        })
        act(() => jest.advanceTimersByTime(DELAY / 10))
      }

      // Complete debounce
      act(() => jest.advanceTimersByTime(DELAY))

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledTimes(1)
      })
    })

    it('should handle property changes during playback', async () => {
      const { rerender } = renderHook(
        ({ metronome }) => useAutoSave(metronome, mockOnSave, { delay: DELAY }),
        {
          initialProps: {
            metronome: createMockMetronome({
              isPlaying: true,
              timeUsed: 0,
              bpm: 120,
            }),
          },
        },
      )

      // Clear initial render
      mockOnSave.mockClear()
      act(() => jest.advanceTimersByTime(DELAY))
      mockOnSave.mockClear()

      // Change BPM while playing
      rerender({
        metronome: createMockMetronome({
          isPlaying: true,
          timeUsed: INTERVAL / 2,
          bpm: 140,
        }),
      })

      act(() => jest.advanceTimersByTime(DELAY))

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledTimes(1)
      })

      mockOnSave.mockClear()

      // Continue playing to next interval
      rerender({
        metronome: createMockMetronome({
          isPlaying: true,
          timeUsed: INTERVAL,
          bpm: 140,
        }),
      })

      act(() => jest.advanceTimersByTime(DELAY))

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledTimes(1)
      })
    })
  })
})
