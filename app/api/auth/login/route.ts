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

  const user = await userDb.get(email)

  if (user && (await bcrypt.compare(password, user.password))) {
    user.token = utils.getJwt(user.id!, email)
    return NextResponse.json(user, { status: 200 })
  }
  return NextResponse.json(utils.getErrorResponse(`Invalid Credentials`), {
    status: 400,
  })
}
