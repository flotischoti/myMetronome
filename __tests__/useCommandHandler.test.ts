// __tests__/useCommandHandler.test.ts
import { renderHook } from '@testing-library/react'
import { useCommandHandler } from '@/app/hooks/useCommandHandler'

describe('useCommandHandler', () => {
  let mockOnMessage: jest.Mock

  beforeEach(() => {
    mockOnMessage = jest.fn()
    jest.clearAllMocks()
    // Clear console logs
    jest.spyOn(console, 'log').mockImplementation()
    jest.spyOn(console, 'warn').mockImplementation()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should not call onMessage if command is undefined', () => {
    renderHook(() => useCommandHandler(undefined, mockOnMessage))

    expect(mockOnMessage).not.toHaveBeenCalled()
  })

  it('should handle predefined command without timestamp', () => {
    renderHook(() => useCommandHandler('created', mockOnMessage))

    expect(mockOnMessage).toHaveBeenCalledWith('Metronome created', 'success')
  })

  it('should handle predefined command with timestamp', () => {
    renderHook(() => useCommandHandler('deleted:1234567890', mockOnMessage))

    expect(mockOnMessage).toHaveBeenCalledWith('Metronome deleted', 'success')
  })

  it('should handle all predefined commands', () => {
    const commands = [
      { cmd: 'created', msg: 'Metronome created', type: 'success' },
      { cmd: 'deleted', msg: 'Metronome deleted', type: 'success' },
      { cmd: 'updated', msg: 'Metronome updated', type: 'success' },
      { cmd: 'loggedIn', msg: 'Logged In', type: 'info' },
      { cmd: 'signedUp', msg: 'User created', type: 'info' },
      { cmd: 'userdeleted', msg: 'User deleted', type: 'info' },
      { cmd: 'passwordChanged', msg: 'Password changed', type: 'success' },
      { cmd: 'usernameChanged', msg: 'Username changed', type: 'success' },
      { cmd: 'emailChanged', msg: 'Email changed', type: 'success' },
      { cmd: 'resetEmailSent', msg: 'Mail sent', type: 'success' },
      { cmd: 'unauthorized', msg: 'You are not authorized', type: 'error' },
      { cmd: 'notFound', msg: 'Resource not found', type: 'error' },
    ]

    commands.forEach(({ cmd, msg, type }) => {
      mockOnMessage.mockClear()
      renderHook(() => useCommandHandler(cmd, mockOnMessage))
      expect(mockOnMessage).toHaveBeenCalledWith(msg, type as any)
    })
  })

  it('should handle custom JSON command', () => {
    const command = JSON.stringify({
      message: 'Custom error',
      type: 'error',
    })

    renderHook(() => useCommandHandler(command, mockOnMessage))

    expect(mockOnMessage).toHaveBeenCalledWith('Custom error', 'error')
  })

  it('should handle custom JSON command with timestamp', () => {
    const command =
      JSON.stringify({ message: 'Custom success', type: 'success' }) +
      ':1234567890'

    renderHook(() => useCommandHandler(command, mockOnMessage))

    expect(mockOnMessage).toHaveBeenCalledWith('Custom success', 'success')
  })

  it('should not process the same command twice', () => {
    const { rerender } = renderHook(
      ({ cmd }) => useCommandHandler(cmd, mockOnMessage),
      {
        initialProps: { cmd: 'created:123' },
      },
    )

    expect(mockOnMessage).toHaveBeenCalledTimes(1)

    mockOnMessage.mockClear()
    rerender({ cmd: 'created:123' })

    expect(mockOnMessage).not.toHaveBeenCalled()
  })

  it('should process new command after command changes', () => {
    const { rerender } = renderHook(
      ({ cmd }) => useCommandHandler(cmd, mockOnMessage),
      {
        initialProps: { cmd: 'created:123' },
      },
    )

    expect(mockOnMessage).toHaveBeenCalledWith('Metronome created', 'success')

    mockOnMessage.mockClear()
    rerender({ cmd: 'deleted:456' })

    expect(mockOnMessage).toHaveBeenCalledWith('Metronome deleted', 'success')
  })

  it('should warn for unknown command', () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()

    renderHook(() => useCommandHandler('unknownCommand', mockOnMessage))

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Unknown command: unknownCommand'),
    )
    expect(mockOnMessage).not.toHaveBeenCalled()
  })

  it('should handle malformed JSON gracefully', () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()

    renderHook(() => useCommandHandler('{"invalid":json}', mockOnMessage))

    expect(consoleWarnSpy).toHaveBeenCalled()
    expect(mockOnMessage).not.toHaveBeenCalled()
  })

  it('should extract timestamp correctly from various formats', () => {
    const testCases = [
      'created:1234567890',
      'deleted:9876543210',
      JSON.stringify({ message: 'test', type: 'info' }) + ':1111111111',
    ]

    testCases.forEach((cmd) => {
      mockOnMessage.mockClear()
      renderHook(() => useCommandHandler(cmd, mockOnMessage))
      expect(mockOnMessage).toHaveBeenCalled()
    })
  })

  it('should not treat non-timestamp suffix as timestamp', () => {
    renderHook(() => useCommandHandler('created:notanumber', mockOnMessage))

    // Should not find command because "created:notanumber" is not a known command
    expect(mockOnMessage).not.toHaveBeenCalled()
  })
})
