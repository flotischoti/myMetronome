'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import * as bcrypt from 'bcrypt'
import { getUserAttrFromToken } from '../../lib/jwt'
import * as metronomeDb from '../../db/metronome'
import { StoredMetronome } from '../../components/metronome/Metronome'
import * as userDb from '../../db/user'
import * as utils from '../../lib/jwt'
import { setCommand, setErrorCommand, isRedirectError } from './commandHelper'
import { isEmailValid, sendPasswordResetEmail } from '@/lib/mail'

// ========================================
// AUTH ACTIONS
// ========================================

export async function signupServerAction(formData: FormData) {
  const { name, password, email, target, currentPath } = {
    name: formData.get('name')?.toString(),
    password: formData.get('password')?.toString(),
    email: formData.get('email')?.toString(),
    target: formData.get('target')?.toString(),
    currentPath: formData.get('currentPath')?.toString(),
  }

  if (!name || !password) {
    setErrorCommand('Password or name missing')
    redirect(currentPath!)
  }

  const oldUser = await userDb.get(name)
  if (oldUser) {
    setErrorCommand('User already exists')
    redirect(currentPath!)
  }

  if (email && !isEmailValid(email)) {
    setErrorCommand('Invalid email')
    redirect(currentPath!)
  }

  try {
    const encryptedPw = await bcrypt.hash(password, 10)
    const user: userDb.User = await userDb.create({
      name,
      password: encryptedPw,
      email,
    })

    user.token = await utils.getJwt({ userId: user.id!, name, email })

    cookies().set({
      name: 'token',
      value: user.token!,
      path: '/',
      secure: true,
      httpOnly: true,
      sameSite: 'lax',
    })

    revalidatePath('/')
    setCommand('signedUp')
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
    user.token = await utils.getJwt({
      userId: user.id!,
      name,
      email: user.email,
    })
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

    setCommand('loggedIn')
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
      setErrorCommand('Enter new value')
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
        email: updatedUser.email,
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

export async function updateEmailServerAction(data: FormData) {
  try {
    const token = cookies().get('token')?.value
    if (!token) {
      setCommand('unauthorized')
      redirect('/login')
    }

    const payload = await utils.decodeToken(token)
    if (!payload?.name) {
      setCommand('unauthorized')
      redirect('/login')
    }

    const newEMail = data.get('email')?.toString()

    if (payload.email && payload.email === newEMail) {
      setErrorCommand('Enter new value')
      redirect('/account/edit/email')
    }

    if (newEMail && (await userDb.getByMail(newEMail))) {
      setErrorCommand('Update failed')
      redirect('/account/edit/email')
    }

    const user = await userDb.get(payload.name)
    if (!user) {
      setErrorCommand('User not found')
      redirect('/account/edit/email')
    }

    user.email = newEMail
    const updatedUser = await userDb.update(user)

    if (updatedUser && updatedUser.email === newEMail) {
      const newToken = await utils.getJwt({
        userId: updatedUser.id!,
        name: updatedUser.name,
        email: updatedUser.email,
      })

      cookies().set({
        name: 'token',
        value: newToken,
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        secure: true,
      })

      setCommand('emailChanged')
      revalidatePath('/account')
      redirect('/account')
    }

    setErrorCommand('Changing email failed')
    redirect('/account')
  } catch (error) {
    if (isRedirectError(error)) throw error

    console.error('Update email error:', error)
    setErrorCommand('Changing email failed')
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

// ========================================
// REQUEST PASSWORD RESET
// ========================================
export async function requestPasswordResetAction(formData: FormData) {
  try {
    const email = formData.get('email')?.toString()

    if (!email) {
      setErrorCommand('Email required')
      redirect('/reset-password')
    }

    if (!isEmailValid(email)) {
      setErrorCommand('Email invalid')
      redirect('/reset-password')
    }

    const user = await userDb.getByMail(email)

    if (!user) {
      setCommand('resetEmailSent')
      console.log(`Reset Request: No user found for mail ${email}`)
      redirect('/login')
    }

    const resetToken = await utils.getJwt(
      {
        userId: user.id!,
        name: user.name,
        email,
      },
      '1h',
    )

    const emailResult = await sendPasswordResetEmail(email, resetToken)

    if (!emailResult.success) {
      console.error('Failed to send reset email:', emailResult.error)
      setErrorCommand('Mail dispatch failed')
      redirect('/reset-password')
    }

    setCommand('resetEmailSent')
    redirect('/login')
  } catch (error) {
    if (isRedirectError(error)) throw error

    console.error('Password reset request error:', error)
    setErrorCommand('Something went wrong')
    redirect('/reset-password')
  }
}

// ========================================
// CONFIRM PASSWORD RESET
// ========================================
export async function confirmPasswordResetAction(formData: FormData) {
  try {
    const token = formData.get('token')?.toString()
    const newPassword = formData.get('password')?.toString()

    if (!token || !newPassword) {
      setErrorCommand('Password required')
      redirect(`/reset-password/confirm?token=${token}`)
    }

    const payload = await utils.decodeToken(token)

    if (!payload) {
      setErrorCommand('Invalid or expired')
      redirect('/login')
    }

    const user = await userDb.get(`${payload.name}`)

    if (!user) {
      setErrorCommand('User not found')
      redirect('/login')
    }

    if (user.email !== payload.email) {
      setErrorCommand('Invalid reset link')
      redirect('/login')
    }

    // Update Passwort
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    user.password = hashedPassword
    await userDb.update(user)

    cookies().set({
      name: 'token',
      value: '',
      path: '/',
      secure: true,
      httpOnly: true,
      sameSite: 'lax',
      expires: new Date(0),
    })

    setCommand('passwordChanged')
    redirect('/login')
  } catch (error) {
    if (isRedirectError(error)) throw error

    console.error('Password reset confirm error:', error)
    setErrorCommand('Password reset failed')
    redirect('/reset-password')
  }
}
