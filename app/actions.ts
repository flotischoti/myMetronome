'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

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
