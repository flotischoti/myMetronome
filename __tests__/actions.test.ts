/**
 * @jest-environment node
 */
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import * as bcrypt from 'bcrypt'
import * as utils from '../app/api/util'
import * as metronomeDb from '../db/metronome'
import * as userDb from '../db/user'
import {
  signupServerAction,
  loginServerAction,
  createMetronomeAction,
  deleteMetronomeAction,
  updateServerAction,
  updatePasswordServerAction,
  updateUsernameServerAction,
  deleteUserServerAction,
} from '../app/actions/actions'

// ========================================
// MOCKS
// ========================================
jest.mock('next/headers', () => ({ cookies: jest.fn() }))
jest.mock('next/navigation', () => ({ redirect: jest.fn() }))
jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }))
jest.mock('bcrypt')
jest.mock('../app/api/util')
jest.mock('../db/metronome')
jest.mock('../db/user')

const mockRedirect = redirect as jest.MockedFunction<typeof redirect>
const mockCookies = cookies as jest.MockedFunction<typeof cookies>
const mockRevalidatePath = revalidatePath as jest.MockedFunction<
  typeof revalidatePath
>

const createFormData = (data: Record<string, string>): FormData => {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => formData.append(key, value))
  return formData
}

describe('actions.ts', () => {
  let mockCookiesInstance: any

  beforeEach(() => {
    jest.clearAllMocks()

    mockCookiesInstance = {
      get: jest.fn().mockReturnValue({ value: 'token123' }),
      set: jest.fn(),
      delete: jest.fn(),
    }

    mockCookies.mockReturnValue(mockCookiesInstance)
    ;(utils.getUserAttrFromToken as jest.Mock).mockResolvedValue(5)

    mockRedirect.mockImplementation((url: string) => {
      const error = new Error('NEXT_REDIRECT') as any
      error.digest = `NEXT_REDIRECT;replace;${url};false`
      throw error
    })
  })

  // ========================================
  // SIGNUP TESTS
  // ========================================
  describe('signupServerAction', () => {
    it('should set error and redirect if passwords mismatch', async () => {
      const formData = createFormData({
        name: 'user',
        password: 'pass1',
        passwordRepeat: 'pass2',
        target: '',
      })

      await expect(signupServerAction(formData)).rejects.toThrow(
        'NEXT_REDIRECT',
      )

      expect(mockCookiesInstance.set).toHaveBeenCalledWith(
        'command',
        expect.stringContaining('match'),
        expect.any(Object),
      )
    })

    it('should set error and redirect if user already exists', async () => {
      ;(userDb.get as jest.Mock).mockResolvedValue({ id: 1, name: 'user' })

      const formData = createFormData({
        name: 'user',
        password: 'pass',
        passwordRepeat: 'pass',
        target: '',
      })

      await expect(signupServerAction(formData)).rejects.toThrow(
        'NEXT_REDIRECT',
      )

      expect(mockCookiesInstance.set).toHaveBeenCalledWith(
        'command',
        expect.stringContaining('exists'),
        expect.any(Object),
      )
    })

    it('should create user and redirect on success', async () => {
      ;(userDb.get as jest.Mock).mockResolvedValue(null)
      ;(bcrypt.hash as jest.Mock).mockResolvedValue('hashedpw')
      ;(userDb.create as jest.Mock).mockResolvedValue({ id: 1, name: 'user' })
      ;(utils.getJwt as jest.Mock).mockResolvedValue('token')

      const formData = createFormData({
        name: 'user',
        password: 'pass',
        passwordRepeat: 'pass',
        target: '',
      })

      await expect(signupServerAction(formData)).rejects.toThrow(
        'NEXT_REDIRECT',
      )

      expect(userDb.create).toHaveBeenCalled()
      expect(mockCookiesInstance.set).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'token' }),
      )
    })
  })

  // ========================================
  // LOGIN TESTS
  // ========================================
  describe('loginServerAction', () => {
    it('should set error and redirect if credentials missing', async () => {
      const formData = createFormData({ name: '', password: '', target: '' })

      await expect(loginServerAction(formData)).rejects.toThrow('NEXT_REDIRECT')

      expect(mockCookiesInstance.set).toHaveBeenCalledWith(
        'command',
        expect.stringContaining('missing'),
        expect.any(Object),
      )
    })

    it('should set error and redirect if user not found', async () => {
      ;(userDb.get as jest.Mock).mockResolvedValue(null)

      const formData = createFormData({
        name: 'user',
        password: 'pass',
        target: '',
      })

      await expect(loginServerAction(formData)).rejects.toThrow('NEXT_REDIRECT')

      expect(mockCookiesInstance.set).toHaveBeenCalledWith(
        'command',
        expect.stringContaining('not found'),
        expect.any(Object),
      )
    })

    it('should set error and redirect if password wrong', async () => {
      ;(userDb.get as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'user',
        password: 'hashed',
      })
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

      const formData = createFormData({
        name: 'user',
        password: 'wrong',
        target: '',
      })

      await expect(loginServerAction(formData)).rejects.toThrow('NEXT_REDIRECT')

      expect(mockCookiesInstance.set).toHaveBeenCalledWith(
        'command',
        expect.stringContaining('wrong'),
        expect.any(Object),
      )
    })

    it('should login successfully and redirect', async () => {
      ;(userDb.get as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'user',
        password: 'hashed',
      })
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)
      ;(utils.getJwt as jest.Mock).mockResolvedValue('newtoken')

      const formData = createFormData({
        name: 'user',
        password: 'pass',
        target: '',
      })

      await expect(loginServerAction(formData)).rejects.toThrow('NEXT_REDIRECT')

      expect(mockCookiesInstance.set).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'token' }),
      )
    })
  })

  // ========================================
  // METRONOME TESTS
  // ========================================
  describe('createMetronomeAction', () => {
    it('should set error if creation fails', async () => {
      ;(metronomeDb.create as jest.Mock).mockResolvedValue(null)

      await expect(createMetronomeAction({ bpm: 120 } as any)).rejects.toThrow(
        'NEXT_REDIRECT',
      )

      expect(mockCookiesInstance.set).toHaveBeenCalledWith(
        'command',
        expect.stringContaining('Failed'),
        expect.any(Object),
      )
    })

    it('should create metronome and redirect on success', async () => {
      ;(metronomeDb.create as jest.Mock).mockResolvedValue({ id: 10 })

      await expect(createMetronomeAction({ bpm: 120 } as any)).rejects.toThrow(
        'NEXT_REDIRECT',
      )

      expect(mockCookiesInstance.set).toHaveBeenCalledWith(
        'command',
        'created',
        expect.any(Object),
      )
    })
  })

  describe('deleteMetronomeAction', () => {
    it('should set error if metronome not found', async () => {
      ;(metronomeDb.get as jest.Mock).mockResolvedValue(null)

      await expect(deleteMetronomeAction(1, '/target')).rejects.toThrow(
        'NEXT_REDIRECT',
      )

      expect(mockCookiesInstance.set).toHaveBeenCalledWith(
        'command',
        expect.stringContaining('not found'),
        expect.any(Object),
      )
    })

    it('should set error if user not owner', async () => {
      ;(metronomeDb.get as jest.Mock).mockResolvedValue({ owner: 1 })
      ;(utils.getUserAttrFromToken as jest.Mock).mockResolvedValue(5)

      await expect(deleteMetronomeAction(1, '/target')).rejects.toThrow(
        'NEXT_REDIRECT',
      )

      expect(mockCookiesInstance.set).toHaveBeenCalledWith(
        'command',
        expect.stringContaining('not allowed'),
        expect.any(Object),
      )
    })

    it('should delete and redirect on success', async () => {
      ;(metronomeDb.get as jest.Mock).mockResolvedValue({ owner: 5 })
      ;(metronomeDb.deleteMetronome as jest.Mock).mockResolvedValue(true)

      await expect(deleteMetronomeAction(1, '/target')).rejects.toThrow(
        'NEXT_REDIRECT',
      )

      expect(mockCookiesInstance.set).toHaveBeenCalledWith(
        'command',
        'deleted',
        expect.any(Object),
      )
      expect(mockRevalidatePath).toHaveBeenCalledWith('/target')
    })
  })

  describe('updateServerAction', () => {
    it('should throw if metronome not found', async () => {
      ;(metronomeDb.get as jest.Mock).mockResolvedValue(null)

      await expect(updateServerAction({ id: 1 } as any)).rejects.toThrow(
        'not found',
      )
    })

    it('should throw if user not authorized', async () => {
      ;(metronomeDb.get as jest.Mock).mockResolvedValue({ owner: 1 })
      ;(utils.getUserAttrFromToken as jest.Mock).mockResolvedValue(5)

      await expect(updateServerAction({ id: 1 } as any)).rejects.toThrow(
        'not allowed',
      )
    })

    it('should update successfully', async () => {
      ;(metronomeDb.get as jest.Mock).mockResolvedValue({ owner: 5 })
      ;(metronomeDb.updateMetronome as jest.Mock).mockResolvedValue(true)

      await updateServerAction({ id: 1 } as any)

      expect(mockRevalidatePath).toHaveBeenCalledWith('/', 'layout')
    })
  })

  // ========================================
  // USER ACTIONS TESTS
  // ========================================
  describe('updatePasswordServerAction', () => {
    beforeEach(() => {
      ;(utils.getUserAttrFromToken as jest.Mock).mockResolvedValue('username')
    })

    it('should set error if passwords mismatch', async () => {
      ;(userDb.get as jest.Mock).mockResolvedValue({ password: 'hashed' })

      const formData = createFormData({
        oldPw: '1',
        newPw: '2',
        newPwConfirm: '3',
      })

      await expect(updatePasswordServerAction(formData)).rejects.toThrow(
        'NEXT_REDIRECT',
      )

      expect(mockCookiesInstance.set).toHaveBeenCalledWith(
        'command',
        expect.stringContaining('match'),
        expect.any(Object),
      )
    })

    it('should set error if old password incorrect', async () => {
      ;(userDb.get as jest.Mock).mockResolvedValue({ password: 'hashed' })
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

      const formData = createFormData({
        oldPw: 'x',
        newPw: 'y',
        newPwConfirm: 'y',
      })

      await expect(updatePasswordServerAction(formData)).rejects.toThrow(
        'NEXT_REDIRECT',
      )

      expect(mockCookiesInstance.set).toHaveBeenCalledWith(
        'command',
        expect.stringContaining('not correct'),
        expect.any(Object),
      )
    })

    it('should update password on success', async () => {
      ;(userDb.get as jest.Mock).mockResolvedValue({ password: 'hashed' })
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)
      ;(bcrypt.hash as jest.Mock).mockResolvedValue('newhash')
      ;(userDb.update as jest.Mock).mockResolvedValue(true)

      const formData = createFormData({
        oldPw: 'a',
        newPw: 'b',
        newPwConfirm: 'b',
      })

      await expect(updatePasswordServerAction(formData)).rejects.toThrow(
        'NEXT_REDIRECT',
      )

      expect(mockCookiesInstance.set).toHaveBeenCalledWith(
        'command',
        'passwordChanged',
        expect.any(Object),
      )
    })
  })

  describe('updateUsernameServerAction', () => {
    it('should set error if same name', async () => {
      jest.clearAllMocks() // ✨ Reset!
      ;(utils.getUserAttrFromToken as jest.Mock).mockResolvedValue('oldname')
      ;(userDb.get as jest.Mock).mockResolvedValue({ name: 'oldname' })

      const formData = createFormData({ username: 'oldname' })

      await expect(updateUsernameServerAction(formData)).rejects.toThrow(
        'NEXT_REDIRECT',
      )

      expect(mockCookiesInstance.set).toHaveBeenCalledWith(
        'command',
        expect.stringContaining('new name'),
        expect.any(Object),
      )
    })

    it('should set error if name already taken', async () => {
      jest.clearAllMocks() // ✨ Reset!
      ;(utils.getUserAttrFromToken as jest.Mock).mockResolvedValue('oldname')
      ;(userDb.get as jest.Mock)
        .mockResolvedValueOnce({ name: 'newtaken' })
        .mockResolvedValueOnce({ name: 'oldname' })

      const formData = createFormData({ username: 'newtaken' })

      await expect(updateUsernameServerAction(formData)).rejects.toThrow(
        'NEXT_REDIRECT',
      )

      expect(mockCookiesInstance.set).toHaveBeenCalledWith(
        'command',
        expect.stringContaining('taken'),
        expect.any(Object),
      )
    })

    it('should update username and token on success', async () => {
      // ✨ Reset userDb.get komplett!
      ;(userDb.get as jest.Mock).mockReset()
      ;(utils.getUserAttrFromToken as jest.Mock).mockResolvedValue('oldname')
      ;(userDb.get as jest.Mock)
        .mockResolvedValueOnce(null) // 1st: check newname
        .mockResolvedValueOnce({ id: 1, name: 'oldname' }) // 2nd: get user
      ;(userDb.update as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'newname',
      })
      ;(utils.getJwt as jest.Mock).mockResolvedValue('newtoken')

      const formData = createFormData({ username: 'newname' })

      await expect(updateUsernameServerAction(formData)).rejects.toThrow(
        'NEXT_REDIRECT',
      )

      console.log('userDb.get calls:', (userDb.get as jest.Mock).mock.calls)

      expect(mockCookiesInstance.set).toHaveBeenCalledTimes(2)
    })
  })

  describe('deleteUserServerAction', () => {
    beforeEach(() => {
      ;(utils.getUserAttrFromToken as jest.Mock).mockResolvedValue('username')
    })

    it('should set error if user not found', async () => {
      ;(userDb.get as jest.Mock).mockResolvedValue(null)

      const formData = createFormData({ password: 'pw' })

      await expect(deleteUserServerAction(formData)).rejects.toThrow(
        'NEXT_REDIRECT',
      )

      expect(mockCookiesInstance.set).toHaveBeenCalledWith(
        'command',
        expect.stringContaining('not found'),
        expect.any(Object),
      )
    })

    it('should set error if password incorrect', async () => {
      ;(userDb.get as jest.Mock).mockResolvedValue({ password: 'hashed' })
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

      const formData = createFormData({ password: 'pw' })

      await expect(deleteUserServerAction(formData)).rejects.toThrow(
        'NEXT_REDIRECT',
      )

      expect(mockCookiesInstance.set).toHaveBeenCalledWith(
        'command',
        expect.stringContaining('incorrect'),
        expect.any(Object),
      )
    })

    it('should delete user and redirect on success', async () => {
      ;(userDb.get as jest.Mock).mockResolvedValue({ password: 'hashed' })
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)
      ;(userDb.remove as jest.Mock).mockResolvedValue(true)

      const formData = createFormData({ password: 'pw' })

      await expect(deleteUserServerAction(formData)).rejects.toThrow(
        'NEXT_REDIRECT',
      )

      expect(mockCookiesInstance.set).toHaveBeenCalledWith(
        'command',
        'userdeleted',
        expect.any(Object),
      )
    })
  })
})
