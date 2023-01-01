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
        <Suspense fallback={<Loading />}>{children}</Suspense>
      </body>
    </html>
  )
}
