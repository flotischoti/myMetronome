// __tests__/commandHelper.test.ts
/**
 * @jest-environment node
 */
import { cookies } from 'next/headers'
import { setCommand, setErrorCommand } from '../app/actions/commandHelper'

jest.mock('next/headers', () => ({ cookies: jest.fn() }))

const mockCookies = cookies as jest.MockedFunction<typeof cookies>

describe('commandHelper', () => {
  let mockCookiesInstance: any

  beforeEach(() => {
    jest.clearAllMocks()

    mockCookiesInstance = {
      set: jest.fn(),
    }

    mockCookies.mockReturnValue(mockCookiesInstance)
  })

  describe('setCommand', () => {
    it('should set command cookie with timestamp', () => {
      setCommand('testCommand')

      expect(mockCookiesInstance.set).toHaveBeenCalledWith(
        'command',
        expect.stringMatching(/^testCommand:\d+$/),
        {
          httpOnly: false,
          maxAge: 2,
          path: '/',
          sameSite: 'strict',
        },
      )
    })

    it('should use custom maxAge when provided', () => {
      setCommand('testCommand', { maxAge: 10 })

      expect(mockCookiesInstance.set).toHaveBeenCalledWith(
        'command',
        expect.stringMatching(/^testCommand:\d+$/),
        {
          httpOnly: false,
          maxAge: 10,
          path: '/',
          sameSite: 'strict',
        },
      )
    })

    it('should use custom path when provided', () => {
      setCommand('testCommand', { path: '/custom' })

      expect(mockCookiesInstance.set).toHaveBeenCalledWith(
        'command',
        expect.stringMatching(/^testCommand:\d+$/),
        {
          httpOnly: false,
          maxAge: 2,
          path: '/custom',
          sameSite: 'strict',
        },
      )
    })

    it('should append unique timestamp each time', async () => {
      setCommand('same')
      const firstCall = mockCookiesInstance.set.mock.calls[0][1]

      // ✅ Warte 1ms damit Timestamp sich ändert
      await new Promise((resolve) => setTimeout(resolve, 1))

      jest.clearAllMocks()

      setCommand('same')
      const secondCall = mockCookiesInstance.set.mock.calls[0][1]

      expect(firstCall).not.toBe(secondCall)
    })
  })

  describe('setErrorCommand', () => {
    it('should set error command with JSON format', () => {
      setErrorCommand('Error message')

      expect(mockCookiesInstance.set).toHaveBeenCalledWith(
        'command',
        expect.stringMatching(
          /^\{"message":"Error message","type":"error"\}:\d+$/,
        ),
        {
          httpOnly: false,
          maxAge: 2,
          path: '/',
          sameSite: 'strict',
        },
      )
    })

    it('should use custom options', () => {
      setErrorCommand('Error message', { maxAge: 5, path: '/error' })

      expect(mockCookiesInstance.set).toHaveBeenCalledWith(
        'command',
        expect.stringMatching(
          /^\{"message":"Error message","type":"error"\}:\d+$/,
        ),
        {
          httpOnly: false,
          maxAge: 5,
          path: '/error',
          sameSite: 'strict',
        },
      )
    })
  })
})
