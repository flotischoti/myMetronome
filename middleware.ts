import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, decodeToken, getJwt } from './lib/jwt'
import { getErrorResponse } from './lib/utils'

/*
                            Token               No Token    
/                       | /metronome/recent     /metronome/new
/metronome/             | /metronome/recent     /metronome/new
/metronome/recent       | next                  /login
/metronome/:id          | next                  /login
/list/                  | next                  /login
/logout                 | next                  /metronome/new
/account/*              | next                  /login
/login                  | /metronome/recent     /login
/register               | /metronome/recent     /register
/reset-password         | /metronome/recent     /reset-password
/reset-password/confirm | /metronome/recent     /reset-password/confirm

*/
const R_PUBLIC_AUTH = [
  '/login',
  '/register',
  '/reset-password',
  '/reset-password/confirm',
]
const R_LANDING = ['', '/', '/metronome', '/metronome/']
const R_NEW = '/metronome/new'
const R_RECENT = '/metronome/recent'

export const config = {
  matcher: [
    '/',
    '/metronome/',
    '/metronome/((?!new)[0-9]+)',
    '/metronome/recent',
    '/list',
    '/login',
    '/register',
    '/logout',
    '/api/metronomes/(.*)',
    '/account',
    '/account/(.*)',
    '/reset(.*)',
  ],
}

function log(hasToken: boolean, source: string, target: string) {
  console.log(
    `Middleware | ${hasToken ? 'With Token' : 'Without Token'} | ${source} ${
      source === target ? 'continue' : 'redirect'
    } to ${target}`,
  )
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

  const path = request.nextUrl.pathname
  const userToken =
    request.cookies.get('token')?.value || request.headers.get('x-access-token')
  const hasValidToken = userToken && (await verifyToken(userToken))

  if (!hasValidToken) {
    // Deny access to metronomes api without token
    if (path.startsWith('/api')) {
      return NextResponse.json(getErrorResponse('Unauthorized'), {
        status: 401,
      })
    }
    // Redirect to correct landing page without token
    if ([...R_LANDING, '/logout'].includes(path)) {
      log(false, path, R_NEW)
      return NextResponse.redirect(new URL(R_NEW, request.url))
    }
    // Forward to auth pages without token
    if (R_PUBLIC_AUTH.includes(path)) {
      log(false, path, path)
      return NextResponse.next({ request: { headers: requestHeaders } })
    }
    // Default: Forward to login page if any protected page is requested without token
    log(false, path, `/login?target=${path}`)
    return NextResponse.redirect(new URL(`/login?target=${path}`, request.url))
  } else {
    const tokenPayload = await decodeToken(userToken)
    const newToken = await getJwt(tokenPayload!)

    // Redirect to landing page if wrong landing page or auth pages are requested with token
    if ([...R_LANDING, ...R_PUBLIC_AUTH].includes(path)) {
      log(true, path, R_RECENT)
      return NextResponse.redirect(new URL(R_RECENT, request.url), {
        headers: requestHeaders,
      })
    }

    // Default: Forward to requested page and refresh token expiry
    console.log(true, path, path)
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
