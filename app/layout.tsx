import React, { Suspense } from 'react'
import './globals.scss'
import './styles.module.scss'
import Navbar from '../components/navigation/Navbar'
import Loading from './loading'
import { cookies } from 'next/headers'
import Sidebar from '../components/sidebar/Sidebar'
import { getUserAttrFromToken } from './api/util'
import type { Metadata } from 'next'
import { Inter, Pacifico } from 'next/font/google'
import { Footer } from '@/components/footer/footer'

export const metadata: Metadata = {
  title: 'Metronomes',
  description:
    'Save, update and delete distinguished metronomes to track progress on different songs and excercises',
}

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
  const cookieStore = cookies()
  const token = cookieStore.get('token')
  const userName = await getUserAttrFromToken<string>(token?.value, 'name')

  return (
    <html lang="en" className={`${pacifico.variable} ${inter.variable} h-full`}>
      <head />
      <body className="drawer drawer-end h-full">
        <input id="my-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content h-full">
          <div className="h-full flex flex-col">
            <Navbar />
            <main className="grow">
              <Suspense fallback={<Loading />}>{children}</Suspense>
            </main>
            <Footer />
          </div>
        </div>
        <Sidebar userName={userName} />
      </body>
    </html>
  )
}
