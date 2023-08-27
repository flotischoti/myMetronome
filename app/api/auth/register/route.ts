import { headers } from 'next/headers'
import * as userDb from '../../../../db/user'
import * as utils from '../../util'
import * as bcrypt from 'bcrypt'

import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { name, password }: { name: string; password: string } =
    await request.json()

  if (!name || !password) {
    return NextResponse.json(
      utils.getErrorResponse(`Password or name missing`),
      { status: 400 }
    )
  }

  // if (!utils.isEmailValid(email)) {
  //   return NextResponse.json(utils.getErrorResponse(`Invalid email`), {
  //     status: 400,
  //   })
  // }

  const oldUser = await userDb.get(name)

  if (oldUser) {
    return NextResponse.json(utils.getErrorResponse(`User already exists`), {
      status: 409,
    })
  }

  const encryptedPw = await bcrypt.hash(password, 10)

  const user: userDb.User = await userDb.create({
    name,
    password: encryptedPw,
  })

  user.token = await utils.getJwt({ userId: user.id!, name })

  return NextResponse.json(user, {
    status: 200,
    headers: {
      'Set-Cookie': `token=${user.token};path=/;secure; httpOnly; sameSite=Lax`,
    },
  })
}

export async function GET(request: Request) {
  const headerList = headers()
  return NextResponse.json(headerList.get('x-access-token'))
}
