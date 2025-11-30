'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import * as bcrypt from 'bcrypt'
import { getUserAttrFromToken } from '../api/util'
import * as metronomeDb from '../../db/metronome'
import { StoredMetronome } from '../../components/metronome/Metronome'
import * as userDb from '../../db/user'
import * as utils from '../api/util'
import { setCommand, setErrorCommand, isRedirectError } from './commandHelper'

// ========================================
// AUTH ACTIONS
// ========================================

export async function signupServerAction(formData: FormData) {
  const { name, password, passwordRepeat, email, target, currentPath } = {
    name: formData.get('name')?.toString(),
    password: formData.get('password')?.toString(),
    passwordRepeat: formData.get('passwordRepeat')?.toString(),
    email: formData.get('email')?.toString(),
    target: formData.get('target')?.toString(),
    currentPath: formData.get('currentPath')?.toString(),
  }

  if (!name || !password) {
    setErrorCommand('Password or name missing')
    redirect(currentPath!)
  }

  if (password !== passwordRepeat) {
    setErrorCommand(`Passwords don't match`)
    redirect(currentPath!)
  }

  const oldUser = await userDb.get(name)
  if (oldUser) {
    setErrorCommand('User already exists')
    redirect(currentPath!)
  }

  try {
    const encryptedPw = await bcrypt.hash(password, 10)
    const user: userDb.User = await userDb.create({
      name,
      password: encryptedPw,
      email: undefined,
    })

    user.token = await utils.getJwt({ userId: user.id!, name })

    cookies().set({
      name: 'token',
      value: user.token!,
      path: '/',
      secure: true,
      httpOnly: true,
      sameSite: 'lax',
    })

    revalidatePath('/')
    redirect(target || '/metronome/new')
  } catch (error) {
    if (isRedirectError(error)) throw error

    console.error('Signup error:', error)
    setErrorCommand('Failed to create account')
    redirect(target || '/register')
  }
}

export async function loginServerAction(payload: FormData) {
  const { name, password, target, currentPath } = {
    name: payload.get('name')?.toString(),
    password: payload.get('password')?.toString(),
    target: payload.get('target')?.toString(),
    currentPath: payload.get('currentPath')?.toString(),
  }

  if (!name || !password) {
    setErrorCommand('Password or name missing')
    redirect(currentPath!)
  }

  const user = await userDb.get(name)
  if (!user) {
    setErrorCommand('User not found')
    redirect(currentPath!)
  }

  if (!(await bcrypt.compare(password, user.password))) {
    setErrorCommand('Credentials wrong')
    redirect(currentPath!)
  }

  try {
    user.token = await utils.getJwt({ userId: user.id!, name })
    cookies().set({
      name: 'token',
      value: user.token!,
      path: '/',
      secure: true,
      httpOnly: true,
      sameSite: 'lax',
    })

    revalidatePath('/')
    revalidatePath('/metronome/')
    revalidatePath('/metronome/recent')
    if (target) revalidatePath(target)

    redirect(target || '/metronome/recent')
  } catch (error) {
    if (isRedirectError(error)) throw error

    console.error('Login error:', error)
    setErrorCommand('Login failed')
    redirect(target || '/login')
  }
}

export async function logoutServerAction() {
  cookies().set({
    name: 'token',
    value: 'abc',
    path: '/',
    secure: true,
    httpOnly: true,
    sameSite: 'lax',
    expires: 0,
  })
  revalidatePath('/')
  redirect('/')
}

// ========================================
// METRONOME ACTIONS
// ========================================

export async function createMetronomeAction(metronome: StoredMetronome) {
  try {
    const token = cookies().get('token')?.value
    if (!token) {
      setCommand('unauthorized')
      redirect('/login')
    }

    const userId = await getUserAttrFromToken(token!)
    if (!userId) {
      setCommand('unauthorized')
      redirect('/login')
    }

    const savedMetronome = await metronomeDb.create(metronome, userId)

    if (!savedMetronome) {
      setErrorCommand('Failed to create metronome')
      redirect('/metronome/new')
    }

    setCommand('created')
    redirect(`/metronome/${savedMetronome.id}`)
  } catch (error) {
    if (isRedirectError(error)) throw error

    console.error('Create metronome error:', error)
    setErrorCommand('Something went wrong')
    redirect('/metronome/new')
  }
}

export async function deleteMetronomeAction(
  metronomeId: number,
  targetPath: string,
) {
  try {
    const token = cookies().get('token')?.value
    if (!token) {
      setCommand('unauthorized')
      redirect('/login')
    }

    const userId = await getUserAttrFromToken(token!)
    if (!userId) {
      setCommand('unauthorized')
      redirect('/login')
    }

    const metronome = await metronomeDb.get(Number(metronomeId))

    if (!metronome) {
      setErrorCommand(
        `Delete metronome failed. Metronome ${metronomeId} not found`,
      )
      redirect(targetPath)
    }

    if (metronome!.owner !== userId) {
      setErrorCommand(
        `Delete metronome failed. User ${userId} not allowed to delete metronome ${metronomeId}`,
      )
      redirect(targetPath)
    }

    const success = await metronomeDb.deleteMetronome(Number(metronomeId))

    if (success) {
      setCommand('deleted')
      revalidatePath(targetPath)
      redirect(targetPath)
    }

    setErrorCommand('Error deleting metronome')
    redirect(targetPath)
  } catch (error) {
    if (isRedirectError(error)) throw error

    console.error('Delete metronome error:', error)
    setErrorCommand('Error deleting metronome')
    redirect(targetPath)
  }
}

export async function updateServerAction(newMetronome: StoredMetronome) {
  const token = cookies().get('token')?.value
  if (!token) {
    throw new Error('Unauthorized')
  }

  const userId = await getUserAttrFromToken(token)
  if (!userId) {
    throw new Error('Unauthorized')
  }

  const metronome = await metronomeDb.get(newMetronome.id!)

  if (!metronome) {
    throw new Error(
      `PUT metronome failed. The metronome ${newMetronome.id} to be updated was not found`,
    )
  }

  if (metronome.owner !== userId) {
    throw new Error(
      `PUT metronome failed. User ${userId} not allowed to write metronome ${newMetronome.id}`,
    )
  }

  await metronomeDb.updateMetronome(newMetronome)
  revalidatePath('/', 'layout')
}

// ========================================
// USER ACTIONS
// ========================================

export async function updatePasswordServerAction(data: FormData) {
  try {
    const token = cookies().get('token')?.value
    if (!token) {
      setCommand('unauthorized')
      redirect('/login')
    }

    const userName = await getUserAttrFromToken<string>(token, 'name')
    if (!userName) {
      setCommand('unauthorized')
      redirect('/login')
    }

    const oldPw = data.get('oldPw')!.toString()
    const newPw = data.get('newPw')!.toString()
    const newPwConfirm = data.get('newPwConfirm')!.toString()

    if (newPw !== newPwConfirm) {
      setErrorCommand(`New passwords don't match`)
      redirect('/account/edit/password')
    }

    const user = await userDb.get(userName)
    if (!user) {
      setErrorCommand('User not found')
      redirect('/account/edit/password')
    }

    if (!(await bcrypt.compare(oldPw, user.password))) {
      setErrorCommand('Old password not correct')
      redirect('/account/edit/password')
    }

    const encryptedPw = await bcrypt.hash(newPw, 10)
    user.password = encryptedPw

    await userDb.update(user)

    setCommand('passwordChanged')
    revalidatePath('/account')
    redirect('/account')
  } catch (error) {
    if (isRedirectError(error)) throw error

    console.error('Update password error:', error)
    setErrorCommand('Changing password failed')
    redirect('/account')
  }
}

export async function updateUsernameServerAction(data: FormData) {
  try {
    const token = cookies().get('token')?.value
    if (!token) {
      setCommand('unauthorized')
      redirect('/login')
    }

    const userName = await getUserAttrFromToken<string>(token, 'name')
    if (!userName) {
      setCommand('unauthorized')
      redirect('/login')
    }

    const newUsername = data.get('username')!.toString()

    if (userName.toLowerCase() === newUsername.toLowerCase()) {
      setErrorCommand('Please pick a new name')
      redirect('/account/edit/username')
    }

    if (await userDb.get(newUsername)) {
      setErrorCommand('This name is already taken')
      redirect('/account/edit/username')
    }

    const user = await userDb.get(userName)
    if (!user) {
      setErrorCommand('User not found')
      redirect('/account/edit/username')
    }

    user.name = newUsername
    const updatedUser = await userDb.update(user)

    if (updatedUser && updatedUser.name === newUsername) {
      const newToken = await utils.getJwt({
        userId: updatedUser.id!,
        name: updatedUser.name,
      })

      cookies().set({
        name: 'token',
        value: newToken,
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        secure: true,
      })

      setCommand('usernameChanged')
      revalidatePath('/account')
      redirect('/account')
    }

    setErrorCommand('Changing username failed')
    redirect('/account')
  } catch (error) {
    if (isRedirectError(error)) throw error

    console.error('Update username error:', error)
    setErrorCommand('Changing username failed')
    redirect('/account')
  }
}

export async function deleteUserServerAction(data: FormData) {
  try {
    const token = cookies().get('token')?.value
    if (!token) {
      setCommand('unauthorized')
      redirect('/login')
    }

    const userName = await getUserAttrFromToken<string>(token, 'name')
    if (!userName) {
      setCommand('unauthorized')
      redirect('/login')
    }

    const oldPw = data.get('password')!.toString()
    const user = await userDb.get(userName)

    if (!user) {
      setErrorCommand('User not found')
      redirect('/account/delete')
    }

    if (!(await bcrypt.compare(oldPw, user.password))) {
      setErrorCommand('Password incorrect')
      redirect('/account/delete')
    }

    await userDb.remove(user)

    cookies().set({
      name: 'token',
      value: 'abc',
      secure: true,
      httpOnly: true,
      sameSite: 'lax',
      expires: new Date('January 01, 1970 00:00:00 GMT'),
    })

    setCommand('userdeleted')

    revalidatePath('/')
    revalidatePath('/account')
    revalidatePath('/metronome/new')
    redirect('/metronome/new')
  } catch (error) {
    if (isRedirectError(error)) throw error

    console.error('Delete user error:', error)
    setErrorCommand('Error deleting user')
    redirect('/account/delete')
  }
}
