import React, { Suspense } from 'react'
import './globals.scss'
import './styles.module.scss'
import Navbar from '../components/navigation/Navbar'
import Loading from './loading'
import { cookies } from 'next/headers'
import Sidebar from '../components/sidebar/Sidebar'
import { getUserAttrFromToken, verifyToken } from './api/util'
import Modal from '../components/searchModal/modal'
import { StoredMetronome } from '../components/metronome/Metronome'
import * as metronomeDb from '../db/metronome'
import { Inter, Pacifico } from 'next/font/google'

export const revalidate = 0
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const pacifico = Pacifico({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-pacifico',
})

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  async function getRecent(
    userId: number
  ): Promise<[number, StoredMetronome[]]> {
    return await metronomeDb.list(userId, 5, 0, 'lastOpened', 'desc', undefined)
  }

  const cookieStore = cookies()
  const token = cookieStore.get('token')
  const userName = await getUserAttrFromToken<string>(token?.value, 'name')
  const userId = await getUserAttrFromToken(token?.value)
  const isLoggedIn = userName ? true : false
  const [count, recentMetronomes] = userId ? await getRecent(userId) : [0, []]

  return (
    <html lang="en" className={`${pacifico.variable} ${inter.variable} `}>
      <head />
      <body className="drawer drawer-end">
        <input id="my-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col h-screen justify-between gap-0">
          <div className="h-full flex flex-col">
            <Navbar isLoggedIn={isLoggedIn} />
            <main className="container mx-auto h-full p-1">
              <Suspense fallback={<Loading />}>{children}</Suspense>
            </main>
          </div>
        </div>
        <Sidebar userName={userName} />
        <Modal recentCount={count} recentMetronomes={recentMetronomes} />
      </body>
    </html>
  )
}
