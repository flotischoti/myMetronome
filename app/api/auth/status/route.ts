import { NextRequest } from 'next/server'
import { verifyToken } from '../../util'

export async function GET(request: NextRequest) {
  const token =
    request.cookies.get('token')?.value || request.headers.get('x-access-token')

  const isLoggedIn = token && (await verifyToken(token))

  return new Response(JSON.stringify({ isLoggedIn }), { status: 200 })
}
