import React, { Suspense } from 'react'
import './globals.scss'
import './styles.module.scss'
import '../fontAwesomeConfig'
import Navbar from '../components/navigation/Navbar'
import Loading from './loading'
import { cookies } from 'next/headers'
import { verifyToken } from './api/util'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const token = cookieStore.get('token')
  let isLoggedIn = token && verifyToken(token.value)

  return (
    <html lang="en">
      <head />
      <body>
        <Navbar isLoggedIn={isLoggedIn} />
        <main className="container mx-auto py-4">
          <Suspense fallback={<Loading />}>{children}</Suspense>
        </main>
      </body>
    </html>
  )
}
