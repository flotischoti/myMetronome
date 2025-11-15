import { NextRequest, NextResponse } from 'next/server'
import {
  getErrorResponse,
  verifyToken,
  decodeToken,
  getJwt,
} from './app/api/util'

/*
                        Token               No Token    
/                   | /metronome/recent     /metronome/new
/metronome/         | /metronome/recent     /metronome/new
/metronome/recent   | next                  /login
/metronome/:id      | next                  /login
/list/              | next                  /login
/logout             | next                  /metronome/new
/account/*          | next                  /login

*/

export const config = {
  matcher: [
    '/',
    '/metronome/',
    '/metronome/((?!new)[0-9]+)',
    '/metronome/recent',
    '/list',
    '/logout',
    '/api/metronomes/(.*)',
    '/account',
    '/account/(.*)',
  ],
}

export async function middleware(request: NextRequest) {
  // Replacing x-forwarded-host was only necessary for azure container app deployment
  const requestHeaders = new Headers(request.headers)
  const forwardedHost = requestHeaders.get('x-forwarded-host')
  const host = requestHeaders.get('host')

  if (forwardedHost === '0.0.0.0:3000' && host) {
    console.log(`🔧 Fixing x-forwarded-host: ${forwardedHost} → ${host}`)
    requestHeaders.set('x-forwarded-host', host)
  }

  const userToken =
    request.cookies.get('token')?.value || request.headers.get('x-access-token')
  if (!userToken || !(await verifyToken(userToken))) {
    if (request.nextUrl.pathname.startsWith('/api')) {
      return NextResponse.json(getErrorResponse('Unauthorized'), {
        status: 401,
      })
    }
    if (
      ['/', '/metronome', '/metronome/', '/logout'].includes(
        request.nextUrl.pathname,
      )
    ) {
      console.log(
        `Middleware | No token | ${request.nextUrl.pathname} to /metronome/new`,
      )
      return NextResponse.redirect(new URL('/metronome/new', request.url))
    }
    console.log(
      `Middleware | No token | ${request.nextUrl.pathname} to /login?target=${request.nextUrl.pathname}`,
    )
    return NextResponse.redirect(
      new URL(`/login?target=${request.nextUrl.pathname}`, request.url),
    )
  } else {
    const tokenPayload = await decodeToken(userToken)
    const newToken = await getJwt(tokenPayload!)

    if (['', '/', '/metronome/'].includes(request.nextUrl.pathname)) {
      console.log(
        `Middleware | Token | ${request.nextUrl.pathname} to /metronome/recent`,
      )
      return NextResponse.redirect(new URL('/metronome/recent', request.url), {
        headers: requestHeaders,
      })
    }

    console.log(
      `Middleware | Token | ${request.nextUrl.pathname} to ${request.nextUrl.pathname}`,
    )
    const response = NextResponse.next({ request: { headers: requestHeaders } })
    const expiry = new Date()
    expiry.setUTCDate(expiry.getUTCDate() + 2)
    response.headers.set(
      'Set-Cookie',
      `token=${newToken};path=/;secure;httpOnly;sameSite=Lax;expires=${expiry}`,
    )
    return response
  }
}
