import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { getErrorResponse } from './app/api/util'

/*
                        Token               No Token    
/                   | /metronome/recent     /metronome/new
/metronome/         | /metronome/recent     /metronome/new
/metronome/recent   | next                  /login
/metronome/:id      | next                  /login
/list/              | next                  /login

*/

export const config = {
  matcher: [
    '/',
    '/metronome/',
    '/metronome/((?!new)[0-9]+)',
    '/metronome/recent',
    '/list',
    '/api/users/(.*)',
  ],
}

export async function middleware(request: NextRequest) {
  const userToken = request.cookies.get('token')?.value

  console.log(`Token: ${userToken}`)

  if (!userToken || !verifyToken(userToken)) {
    if (request.nextUrl.pathname.startsWith('/api')) {
      console.log(`No token, path: ${request.nextUrl.pathname}`)
      return NextResponse.json(getErrorResponse('Unauthorized'), {
        status: 401,
      })
    }

    if (['/', '/metronome', '/metronome/'].includes(request.nextUrl.pathname)) {
      console.log(`No token, path: ${request.nextUrl.pathname}`)
      return NextResponse.redirect(new URL('/metronome/new', request.url))
    }

    console.log(`No token, path: ${request.nextUrl.pathname}`)
    return NextResponse.redirect(new URL('/login', request.url))
  } else {
    if (['', '/', '/metronome/'].includes(request.nextUrl.pathname)) {
      return NextResponse.redirect(new URL('/metronome/recent', request.url))
    }

    return NextResponse.next()
  }
}

function verifyToken(token: string) {
  try {
    jwt.verify(token, process.env.TOKEN_KEY!)
    return true
  } catch (err) {
    return false
  }
}
