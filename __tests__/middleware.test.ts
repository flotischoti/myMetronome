jest.mock('../app/api/util')

import { NextRequest } from 'next/server'
import { middleware } from '../middleware'
import * as utils from '../app/api/util'


describe('middleware.ts', () => {
  const mockUrl = 'https://example.com'
  const mockRequest = (path: string, token?: string) =>
    new NextRequest(`${mockUrl}${path}`, {
      headers: token ? { 'x-access-token': token } : {},
    })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('redirects to /metronome/new if no token', async () => {
    const req = mockRequest('/')
    const res = await middleware(req)
    expect(res?.status).toBe(307) // redirect
    expect(res?.headers.get('location')).toContain('/metronome/new')
  })

  test('redirects to /login if route requires auth and no token', async () => {
    const req = mockRequest('/account')
    const res = await middleware(req)
    expect(res?.headers.get('location')).toContain('/login?target=/account')
  })

  test('allows next() if token valid and route ok', async () => {
    ;(utils.verifyToken as jest.Mock).mockResolvedValue(true)
    ;(utils.decodeToken as jest.Mock).mockResolvedValue({ userId: 1 })
    ;(utils.getJwt as jest.Mock).mockResolvedValue('newtoken')

    const req = mockRequest('/account', 'validtoken')
    const res = await middleware(req)
    expect(res.headers.get('Set-Cookie')).toContain('token=newtoken')
  })

  test('redirects to /metronome/recent for root path when token present', async () => {
    ;(utils.verifyToken as jest.Mock).mockResolvedValue(true)
    ;(utils.decodeToken as jest.Mock).mockResolvedValue({ userId: 1 })
    ;(utils.getJwt as jest.Mock).mockResolvedValue('newtoken')

    const req = mockRequest('/', 'validtoken')
    const res = await middleware(req)
    expect(res.headers.get('location')).toContain('/metronome/recent')
  })
})
