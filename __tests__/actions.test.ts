import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import * as bcrypt from 'bcrypt'
import * as userDb from '../db/user'
import * as metronomeDb from '../db/metronome'
import * as utils from '../app/api/util'
import {
  signupServerAction,
  loginServerAction,
  logoutServerAction,
  createMetronomeAction,
  deleteMetronomeAction,
  updateServerAction,
  updatePasswordServerAction,
  updateUsernameServerAction,
  deleteUserServerAction,
} from '../app/actions'


jest.mock('next/headers', () => ({ cookies: jest.fn() }))
jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }))
jest.mock('next/navigation', () => ({ redirect: jest.fn() }))
jest.mock('bcrypt')
jest.mock('../db/user')
jest.mock('../db/metronome')
jest.mock('../app/api/util')

describe('actions.ts', () => {
  const formData = (data: Record<string, string>) =>
    Object.entries(data).reduce((fd, [k, v]) => {
      fd.append(k, v)
      return fd
    }, new FormData())

  beforeEach(() => {
    jest.clearAllMocks()
    ;(cookies as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue({ value: 'token' }),
      set: jest.fn(),
      delete: jest.fn(),
    })
  })

  test('signupServerAction rejects if passwords do not match', async () => {
    const fd = formData({
      name: 'user',
      password: '123',
      passwordRepeat: '321',
      email: 'u@e.de',
    })
    const result = await signupServerAction({}, fd)
    expect(result.message).toMatch(/Passwords don't match/)
  })

  test('signupServerAction returns error if user exists', async () => {
    ;(userDb.get as jest.Mock).mockResolvedValue({ id: 1 })
    const fd = formData({
      name: 'user',
      password: '123',
      passwordRepeat: '123',
    })
    const result = await signupServerAction({}, fd)
    expect(result.message).toMatch(/User already exists/)
  })

  test('signupServerAction creates user if valid', async () => {
    ;(userDb.get as jest.Mock).mockResolvedValue(null)
    ;(bcrypt.hash as jest.Mock).mockResolvedValue('hashed')
    ;(userDb.create as jest.Mock).mockResolvedValue({ id: 1, name: 'user' })
    ;(utils.getJwt as jest.Mock).mockResolvedValue('token')
    const fd = formData({
      name: 'user',
      password: '123',
      passwordRepeat: '123',
    })
    await signupServerAction({}, fd)
    expect(userDb.create).toHaveBeenCalled()
    expect(utils.getJwt).toHaveBeenCalled()
    expect(redirect).toHaveBeenCalled()
  })

  test('loginServerAction rejects if user not found', async () => {
    ;(userDb.get as jest.Mock).mockResolvedValue(null)
    const fd = formData({ name: 'u', password: 'p' })
    const res = await loginServerAction({}, fd)
    expect(res.message).toMatch(/User not found/)
  })

  test('loginServerAction rejects if password wrong', async () => {
    ;(userDb.get as jest.Mock).mockResolvedValue({ id: 1, password: 'x' })
    ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)
    const fd = formData({ name: 'u', password: 'p' })
    const res = await loginServerAction({}, fd)
    expect(res.message).toMatch(/Credentials wrong/)
  })

    test('loginServerAction rejects if name or password missing', async () => {
    const fd = formData({ name: '', password: '' })
    const res = await loginServerAction({}, fd)
    expect(res.message).toMatch(/missing/)
  })

  test('loginServerAction rejects if user not found', async () => {
    ;(userDb.get as jest.Mock).mockResolvedValue(null)
    const fd = formData({ name: 'u', password: 'p' })
    const res = await loginServerAction({}, fd)
    expect(res.message).toMatch(/User not found/)
  })

  test('loginServerAction rejects if password wrong', async () => {
    ;(userDb.get as jest.Mock).mockResolvedValue({ id: 1, password: 'x' })
    ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)
    const fd = formData({ name: 'u', password: 'p' })
    const res = await loginServerAction({}, fd)
    expect(res.message).toMatch(/Credentials wrong/)
  })

  test('loginServerAction redirects if valid', async () => {
    ;(userDb.get as jest.Mock).mockResolvedValue({ id: 1, name: 'user', password: 'x' })
    ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)
    ;(utils.getJwt as jest.Mock).mockResolvedValue('token')
    const fd = formData({ name: 'u', password: 'p' })
    await loginServerAction({}, fd)
    expect(cookies().set).toHaveBeenCalled()
    expect(revalidatePath).toHaveBeenCalled()
    expect(redirect).toHaveBeenCalled()
  })

  // ----------------------------
  // logoutServerAction
  // ----------------------------
  test('logoutServerAction sets expired token and redirects', async () => {
    await logoutServerAction()
    expect(cookies().set).toHaveBeenCalled()
    expect(revalidatePath).toHaveBeenCalledWith('/')
    expect(redirect).toHaveBeenCalledWith('/')
  })

  // ----------------------------
  // createMetronomeAction
  // ----------------------------
  test('createMetronomeAction redirects if savedMetronome exists', async () => {
    ;(utils.getUserAttrFromToken as jest.Mock).mockResolvedValue(1)
    ;(metronomeDb.create as jest.Mock).mockResolvedValue({ id: 10 })
    await createMetronomeAction({ bpm: 120 } as any)
    expect(cookies().set).toHaveBeenCalled()
    expect(redirect).toHaveBeenCalledWith('/metronome/10')
  })

  test('createMetronomeAction returns message if failed', async () => {
    ;(utils.getUserAttrFromToken as jest.Mock).mockResolvedValue(1)
    ;(metronomeDb.create as jest.Mock).mockResolvedValue(null)
    const res = await createMetronomeAction({ bpm: 120 } as any)
    expect(res.message).toMatch(/Something went wrong/)
  })

  // ----------------------------
  // deleteMetronomeAction
  // ----------------------------
  test('deleteMetronomeAction returns not found if metronome missing', async () => {
    ;(metronomeDb.get as jest.Mock).mockResolvedValue(null)
    const res = await deleteMetronomeAction(1, '/target')
    expect(res.message).toMatch(/not found/)
  })

  test('deleteMetronomeAction returns unauthorized if user not owner', async () => {
    ;(utils.getUserAttrFromToken as jest.Mock).mockResolvedValue(99)
    ;(metronomeDb.get as jest.Mock).mockResolvedValue({ owner: 1 })
    const res = await deleteMetronomeAction(1, '/target')
    expect(res.message).toMatch(/not allowed/)
  })

  test('deleteMetronomeAction deletes and redirects if success', async () => {
    ;(utils.getUserAttrFromToken as jest.Mock).mockResolvedValue(1)
    ;(metronomeDb.get as jest.Mock).mockResolvedValue({ owner: 1 })
    ;(metronomeDb.deleteMetronome as jest.Mock).mockResolvedValue(true)
    await deleteMetronomeAction(1, '/target')
    expect(cookies().set).toHaveBeenCalled()
    expect(revalidatePath).toHaveBeenCalledWith('/target')
    expect(redirect).toHaveBeenCalledWith('/target')
  })

  // ----------------------------
  // updateServerAction
  // ----------------------------
  test('updateServerAction returns not found', async () => {
    ;(metronomeDb.get as jest.Mock).mockResolvedValue(null)
    const res = await updateServerAction({ id: 1 } as any)
    expect(res.messagen).toBeDefined()
  })

  test('updateServerAction unauthorized user', async () => {
    ;(utils.getUserAttrFromToken as jest.Mock).mockResolvedValue(5)
    ;(metronomeDb.get as jest.Mock).mockResolvedValue({ owner: 1 })
    const res = await updateServerAction({ id: 1 } as any)
    expect(res.message).toMatch(/not allowed/)
  })

  test('updateServerAction updates successfully', async () => {
    ;(utils.getUserAttrFromToken as jest.Mock).mockResolvedValue(1)
    ;(metronomeDb.get as jest.Mock).mockResolvedValue({ owner: 1 })
    ;(metronomeDb.updateMetronome as jest.Mock).mockResolvedValue(true)
    const res = await updateServerAction({ id: 1 } as any)
    expect(revalidatePath).toHaveBeenCalledWith('/', 'layout')
    expect(res.message).toMatch(/updated/)
  })

  // ----------------------------
  // updatePasswordServerAction
  // ----------------------------
  test('updatePasswordServerAction mismatched new passwords', async () => {
    const fd = formData({ oldPw: '1', newPw: '2', newPwConfirm: '3' })
    const res = await updatePasswordServerAction({}, fd)
    expect(res.message).toMatch(/don't match/)
  })

  test('updatePasswordServerAction incorrect old password', async () => {
    ;(utils.getUserAttrFromToken as jest.Mock).mockResolvedValue('user')
    ;(userDb.get as jest.Mock).mockResolvedValue({ password: 'hashed' })
    ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)
    const fd = formData({ oldPw: 'x', newPw: 'y', newPwConfirm: 'y' })
    const res = await updatePasswordServerAction({}, fd)
    expect(res.message).toMatch(/Old password not correct/)
  })

  test('updatePasswordServerAction success path', async () => {
    ;(utils.getUserAttrFromToken as jest.Mock).mockResolvedValue('user')
    ;(userDb.get as jest.Mock).mockResolvedValue({ password: 'hashed' })
    ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)
    ;(bcrypt.hash as jest.Mock).mockResolvedValue('newhash')
    await updatePasswordServerAction({}, formData({ oldPw: 'a', newPw: 'b', newPwConfirm: 'b' }))
    expect(revalidatePath).toHaveBeenCalledWith('/account')
    expect(redirect).toHaveBeenCalledWith('/account')
  })

  // ----------------------------
  // updateUsernameServerAction
  // ----------------------------
  test('updateUsernameServerAction rejects same name', async () => {
    ;(utils.getUserAttrFromToken as jest.Mock).mockResolvedValue('Name')
    const fd = formData({ username: 'name' })
    const res = await updateUsernameServerAction({}, fd)
    expect(res.message).toMatch(/pick a new name/)
  })

  test('updateUsernameServerAction rejects if name taken', async () => {
    ;(utils.getUserAttrFromToken as jest.Mock).mockResolvedValue('old')
    ;(userDb.get as jest.Mock).mockResolvedValueOnce(true)
    const fd = formData({ username: 'new' })
    const res = await updateUsernameServerAction({}, fd)
    expect(res.message).toMatch(/already taken/)
  })

  test('updateUsernameServerAction success updates token and redirects', async () => {
    ;(utils.getUserAttrFromToken as jest.Mock).mockResolvedValue('old')
    ;(userDb.get as jest.Mock)
      .mockResolvedValueOnce(null) // name not taken
      .mockResolvedValueOnce({ name: 'old', id: 1 })
    ;(userDb.update as jest.Mock).mockResolvedValue({ id: 1, name: 'new' })
    ;(utils.getJwt as jest.Mock).mockResolvedValue('newtoken')
    const fd = formData({ username: 'new' })
    await updateUsernameServerAction({}, fd)
    expect(revalidatePath).toHaveBeenCalledWith('/account')
    expect(cookies().set).toHaveBeenCalled()
    expect(redirect).toHaveBeenCalledWith('/account')
  })

  // ----------------------------
  // deleteUserServerAction
  // ----------------------------
  test('deleteUserServerAction fails if user not found', async () => {
    ;(userDb.get as jest.Mock).mockResolvedValue(null)
    const res = await deleteUserServerAction({}, formData({ password: 'pw' }))
    expect(res.message).toMatch(/not found/)
  })

  test('deleteUserServerAction fails if password incorrect', async () => {
    ;(userDb.get as jest.Mock).mockResolvedValue({ password: 'hashed' })
    ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)
    const res = await deleteUserServerAction({}, formData({ password: 'pw' }))
    expect(res.message).toMatch(/incorrect/)
  })

  test('deleteUserServerAction success deletes and redirects', async () => {
    ;(userDb.get as jest.Mock).mockResolvedValue({ password: 'hashed' })
    ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)
    ;(userDb.remove as jest.Mock).mockResolvedValue(true)
    await deleteUserServerAction({}, formData({ password: 'pw' }))
    expect(cookies().set).toHaveBeenCalled()
    expect(revalidatePath).toHaveBeenCalled()
    expect(redirect).toHaveBeenCalledWith('/metronome/new')
  })

})
