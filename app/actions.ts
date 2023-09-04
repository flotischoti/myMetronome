'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { getErrorResponse, getUserAttrFromToken } from './api/util'
import * as metronomeDb from '../db/metronome'
import { StoredMetronome } from '../components/metronome/Metronome'
import { NextResponse } from 'next/server'

export async function loginServerAction(formData: FormData) {
  console.log(`Executing loginServerAction`)
  const data = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const response = await fetch(`http://localhost:3000/api/auth/login/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  const result = await response.json()

  if (response.status == 200) {
    // revalidatePath('/')

    cookies().set({
      name: 'token',
      value: result.token,
      path: '/',
      secure: true,
      httpOnly: true,
      sameSite: 'lax',
    })
  }

  return { status: response.status, text: result.text }
}

export async function logoutServerAction() {
  // revalidatePath('/')

  cookies().set({
    name: 'token',
    value: 'abc',
    path: '/',
    secure: true,
    httpOnly: true,
    sameSite: 'lax',
    expires: 0,
  })

  return { status: 204, text: '' }
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
    return { status: 500, message: 'Something went wrong' }
  }
}

export async function deleteMetronomeAction(metronomeId: number) {
  const token = cookies().get('token')?.value
  const userId = await getUserAttrFromToken(token!)

  // TODO replace all this shit by using where clause with metronome + user ID
  const metronome = await metronomeDb.get(Number(metronomeId))

  if (!metronome) {
    return {
      status: 404,
      message: `DELETE metronome failed. Metronome ${metronomeDb} not found`,
    }
  }

  if (metronome.owner != userId) {
    return {
      status: 401,
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
    redirect(`/metronome/new`)
  }
  return {
    status: 500,
    message: `Error deleting metronome with Id: ${metronomeId}`,
  }
}
