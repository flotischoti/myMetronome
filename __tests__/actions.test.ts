/**
 * @jest-environment node
 */
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import * as bcrypt from 'bcrypt'
import * as utils from '../lib/jwt'
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
import { isEmailValid, sendPasswordResetEmail } from '../lib/mail'
import {
  requestPasswordResetAction,
  confirmPasswordResetAction,
} from '../app/actions/actions'

// ========================================
// MOCKS
// ========================================
jest.mock('next/headers', () => ({ cookies: jest.fn() }))
jest.mock('next/navigation', () => ({ redirect: jest.fn() }))
jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }))
jest.mock('bcrypt')
jest.mock('../lib/utils')
jest.mock('../lib/jwt')
jest.mock('../lib/mail')
jest.mock('../db/metronome')
jest.mock('../db/user')

const mockSendEmail = sendPasswordResetEmail as jest.MockedFunction<
  typeof sendPasswordResetEmail
>
const mockIsEmailValid = isEmailValid as jest.MockedFunction<
  typeof isEmailValid
>
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

// ✅ Helper to match command with timestamp
const expectCommandWithTimestamp = (command: string) => {
  return expect.stringMatching(new RegExp(`^${command}:\\d+$`))
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
      const error: any = new Error('NEXT_REDIRECT')
      error.digest = `NEXT_REDIRECT;replace;${url};307`
      throw error
    })
  })

  // ========================================
  // SIGNUP TESTS
  // ========================================
  describe('signupServerAction', () => {
    it('should set error and redirect if user already exists', async () => {
      ;(userDb.get as jest.Mock).mockResolvedValue({ id: 1, name: 'user' })

      const formData = createFormData({
        name: 'user',
        password: 'pass',
        passwordRepeat: 'pass',
        currentPath: '/register',
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
      const formData = createFormData({
        name: '',
        password: '',
        currentPath: '/login',
        target: '',
      })

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
        currentPath: '/login',
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
        currentPath: '/login',
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

      // Check for command with timestamp
      expect(mockCookiesInstance.set).toHaveBeenCalledWith(
        'command',
        expectCommandWithTimestamp('created'),
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

      // Check for command with timestamp
      expect(mockCookiesInstance.set).toHaveBeenCalledWith(
        'command',
        expectCommandWithTimestamp('deleted'),
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

      // Check for command with timestamp
      expect(mockCookiesInstance.set).toHaveBeenCalledWith(
        'command',
        expectCommandWithTimestamp('passwordChanged'),
        expect.any(Object),
      )
    })
  })

  describe('updateUsernameServerAction', () => {
    it('should set error if same name', async () => {
      jest.clearAllMocks()
      ;(utils.getUserAttrFromToken as jest.Mock).mockResolvedValue('oldname')
      ;(userDb.get as jest.Mock).mockResolvedValue({ name: 'oldname' })

      const formData = createFormData({ username: 'oldname' })

      await expect(updateUsernameServerAction(formData)).rejects.toThrow(
        'NEXT_REDIRECT',
      )

      expect(mockCookiesInstance.set).toHaveBeenCalledWith(
        'command',
        expect.stringContaining('new value'),
        expect.any(Object),
      )
    })

    it('should set error if name already taken', async () => {
      jest.clearAllMocks()
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

      // One call for token, one for command with timestamp
      expect(mockCookiesInstance.set).toHaveBeenCalledTimes(2)
      expect(mockCookiesInstance.set).toHaveBeenCalledWith(
        'command',
        expectCommandWithTimestamp('usernameChanged'),
        expect.any(Object),
      )
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

      // Two calls: one for token deletion, one for command
      expect(mockCookiesInstance.set).toHaveBeenCalledTimes(2)
      expect(mockCookiesInstance.set).toHaveBeenCalledWith(
        'command',
        expectCommandWithTimestamp('userdeleted'),
        expect.any(Object),
      )
    })
  })
})

describe('Password Reset Actions', () => {
  let mockCookiesInstance: any

  beforeEach(() => {
    jest.clearAllMocks()

    mockCookiesInstance = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
    }

    mockCookies.mockReturnValue(mockCookiesInstance)

    mockRedirect.mockImplementation((url: string) => {
      const error: any = new Error('NEXT_REDIRECT')
      error.digest = `NEXT_REDIRECT;replace;${url};307`
      throw error
    })

    mockIsEmailValid.mockReturnValue(true)
  })

  describe('requestPasswordResetAction', () => {
    it('should set error and redirect if email is missing', async () => {
      const formData = createFormData({ email: '' })

      await expect(requestPasswordResetAction(formData)).rejects.toThrow(
        'NEXT_REDIRECT',
      )

      expect(mockCookiesInstance.set).toHaveBeenCalledWith(
        'command',
        expect.stringContaining('Email required'),
        expect.any(Object),
      )
      expect(mockRedirect).toHaveBeenCalledWith('/reset-password')
    })

    it('should set error and redirect if email is invalid', async () => {
      mockIsEmailValid.mockReturnValue(false)

      const formData = createFormData({ email: 'invalid-email' })

      await expect(requestPasswordResetAction(formData)).rejects.toThrow(
        'NEXT_REDIRECT',
      )

      expect(mockIsEmailValid).toHaveBeenCalledWith('invalid-email')
      expect(mockCookiesInstance.set).toHaveBeenCalledWith(
        'command',
        expect.stringContaining('Email invalid'),
        expect.any(Object),
      )
      expect(mockRedirect).toHaveBeenCalledWith('/reset-password')
    })

    it('should show success message even if user not found (security)', async () => {
      ;(userDb.getByMail as jest.Mock).mockResolvedValue(null)

      const formData = createFormData({ email: 'nonexistent@example.com' })

      await expect(requestPasswordResetAction(formData)).rejects.toThrow(
        'NEXT_REDIRECT',
      )

      expect(mockCookiesInstance.set).toHaveBeenCalledWith(
        'command',
        expect.stringMatching(/^resetEmailSent:\d+$/),
        expect.any(Object),
      )
      expect(mockRedirect).toHaveBeenCalledWith('/login')
    })

    it('should send reset email successfully', async () => {
      const mockUser = { id: 1, name: 'testuser', email: 'test@example.com' }
      ;(userDb.getByMail as jest.Mock).mockResolvedValue(mockUser)
      ;(utils.getJwt as jest.Mock).mockResolvedValue('reset-token-123')
      mockSendEmail.mockResolvedValue({ success: true })

      const formData = createFormData({ email: 'test@example.com' })

      await expect(requestPasswordResetAction(formData)).rejects.toThrow(
        'NEXT_REDIRECT',
      )

      expect(utils.getJwt).toHaveBeenCalledWith(
        {
          userId: 1,
          name: 'testuser',
          email: 'test@example.com',
        },
        '1h',
      )
      expect(mockSendEmail).toHaveBeenCalledWith(
        'test@example.com',
        'reset-token-123',
      )
      expect(mockCookiesInstance.set).toHaveBeenCalledWith(
        'command',
        expect.stringMatching(/^resetEmailSent:\d+$/),
        expect.any(Object),
      )
      expect(mockRedirect).toHaveBeenCalledWith('/login')
    })

    it('should handle email send failure', async () => {
      const mockUser = { id: 1, name: 'testuser', email: 'test@example.com' }
      ;(userDb.getByMail as jest.Mock).mockResolvedValue(mockUser)
      ;(utils.getJwt as jest.Mock).mockResolvedValue('reset-token-123')
      mockSendEmail.mockResolvedValue({
        success: false,
        error: 'SMTP error',
      })

      const formData = createFormData({ email: 'test@example.com' })

      await expect(requestPasswordResetAction(formData)).rejects.toThrow(
        'NEXT_REDIRECT',
      )

      expect(mockCookiesInstance.set).toHaveBeenCalledWith(
        'command',
        expect.stringContaining('Mail dispatch failed'),
        expect.any(Object),
      )
      expect(mockRedirect).toHaveBeenCalledWith('/reset-password')
    })

    it('should handle unexpected errors', async () => {
      ;(userDb.getByMail as jest.Mock).mockRejectedValue(
        new Error('Database error'),
      )

      const formData = createFormData({ email: 'test@example.com' })

      await expect(requestPasswordResetAction(formData)).rejects.toThrow(
        'NEXT_REDIRECT',
      )

      expect(mockCookiesInstance.set).toHaveBeenCalledWith(
        'command',
        expect.stringContaining('Something went wrong'),
        expect.any(Object),
      )
      expect(mockRedirect).toHaveBeenCalledWith('/reset-password')
    })
  })

  describe('confirmPasswordResetAction', () => {
    it('should set error if token is missing', async () => {
      const formData = createFormData({
        token: '',
        password: 'newpassword123',
      })

      await expect(confirmPasswordResetAction(formData)).rejects.toThrow(
        'NEXT_REDIRECT',
      )

      expect(mockCookiesInstance.set).toHaveBeenCalledWith(
        'command',
        expect.stringContaining('Password required'),
        expect.any(Object),
      )
    })

    it('should set error if password is missing', async () => {
      const formData = createFormData({
        token: 'valid-token',
        password: '',
      })

      await expect(confirmPasswordResetAction(formData)).rejects.toThrow(
        'NEXT_REDIRECT',
      )

      expect(mockCookiesInstance.set).toHaveBeenCalledWith(
        'command',
        expect.stringContaining('Password required'),
        expect.any(Object),
      )
    })

    it('should set error if token is invalid', async () => {
      ;(utils.decodeToken as jest.Mock).mockResolvedValue(null)

      const formData = createFormData({
        token: 'invalid-token',
        password: 'newpassword123',
      })

      await expect(confirmPasswordResetAction(formData)).rejects.toThrow(
        'NEXT_REDIRECT',
      )

      expect(mockCookiesInstance.set).toHaveBeenCalledWith(
        'command',
        expect.stringContaining('Invalid or expired'),
        expect.any(Object),
      )
      expect(mockRedirect).toHaveBeenCalledWith('/login')
    })

    it('should set error if user not found', async () => {
      ;(utils.decodeToken as jest.Mock).mockResolvedValue({
        userId: 1,
        name: 'testuser',
        email: 'test@example.com',
      })
      ;(userDb.get as jest.Mock).mockResolvedValue(null)

      const formData = createFormData({
        token: 'valid-token',
        password: 'newpassword123',
      })

      await expect(confirmPasswordResetAction(formData)).rejects.toThrow(
        'NEXT_REDIRECT',
      )

      expect(mockCookiesInstance.set).toHaveBeenCalledWith(
        'command',
        expect.stringContaining('User not found'),
        expect.any(Object),
      )
      expect(mockRedirect).toHaveBeenCalledWith('/login')
    })

    it('should set error if email mismatch', async () => {
      ;(utils.decodeToken as jest.Mock).mockResolvedValue({
        userId: 1,
        name: 'testuser',
        email: 'test@example.com',
      })
      ;(userDb.get as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'testuser',
        email: 'different@example.com',
      })

      const formData = createFormData({
        token: 'valid-token',
        password: 'newpassword123',
      })

      await expect(confirmPasswordResetAction(formData)).rejects.toThrow(
        'NEXT_REDIRECT',
      )

      expect(mockCookiesInstance.set).toHaveBeenCalledWith(
        'command',
        expect.stringContaining('Invalid reset link'),
        expect.any(Object),
      )
      expect(mockRedirect).toHaveBeenCalledWith('/login')
    })

    it('should reset password successfully', async () => {
      const mockUser = {
        id: 1,
        name: 'testuser',
        email: 'test@example.com',
        password: 'oldhash',
      }

      ;(utils.decodeToken as jest.Mock).mockResolvedValue({
        userId: 1,
        name: 'testuser',
        email: 'test@example.com',
      })
      ;(userDb.get as jest.Mock).mockResolvedValue(mockUser)
      ;(bcrypt.hash as jest.Mock).mockResolvedValue('newhash')
      ;(userDb.update as jest.Mock).mockResolvedValue(true)

      const formData = createFormData({
        token: 'valid-token',
        password: 'newpassword123',
      })

      await expect(confirmPasswordResetAction(formData)).rejects.toThrow(
        'NEXT_REDIRECT',
      )

      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword123', 10)
      expect(userDb.update).toHaveBeenCalledWith({
        ...mockUser,
        password: 'newhash',
      })

      // Check token cookie was cleared
      expect(mockCookiesInstance.set).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'token',
          value: '',
          expires: new Date(0),
        }),
      )

      // Check success command
      expect(mockCookiesInstance.set).toHaveBeenCalledWith(
        'command',
        expect.stringMatching(/^passwordChanged:\d+$/),
        expect.any(Object),
      )
      expect(mockRedirect).toHaveBeenCalledWith('/login')
    })

    it('should handle unexpected errors', async () => {
      ;(utils.decodeToken as jest.Mock).mockRejectedValue(
        new Error('JWT error'),
      )

      const formData = createFormData({
        token: 'valid-token',
        password: 'newpassword123',
      })

      await expect(confirmPasswordResetAction(formData)).rejects.toThrow(
        'NEXT_REDIRECT',
      )

      expect(mockCookiesInstance.set).toHaveBeenCalledWith(
        'command',
        expect.stringContaining('Password reset failed'),
        expect.any(Object),
      )
      expect(mockRedirect).toHaveBeenCalledWith('/reset-password')
    })
  })
})
