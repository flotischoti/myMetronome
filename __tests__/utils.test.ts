/**
 * @jest-environment node
 */
import { isValidNumber } from '@/lib/utils'
import { getErrorResponse } from '@/lib/utils'

describe('utils.ts', () => {
  test('getErrorResponse returns object with text', () => {
    expect(getErrorResponse('fail')).toEqual({ text: 'fail' })
  })

  test('isValidNumber returns true for numeric strings', () => {
    expect(isValidNumber('123')).toBe(true)
  })

  test('isValidNumber returns false for invalid inputs', () => {
    expect(isValidNumber('abc')).toBe(false)
  })
})
