import React, { Suspense } from 'react'
import './globals.scss'
import './styles.module.scss'
import '../fontAwesomeConfig'
import Navbar from '../components/navigation/Navbar'
import Loading from './loading'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head />
      <body>
        <Navbar />
        <main className="container mx-auto py-4">
          <Suspense fallback={<Loading />}>{children}</Suspense>
        </main>
      </body>
    </html>
  )
}
