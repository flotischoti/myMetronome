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
          <MainButton>Login</MainButton>
        </div>
      </div>
    </nav>
  )
}
