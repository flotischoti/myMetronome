import React, { Suspense } from 'react'
import './globals.scss'
import './styles.module.scss'
import '../fontAwesomeConfig'
import Navbar from '../components/navigation/Navbar'
import Loading from './loading'
import { cookies } from 'next/headers'
import Sidebar from '../components/sidebar/Sidebar'
import Footer from '../components/footer/Footer'

async function isUserLoggedIn(token: string) {
  const res = await fetch('http://localhost:3000/api/auth/status', {
    cache: 'no-store',
    headers: {
      'x-access-token': token,
    },
  })

  const test = await fetch(
    'http://worldtimeapi.org/api/timezone/Europe/Berlin',
    {
      cache: 'no-store',
    }
  )
  if (!res.ok) {
    console.log(res.status)
    throw new Error(`Failed to check login status`)
  }

  const isLoggedIn = await res.json()
  return isLoggedIn
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const token = cookieStore.get('token')
  let isLoggedIn = token && (await isUserLoggedIn(token.value))

  return (
    <html lang="en">
      <head />
      <body className="drawer drawer-end">
        <input id="my-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col h-screen justify-between">
          <div>
            <Navbar isLoggedIn={isLoggedIn} />
            <main className="container mx-auto py-4">
              <Suspense fallback={<Loading />}>{children}</Suspense>
            </main>
          </div>
          <Footer />
        </div>
        <Sidebar />
      </body>
    </html>
  )
}
