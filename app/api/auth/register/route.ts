import * as userDb from '../../../../db/user'
import * as utils from '../../util'
import * as bcrypt from 'bcrypt'

import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { email, password }: { email: string; password: string } =
    await request.json()

  if (!email || !password) {
    return NextResponse.json(
      utils.getErrorResponse(`Password or email missing`),
      { status: 400 }
    )
  }

  if (!utils.isEmailValid(email)) {
    return NextResponse.json(utils.getErrorResponse(`Invalid email`), {
      status: 400,
    })
  }

  const oldUser = await userDb.get(email)

  if (oldUser) {
    return NextResponse.json(utils.getErrorResponse(`User already exists`), {
      status: 409,
    })
  }

  const encryptedPw = await bcrypt.hash(password, 10)

  const user: userDb.User = await userDb.create({
    email,
    password: encryptedPw,
  })

  user.token = utils.getJwt(user.id!, email)

  return NextResponse.json(user, { status: 200 })
}
