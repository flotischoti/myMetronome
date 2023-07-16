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

  const user = await userDb.get(name)

  if (user && (await bcrypt.compare(password, user.password))) {
    user.token = await utils.getJwt(user.id!, name)
    return NextResponse.json(user, {
      status: 200,
      headers: {
        'Set-Cookie': `token=${user.token};path=/;secure;httpOnly;sameSite=Lax`,
      },
    })
  }
  return NextResponse.json(utils.getErrorResponse(`Invalid Credentials`), {
    status: 400,
  })
}
