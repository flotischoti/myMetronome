import Navigation from './Navigation'
import MainButton from '../shared/Button'
import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="px-4 py-4 border-b-2">
      <div id="navWrapper" className="container mx-auto flex justify-between">
        <div id="controlArea" className="flex space-x-4">
          <Link
            href="/metronome/new"
            className="px-4 text-400 py-2 uppercase bg-zinc-100 shadow-lg"
          >
            Add
          </Link>
        </div>

        <Navigation />

        <div id="accountArea">
          <Link
            href="/logout"
            className="px-4 text-400 py-2 uppercase bg-zinc-100 shadow-lg"
          >
            Logout
          </Link>
          <Link
            href="/register"
            className="px-4 text-400 py-2 uppercase bg-zinc-100 shadow-lg"
          >
            Register
          </Link>
          <Link
            href="/login"
            className="px-4 text-400 py-2 uppercase bg-zinc-100 shadow-lg"
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  )
}
