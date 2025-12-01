/**
 * @jest-environment node
 */

import {
  getJwt,
  decodeToken,
  verifyToken,
  getUserAttrFromToken,
} from '../lib/jwt'

describe('jwt.ts', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV, TOKEN_KEY: 'testsecret' }
  })

  afterAll(() => {
    process.env = OLD_ENV
  })
  test('getJwt and decodeToken should create and verify JWT correctly', async () => {
    const jwt = await getJwt({ userId: 42, name: 'Max' }, '1h')
    expect(typeof jwt).toBe('string')
    const payload = await decodeToken(jwt)
    expect(payload?.userId).toBe(42)
    expect(payload?.name).toBe('Max')
  })

  test('decodeToken returns null for invalid token', async () => {
    const result = await decodeToken('invalid.token')
    expect(result).toBeNull()
  })

  test('verifyToken returns true for valid token', async () => {
    const jwt = await getJwt({ userId: 1, name: 'Test' })
    const result = await verifyToken(jwt)
    expect(result).toBe(true)
  })

  test('verifyToken returns false for invalid token', async () => {
    const result = await verifyToken('invalid')
    expect(result).toBe(false)
  })

  test('getUserAttrFromToken returns correct attribute', async () => {
    const jwt = await getJwt({ userId: 123, name: 'Alice' })
    const result = await getUserAttrFromToken<number>(jwt, 'userId')
    expect(result).toBe(123)
  })

  test('getUserAttrFromToken returns null for undefined token', async () => {
    const result = await getUserAttrFromToken(undefined, 'userId')
    expect(result).toBeNull()
  })
})
