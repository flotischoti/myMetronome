/**
 * @jest-environment node
 */
import { isEmailValid } from '@/lib/mail'

describe('mail.ts', () => {
  test('isEmailValid returns true for valid emails', () => {
    expect(isEmailValid('test@example.com')).toBe(true)
  })

  test('isEmailValid returns false for invalid emails', () => {
    expect(isEmailValid('invalid-email')).toBe(false)
    expect(isEmailValid('')).toBe(false)
  })
})

// __tests__/mail.test.ts
import { sendPasswordResetEmail } from '@/lib/mail'
import { Resend } from 'resend'

jest.mock('resend')

describe('sendPasswordResetEmail', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should return error if RESEND_API_KEY is not set', async () => {
    delete process.env.RESEND_API_KEY
    process.env.WEBSITE_HOSTNAME = 'https://example.com'

    const result = await sendPasswordResetEmail('test@example.com', 'token123')

    expect(result).toEqual({
      success: false,
      error: 'Email service not configured',
    })
  })

  it('should return error if WEBSITE_HOSTNAME is not set', async () => {
    process.env.RESEND_API_KEY = 'test_key'
    delete process.env.WEBSITE_HOSTNAME

    const result = await sendPasswordResetEmail('test@example.com', 'token123')

    expect(result).toEqual({
      success: false,
      error: 'Email service not configured',
    })
  })

  it('should send email successfully', async () => {
    process.env.RESEND_API_KEY = 'test_key'
    process.env.WEBSITE_HOSTNAME = 'https://example.com'

    const mockSend = jest.fn().mockResolvedValue({
      data: { id: 'email-id-123' },
      error: null,
    })

    ;(Resend as jest.MockedClass<typeof Resend>).mockImplementation(
      () =>
        ({
          emails: { send: mockSend },
        }) as any,
    )

    const result = await sendPasswordResetEmail('test@example.com', 'token123')

    expect(result).toEqual({ success: true })
    expect(mockSend).toHaveBeenCalledWith({
      from: 'noreply@metronomes.xyz',
      to: 'test@example.com',
      subject: 'Password Reset - myMetronome',
      html: expect.stringContaining(
        'https://example.com/reset-password/confirm?token=token123',
      ),
    })
  })

  it('should handle Resend API error', async () => {
    process.env.RESEND_API_KEY = 'test_key'
    process.env.WEBSITE_HOSTNAME = 'https://example.com'

    const mockSend = jest.fn().mockResolvedValue({
      data: null,
      error: { message: 'API error' },
    })

    ;(Resend as jest.MockedClass<typeof Resend>).mockImplementation(
      () =>
        ({
          emails: { send: mockSend },
        }) as any,
    )

    const result = await sendPasswordResetEmail('test@example.com', 'token123')

    expect(result).toEqual({
      success: false,
      error: 'Failed to send email',
    })
  })

  it('should handle exception during send', async () => {
    process.env.RESEND_API_KEY = 'test_key'
    process.env.WEBSITE_HOSTNAME = 'https://example.com'

    const mockSend = jest.fn().mockRejectedValue(new Error('Network error'))

    ;(Resend as jest.MockedClass<typeof Resend>).mockImplementation(
      () =>
        ({
          emails: { send: mockSend },
        }) as any,
    )

    const result = await sendPasswordResetEmail('test@example.com', 'token123')

    expect(result).toEqual({
      success: false,
      error: 'Network error',
    })
  })

  it('should handle non-Error exception', async () => {
    process.env.RESEND_API_KEY = 'test_key'
    process.env.WEBSITE_HOSTNAME = 'https://example.com'

    const mockSend = jest.fn().mockRejectedValue('String error')

    ;(Resend as jest.MockedClass<typeof Resend>).mockImplementation(
      () =>
        ({
          emails: { send: mockSend },
        }) as any,
    )

    const result = await sendPasswordResetEmail('test@example.com', 'token123')

    expect(result).toEqual({
      success: false,
      error: 'Failed to send email',
    })
  })
})
