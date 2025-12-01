// __tests__/useToast.test.ts
import { renderHook, act } from '@testing-library/react'
import { useToast } from '@/app/hooks/useToast'

jest.useFakeTimers()

describe('useToast', () => {
  it('should initialize with no visible toast', () => {
    const { result } = renderHook(() => useToast())

    expect(result.current.isVisible).toBe(false)
    expect(result.current.message).toBe('')
    expect(result.current.type).toBe('')
  })

  it('should show toast with message and type', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.show('Test message', 'success')
    })

    expect(result.current.isVisible).toBe(true)
    expect(result.current.message).toBe('Test message')
    expect(result.current.type).toBe('success')
  })

  it('should auto-hide toast after duration', () => {
    const { result } = renderHook(() => useToast(2000))

    act(() => {
      result.current.show('Test message', 'info')
    })

    expect(result.current.isVisible).toBe(true)

    act(() => {
      jest.advanceTimersByTime(2000)
    })

    expect(result.current.isVisible).toBe(false)
  })

  it('should use custom duration', () => {
    const { result } = renderHook(() => useToast(5000))

    act(() => {
      result.current.show('Test message', 'error')
    })

    expect(result.current.isVisible).toBe(true)

    act(() => {
      jest.advanceTimersByTime(3000)
    })

    expect(result.current.isVisible).toBe(true)

    act(() => {
      jest.advanceTimersByTime(2000)
    })

    expect(result.current.isVisible).toBe(false)
  })

  it('should handle multiple show calls', () => {
    const { result } = renderHook(() => useToast(2000))

    act(() => {
      result.current.show('First message', 'success')
    })

    expect(result.current.message).toBe('First message')

    act(() => {
      result.current.show('Second message', 'error')
    })

    expect(result.current.message).toBe('Second message')
    expect(result.current.type).toBe('error')
  })

  it('should reset timer on new show call', () => {
    const { result } = renderHook(() => useToast(2000))

    act(() => {
      result.current.show('First message', 'success')
    })

    act(() => {
      jest.advanceTimersByTime(1500)
    })

    expect(result.current.isVisible).toBe(true)

    act(() => {
      result.current.show('Second message', 'info')
    })

    act(() => {
      jest.advanceTimersByTime(1500)
    })

    // Should still be visible because timer was reset
    expect(result.current.isVisible).toBe(true)

    act(() => {
      jest.advanceTimersByTime(500)
    })

    expect(result.current.isVisible).toBe(false)
  })

  it('should support all toast types', () => {
    const { result } = renderHook(() => useToast())

    const types: Array<'success' | 'error' | 'info'> = [
      'success',
      'error',
      'info',
    ]

    types.forEach((type) => {
      act(() => {
        result.current.show(`${type} message`, type)
      })

      expect(result.current.type).toBe(type)
    })
  })

  it('should cleanup timer on unmount', () => {
    const { result, unmount } = renderHook(() => useToast(2000))

    act(() => {
      result.current.show('Test message', 'success')
    })

    unmount()

    act(() => {
      jest.advanceTimersByTime(2000)
    })

    // No error should be thrown
  })
})
