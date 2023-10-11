import React, { Suspense } from 'react'
import './globals.scss'
import './styles.module.scss'
import Navbar from '../components/navigation/Navbar'
import Loading from './loading'
import { cookies } from 'next/headers'
import Sidebar from '../components/sidebar/Sidebar'
import Footer from '../components/footer/Footer'
import { getUserAttrFromToken, verifyToken } from './api/util'
import Modal from '../components/searchModal/modal'
import { StoredMetronome } from '../components/metronome/Metronome'
import * as metronomeDb from '../db/metronome'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  async function getRecent(
    userId: number
  ): Promise<[number, StoredMetronome[]]> {
    return await metronomeDb.list(userId, 5, 0, 'lastOpened', 'desc', null)
  }

  const cookieStore = cookies()
  const token = cookieStore.get('token')
  const userName = await getUserAttrFromToken<string>(token?.value, 'name')
  const userId = await getUserAttrFromToken(token?.value)
  const isLoggedIn = userName ? true : false
  const [count, recentMetronomes] = userId ? await getRecent(userId) : [0, []]

  return (
    <html lang="en">
      <head />
      <body className="drawer drawer-end">
        <input id="my-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col h-screen justify-between gap-0">
          <div className="h-full flex flex-col">
            <Navbar isLoggedIn={isLoggedIn} />
            <main className="container mx-auto h-full p-2">
              <Suspense fallback={<Loading />}>{children}</Suspense>
            </main>
          </div>
          <Footer />
        </div>
        <Sidebar userName={userName} />
        <Modal recentCount={count} recentMetronomes={recentMetronomes} />
      </body>
    </html>
  )
}
