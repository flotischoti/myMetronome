'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

const Navigation = () => {
  const [currentNav, setCurrentNav] = useState('')

  useEffect(() => {
    setCurrentNav(window.location.pathname)
  }, [])

  const activeNav = ['font-bold']
  const inactiveNav = [
    'hover:cursor-pointer',
    'decoration-pink-600',
    'decoration-4',
    'underline-offset-4',
    'hover:underline',
  ]

  return (
    <div id="navigationArea" className="flex space-x-16 self-center">
      <Link
        href="/"
        onClick={() => setCurrentNav('/')}
        className={`select-none ${
          currentNav == '/' ? activeNav.join(' ') : inactiveNav.join(' ')
        }`}
      >
        Metronome
      </Link>
      <Link
        href="list"
        onClick={() => setCurrentNav('/list')}
        className={`select-none ${
          currentNav == '/list' ? activeNav.join(' ') : inactiveNav.join(' ')
        }`}
      >
        List
      </Link>
      <Link
        href="about"
        onClick={() => setCurrentNav('/about')}
        className={`select-none ${
          currentNav == '/about' ? activeNav.join(' ') : inactiveNav.join(' ')
        }`}
      >
        About
      </Link>
    </div>
  )
}

export default Navigation
