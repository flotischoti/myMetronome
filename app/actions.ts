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
  const { name, password, email, target } = {
    name: formData.get('name')?.toString(),
    password: formData.get('password')?.toString(),
    email: formData.get('email')?.toString(),
    target: formData.get('target')?.toString(),
  }

  if (!name || !password) {
    return { message: 'Password or name missing' }
  }

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
  console.log(`Executing loginServerAction`)
  const { name, password, target } = {
    name: payload.get('name')?.toString(),
    password: payload.get('password')?.toString(),
    target: payload.get('redirect')?.toString(),
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

  cookies().set({
    name: 'command',
    value: 'created',
    expires: Date.now() + 3000,
  })

  if (savedMetronome) {
    return redirect(`/metronome/${savedMetronome.id}`)
  } else {
    return { message: 'Something went wrong' }
  }
}

export async function deleteMetronomeAction(
  metronomeId: number,
  targetPath: string
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
  if (success) {
    cookies().set({
      name: 'command',
      value: 'deleted',
      expires: Date.now() + 3000,
    })
    revalidatePath('/')
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
