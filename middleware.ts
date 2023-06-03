import { NextRequest, NextResponse } from 'next/server'
import { getErrorResponse, verifyToken } from './app/api/util'

/*
                        Token               No Token    
/                   | /metronome/recent     /metronome/new
/metronome/         | /metronome/recent     /metronome/new
/metronome/recent   | next                  /login
/metronome/:id      | next                  /login
/list/              | next                  /login
/logout             | next                  /metronome/new

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
  ],
}

export async function middleware(request: NextRequest) {
  const userToken =
    request.cookies.get('token')?.value || request.headers.get('x-access-token')

  console.log(`Token: ${userToken}`)

  if (!userToken || !(await verifyToken(userToken))) {
    console.log(`No token, path: ${request.nextUrl.pathname}`)
    if (request.nextUrl.pathname.startsWith('/api')) {
      return NextResponse.json(getErrorResponse('Unauthorized'), {
        status: 401,
      })
    }

    if (
      ['/', '/metronome', '/metronome/', '/logout'].includes(
        request.nextUrl.pathname
      )
    ) {
      return NextResponse.redirect(new URL('/metronome/new', request.url))
    }

    return NextResponse.redirect(
      new URL(`/login?target=${request.nextUrl.pathname}`, request.url)
    )
  } else {
    if (['', '/', '/metronome/'].includes(request.nextUrl.pathname)) {
      return NextResponse.redirect(new URL('/metronome/recent', request.url))
    }

    return NextResponse.next()
  }
}
