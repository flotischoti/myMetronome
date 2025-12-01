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
