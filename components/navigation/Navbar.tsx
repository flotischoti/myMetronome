import {
  IconCone2,
  IconMenu2,
  IconPlus,
  IconUserCircle,
} from '@tabler/icons-react'
import Link from 'next/link'
import NavbarAccountDropdown from './NavbarAccountDropdown'
import NavbarLoggedIn from './NavbarLoggedIn'

export default function Navbar({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <div className="navbar bg-base-100 shadow sticky top-0 z-10">
      <div className="flex-1 gap-2">
        <Link
          href="/"
          prefetch={true}
          className="normal-case text-lg sm:text-xl flex items-center gap-1"
        >
          <IconCone2 />
          <h1 className="font-cursive">Metronomes</h1>
        </Link>
        <Link className="btn btn-accent mx-1" href="/metronome/new">
          <IconPlus />
          <span>New</span>
        </Link>
      </div>
      <div className="flex-none">
        {isLoggedIn ? (
          <NavbarLoggedIn />
        ) : (
          <>
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="link sm:hidden">
                <IconUserCircle size="36" stroke="1" />
              </label>
              <NavbarAccountDropdown />
            </div>
            <div className="hidden sm:flex pr-2">
              <Link prefetch={true} href="/login" className="link link-hover">
                Login
              </Link>
              <div className="divider divider-horizontal mx-1"></div>
              <Link
                prefetch={true}
                href="/register"
                className="link link-hover"
              >
                Sign up
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
