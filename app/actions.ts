'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import * as bcrypt from 'bcrypt'
import { getErrorResponse, getUserAttrFromToken } from './api/util'
import * as metronomeDb from '../db/metronome'
import { StoredMetronome } from '../components/metronome/Metronome'
import { NextResponse } from 'next/server'
import * as userDb from '../db/user'
import * as utils from './api/util'

export async function signupServerAction(prevState: any, formData: FormData) {
  const { name, password, passwordRepeat, email, target } = {
    name: formData.get('name')?.toString(),
    password: formData.get('password')?.toString(),
    passwordRepeat: formData.get('passwordRepeat')?.toString(),
    email: formData.get('email')?.toString(),
    target: formData.get('target')?.toString(),
  }

  if (!name || !password) return { message: 'Password or name missing' }

  if (password !== passwordRepeat) return { message: `Passwords don't match` }

  // if (!utils.isEmailValid(email)) {
  //   return NextResponse.json(utils.getErrorResponse(`Invalid email`), {
  //     status: 400,
  //   })
  // }

  const oldUser = await userDb.get(name)

  if (oldUser) {
    return { message: 'User already exists' }
  }

  const encryptedPw = await bcrypt.hash(password, 10)

  const user: userDb.User = await userDb.create({
    name,
    password: encryptedPw,
    email: undefined,
  })

  // if (email) {
  //   const verificationToken = await utils.getJwt(
  //     { userId: user.id!, name },
  //     '10m'
  //   )
  //   utils.sendVerificationMail(user, verificationToken)
  // }

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
  redirect(target ? target : `/metronome/new`)
}

export async function loginServerAction(fprevState: any, payload: FormData) {
  const { name, password, target } = {
    name: payload.get('name')?.toString(),
    password: payload.get('password')?.toString(),
    target: payload.get('target')?.toString(),
  }

  if (!name || !password) {
    return { message: `Password or name missing` }
  }

  const user = await userDb.get(name)

  if (!user) {
    return { message: `User not found` }
  }

  if (!(await bcrypt.compare(password, user.password))) {
    return { message: `Credentials wrong` }
  }

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
  redirect(target ? target : `/metronome/recent`)
}

export async function logoutServerAction() {
  console.log('LOGUT SERVER ACTION')
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

export async function createMetronomeAction(metronome: StoredMetronome) {
  const token = cookies().get('token')?.value
  const userId = await getUserAttrFromToken(token!)
  const savedMetronome = await metronomeDb.create(metronome, userId!)

  const expires = new Date()
  expires.setSeconds(expires.getSeconds() + 3)
  cookies().set({
    name: 'command',
    value: 'created',
    expires,
  })

  if (savedMetronome) {
    return redirect(`/metronome/${savedMetronome.id}`)
  } else {
    return { message: 'Something went wrong' }
  }
}

export async function deleteMetronomeAction(
  metronomeId: number,
  targetPath: string,
) {
  const token = cookies().get('token')?.value
  const userId = await getUserAttrFromToken(token!)

  // TODO replace all this shit by using where clause with metronome + user ID
  const metronome = await metronomeDb.get(Number(metronomeId))

  if (!metronome) {
    return {
      message: `DELETE metronome failed. Metronome ${metronomeDb} not found`,
    }
  }

  if (metronome.owner != userId) {
    return {
      message: `DELETE metronome failed. User ${userId} not allowed to delete metronome ${metronomeDb}`,
    }
  }

  let success = await metronomeDb.deleteMetronome(Number(metronomeId))
  const expires = new Date()
  expires.setSeconds(expires.getSeconds() + 3)
  if (success) {
    cookies().set({
      name: 'command',
      value: 'deleted',
      expires,
    })
    revalidatePath(targetPath)
    redirect(targetPath)
  }
  return {
    message: `Error deleting metronome`,
  }
}

export async function updateServerAction(newMetronome: StoredMetronome) {
  const token = cookies().get('token')?.value
  const userId = await getUserAttrFromToken(token!)

  // TODO replace all this shit by using where clause with metronome + user ID
  const metronome = await metronomeDb.get(newMetronome.id!)

  if (!metronome) {
    return {
      messagen: `PUT metronome failed. The metronome ${metronomeDb} to be updated was not found`,
    }
  }

  if (metronome.owner != userId) {
    return {
      message: `PUT metronome failed. User ${userId} not allowed to write metronome ${metronomeDb}`,
    }
  }

  await metronomeDb.updateMetronome(newMetronome)
  revalidatePath('/', 'layout')
  return { message: 'Metronome updated' }
}

import { get, update } from '../db/user'

export async function updatePasswordServerAction(
  fprevState: any,
  data: FormData,
) {
  const token = cookies().get('token')?.value
  const userName = await getUserAttrFromToken<string>(token, 'name')
  const oldPw = data.get('oldPw')!.toString()
  const newPw = data.get('newPw')!.toString()
  const newPwConfirm = data.get('newPwConfirm')!.toString()

  if (newPw !== newPwConfirm) {
    return { message: `New passwords don't match` }
  }

  const user = await get(userName!)
  if (user) {
    if (!(await bcrypt.compare(oldPw, user.password))) {
      return { message: 'Old password not correct' }
    }
    const encryptedPw = await bcrypt.hash(newPw, 10)
    user!.password = encryptedPw

    await update(user!)

    revalidatePath('/account')
    redirect('/account')
  }

  return { message: `Changing password failed` }
}

export async function createTodo(prevState: any, formData: FormData) {
  try {
    return { message: 'Created' }
  } catch (e) {
    return { message: 'Failed to create' }
  }
}

export async function updateUsernameServerAction(
  fprevState: any,
  data: FormData,
) {
  const token = cookies().get('token')?.value
  const userName = await getUserAttrFromToken<string>(token, 'name')
  const newUsername = data.get('username')!.toString()

  if (userName?.toLowerCase() === newUsername.toLowerCase())
    return { message: `Please pick a new name` }

  if (await get(newUsername)) return { message: `This name is already taken` }

  const user = await get(userName!)
  user!.name = newUsername

  const updatedUser = await update(user!)

  if (updatedUser && updatedUser.name == newUsername) {
    const newToken = await utils.getJwt({
      userId: updatedUser.id!,
      name: updatedUser.name,
    })
    revalidatePath('/account')
    cookies().set({
      name: 'token',
      value: newToken,
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: true,
    })
    redirect('/account')
  }

  return { message: `Changing username failed` }
}

export async function deleteUserServerAction(fprevState: any, data: FormData) {
  const token = cookies().get('token')?.value
  const userName = await getUserAttrFromToken<string>(token, 'name')
  const oldPw = data.get('password')!.toString()
  const user = await get(userName!)

  if (!user) return { message: `User not found` }

  if (!(await bcrypt.compare(oldPw, user.password)))
    return { message: `Password incorrect` }

  try {
    await userDb.remove(user!)
  } catch (e) {
    return { message: `Error deleting user` }
  }

  cookies().set({
    name: 'token',
    value: 'abc',
    secure: true,
    httpOnly: true,
    sameSite: 'lax',
    expires: new Date('January 01, 1970 00:00:00 GMT'),
  })
  const expires = new Date()
  expires.setSeconds(expires.getSeconds() + 3)
  cookies().set({
    name: 'command',
    value: 'userdeleted',
    expires,
  })

  revalidatePath('/')
  revalidatePath('/account')
  revalidatePath('/metronome/new')
  redirect('/metronome/new')
}
