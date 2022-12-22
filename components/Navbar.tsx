'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Navbar() {
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
    <nav className="px-4 py-4 border-b-2">
      <div id="navWrapper" className="container mx-auto flex justify-between">
        <div id="controlArea" className="flex space-x-4">
          <button className="px-6 py-2 border-2 border-blue-600 text-blue-600 uppercase rounded-full hover:bg-black hover:bg-opacity-5 focus:outline-none focus:ring-0 transition duration-150 ease-in-out">
            Add
          </button>
        </div>
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
              currentNav == '/list'
                ? activeNav.join(' ')
                : inactiveNav.join(' ')
            }`}
          >
            List
          </Link>
          <Link
            href="about"
            onClick={() => setCurrentNav('/about')}
            className={`select-none ${
              currentNav == '/about'
                ? activeNav.join(' ')
                : inactiveNav.join(' ')
            }`}
          >
            About
          </Link>
        </div>
        <div id="accountArea">
          <button className="px-6 py-2 border-2 border-purple-600 text-purple-600 uppercase rounded-full hover:bg-black hover:bg-opacity-5 focus:outline-none focus:ring-0 transition duration-150 ease-in-out">
            Login
          </button>
        </div>
      </div>
    </nav>
  )
}
