import Link from 'next/link'

export default function Navbar({ isLoggedIn }) {
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
          <Link
            href="/metronome/new"
            className="px-4 text-400 py-2 uppercase bg-zinc-100 shadow-lg"
          >
            New Metronome
          </Link>
        </div>

        <div id="navigationArea" className="flex space-x-16 self-center">
          <Link href="/" className={`select-none ${inactiveNav}`}>
            Home
          </Link>
          {isLoggedIn && (
            <Link href="list" className={`select-none ${inactiveNav}`}>
              List
            </Link>
          )}
          <Link href="about" className={`select-none ${inactiveNav}`}>
            About
          </Link>
        </div>

        <div id="accountArea">
          {isLoggedIn && (
            <Link
              href="/logout"
              className="px-4 text-400 py-2 uppercase bg-zinc-100 shadow-lg"
            >
              Logout
            </Link>
          )}
          {!isLoggedIn && (
            <Link
              href="/register"
              className="px-4 text-400 py-2 uppercase bg-zinc-100 shadow-lg"
            >
              Register
            </Link>
          )}
          {!isLoggedIn && (
            <Link
              href="/login"
              className="px-4 text-400 py-2 uppercase bg-zinc-100 shadow-lg"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
